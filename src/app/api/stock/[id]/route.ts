import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import type { ApiStockItem } from '@/types'

const VALID_STATUSES = ['in_stock', 'low', 'out_of_stock', 'shopping_list']

function toApiStockItem(row: any): ApiStockItem {
  return {
    id: row.id,
    product_id: row.product_id,
    product_name: row.product_name,
    category_id: row.category_id,
    category_name: row.category_name,
    ref_unit: row.ref_unit,
    icon_url: row.icon_ref ? `/api/icons/${row.icon_ref}` : null,
    quantity: row.quantity,
    unit: row.unit,
    status: row.status,
    updated_at: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at),
  }
}

const SELECT_STOCK = `
  SELECT s.id, s.product_id, s.quantity, s.unit, s.status, s.updated_at,
         p.name AS product_name, p.icon_ref, p.ref_unit,
         p.category_id, c.name AS category_name, c.sort_order
  FROM stock s
  JOIN products   p ON p.id = s.product_id
  JOIN categories c ON c.id = p.category_id
`

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const body = await req.json()
  const { quantity, unit, status } = body ?? {}

  const sets: string[] = []
  const values: any[] = []

  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    sets.push('quantity = ?')
    values.push(quantity)
  }
  if (unit !== undefined) {
    if (typeof unit !== 'string' || !unit.trim()) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    sets.push('unit = ?')
    values.push(unit.trim())
  }
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 })
    }
    sets.push('status = ?')
    values.push(status)
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'NOTHING_TO_UPDATE' }, { status: 400 })
  }

  sets.push('updated_by = ?')
  values.push(session.user.id, id, session.user.householdId)

  const [result] = await pool.query<any>(
    `UPDATE stock SET ${sets.join(', ')} WHERE id = ? AND household_id = ?`,
    values
  )

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const [rows] = await pool.query<any[]>(`${SELECT_STOCK} WHERE s.id = ?`, [id])
  return NextResponse.json(toApiStockItem((rows as any[])[0]))
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const [result] = await pool.query<any>(
    'DELETE FROM stock WHERE id = ? AND household_id = ?',
    [id, session.user.householdId]
  )

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}
