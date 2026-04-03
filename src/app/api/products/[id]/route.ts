import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import type { ApiProduct } from '@/types'

function toApiProduct(row: any): ApiProduct {
  return {
    id: row.id,
    name: row.name,
    category_id: row.category_id,
    category_name: row.category_name,
    ref_unit: row.ref_unit,
    ref_quantity: parseFloat(row.ref_quantity),
    icon_ref: row.icon_ref,
    icon_url: row.icon_ref ? `/api/icons/${row.icon_ref}` : null,
  }
}

async function fetchProduct(id: number): Promise<any | null> {
  const [rows] = await pool.query<any[]>(
    `SELECT p.id, p.name, p.category_id, c.name AS category_name,
            p.ref_unit, p.ref_quantity, p.icon_ref
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?`,
    [id]
  )
  return (rows as any[])[0] ?? null
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const row = await fetchProduct(id)
  if (!row) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  return NextResponse.json(toApiProduct(row))
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const body = await req.json()
  const { name, category_id, ref_unit, ref_quantity, icon_ref } = body ?? {}

  const sets: string[] = []
  const values: any[] = []

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 255) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    sets.push('name = ?')
    values.push(name.trim())
  }
  if (category_id !== undefined) {
    if (typeof category_id !== 'number') return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    sets.push('category_id = ?')
    values.push(category_id)
  }
  if (ref_unit !== undefined) {
    if (typeof ref_unit !== 'string' || !ref_unit.trim()) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    sets.push('ref_unit = ?')
    values.push(ref_unit.trim())
  }
  if (ref_quantity !== undefined) {
    if (typeof ref_quantity !== 'number' || ref_quantity <= 0) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    sets.push('ref_quantity = ?')
    values.push(ref_quantity)
  }
  if (icon_ref !== undefined) {
    sets.push('icon_ref = ?')
    values.push(icon_ref)
  }

  if (!sets.length) return NextResponse.json({ error: 'NOTHING_TO_UPDATE' }, { status: 400 })

  try {
    const [result] = await pool.query<any>(
      `UPDATE products SET ${sets.join(', ')} WHERE id = ?`,
      [...values, id]
    )
    if (result.affectedRows === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'PRODUCT_EXISTS' }, { status: 409 })
    throw err
  }

  const row = await fetchProduct(id)
  return NextResponse.json(toApiProduct(row))
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  try {
    const [result] = await pool.query<any>('DELETE FROM products WHERE id = ?', [id])
    if (result.affectedRows === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    return new Response(null, { status: 204 })
  } catch (err: any) {
    if (err.errno === 1451) return NextResponse.json({ error: 'PRODUCT_IN_USE' }, { status: 409 })
    throw err
  }
}
