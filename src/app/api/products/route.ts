import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { iconUrl } from '@/lib/icon'
import { defaultIconRef } from '@/lib/search'
import type { ApiProduct } from '@/types'

function toApiProduct(row: any, theme?: string): ApiProduct {
  return {
    id: row.id,
    name: row.name,
    category_id: row.category_id,
    category_name: row.category_name,
    ref_unit: row.ref_unit,
    ref_quantity: parseFloat(row.ref_quantity),
    icon_ref: row.icon_ref,
    icon_url: iconUrl(row.icon_ref, theme),
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const categoryId = searchParams.get('category_id')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 1000)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const conditions: string[] = []
  const values: any[] = []

  if (q) {
    conditions.push('p.name LIKE ?')
    values.push(`%${q}%`)
  }
  if (categoryId) {
    conditions.push('p.category_id = ?')
    values.push(parseInt(categoryId))
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const [rows] = await pool.query<any[]>(
    `SELECT p.id, p.name, p.category_id, c.name AS category_name,
            p.ref_unit, p.ref_quantity, p.icon_ref
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ${where}
     ORDER BY p.name
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  )

  const [[{ total }]] = await pool.query<any[]>(
    `SELECT COUNT(*) AS total FROM products p ${where}`,
    values
  )

  const theme = session.user.iconTheme
  return NextResponse.json({ products: rows.map(r => toApiProduct(r, theme)), total })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const { name, category_id, ref_unit, ref_quantity, icon_ref } = body ?? {}

  if (!name || typeof name !== 'string' || !name.trim() || name.trim().length > 255) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (!category_id || typeof category_id !== 'number') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (!ref_unit || typeof ref_unit !== 'string' || !ref_unit.trim()) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (typeof ref_quantity !== 'number' || ref_quantity <= 0) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const [cats] = await pool.query<any[]>('SELECT id FROM categories WHERE id = ?', [category_id])
  if (!(cats as any[]).length) {
    return NextResponse.json({ error: 'CATEGORY_NOT_FOUND' }, { status: 400 })
  }

  try {
    const [result] = await pool.query<any>(
      'INSERT INTO products (name, category_id, ref_unit, ref_quantity, icon_ref, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), category_id, ref_unit.trim(), ref_quantity, icon_ref || defaultIconRef(name), session.user.id]
    )

    const [rows] = await pool.query<any[]>(
      `SELECT p.id, p.name, p.category_id, c.name AS category_name,
              p.ref_unit, p.ref_quantity, p.icon_ref
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [result.insertId]
    )

    return NextResponse.json(toApiProduct((rows as any[])[0], session.user.iconTheme), { status: 201 })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'PRODUCT_EXISTS' }, { status: 409 })
    }
    throw err
  }
}
