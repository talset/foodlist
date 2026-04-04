import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { iconUrl } from '@/lib/icon'
import type { ApiStockItem } from '@/types'

const VALID_STATUSES = ['in_stock', 'low', 'out_of_stock']

function toApiStockItem(row: any, theme?: string): ApiStockItem {
  return {
    id: row.id,
    product_id: row.product_id,
    product_name: row.product_name,
    category_id: row.category_id,
    category_name: row.category_name,
    ref_unit: row.ref_unit,
    icon_url: iconUrl(row.icon_ref, theme),
    quantity: row.quantity,
    status: row.status,
    updated_at: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at),
  }
}

const SELECT_STOCK = `
  SELECT s.id, s.product_id, s.quantity, s.status, s.updated_at,
         p.name AS product_name, p.icon_ref, p.ref_unit,
         p.category_id, c.name AS category_name, c.sort_order
  FROM stock s
  JOIN products   p ON p.id = s.product_id
  JOIN categories c ON c.id = p.category_id
`

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const conditions = ['s.household_id = ?']
  const values: any[] = [session.user.householdId]

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 })
    }
    conditions.push('s.status = ?')
    values.push(status)
  }

  const [rows] = await pool.query<any[]>(
    `${SELECT_STOCK} WHERE ${conditions.join(' AND ')} ORDER BY c.sort_order, c.name, p.name`,
    values
  )

  const theme = session.user.iconTheme
  return NextResponse.json({ items: (rows as any[]).map(r => toApiStockItem(r, theme)) })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const body = await req.json()
  const { product_id, quantity = 0, status = 'in_stock' } = body ?? {}

  if (!product_id || typeof product_id !== 'number') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (typeof quantity !== 'number' || quantity < 0) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 })
  }

  const [prods] = await pool.query<any[]>('SELECT id FROM products WHERE id = ?', [product_id])
  if (!(prods as any[]).length) {
    return NextResponse.json({ error: 'PRODUCT_NOT_FOUND' }, { status: 400 })
  }

  try {
    const [result] = await pool.query<any>(
      'INSERT INTO stock (product_id, household_id, quantity, status, updated_by) VALUES (?, ?, ?, ?, ?)',
      [product_id, session.user.householdId, quantity, status, session.user.id]
    )

    const [rows] = await pool.query<any[]>(
      `${SELECT_STOCK} WHERE s.id = ?`,
      [result.insertId]
    )

    return NextResponse.json(toApiStockItem((rows as any[])[0], session.user.iconTheme), { status: 201 })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'STOCK_ITEM_EXISTS' }, { status: 409 })
    }
    throw err
  }
}
