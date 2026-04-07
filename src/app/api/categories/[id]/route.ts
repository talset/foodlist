import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const body = await req.json()
  const { name } = body ?? {}
  if (!name || typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  try {
    const [result] = await pool.query<any>(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name.trim(), id]
    )
    if (result.affectedRows === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ id, name: name.trim() })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'CATEGORY_EXISTS' }, { status: 409 })
    }
    throw err
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const [count] = await pool.query<any[]>(
    'SELECT COUNT(*) AS cnt FROM products WHERE category_id = ?',
    [id]
  )
  if ((count as any[])[0].cnt > 0) {
    return NextResponse.json({ error: 'CATEGORY_NOT_EMPTY' }, { status: 409 })
  }

  const [result] = await pool.query<any>('DELETE FROM categories WHERE id = ?', [id])
  if (result.affectedRows === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  return new Response(null, { status: 204 })
}
