import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const [rows] = await pool.query<any[]>(
    'SELECT id, name, is_default, sort_order FROM categories ORDER BY sort_order, name'
  )

  return NextResponse.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    is_default: Boolean(r.is_default),
    sort_order: r.sort_order,
  })))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const { name } = body ?? {}

  if (!name || typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  try {
    const [result] = await pool.query<any>(
      'INSERT INTO categories (name, is_default, sort_order) VALUES (?, 0, 999)',
      [name.trim()]
    )
    return NextResponse.json(
      { id: result.insertId, name: name.trim(), is_default: false, sort_order: 999 },
      { status: 201 }
    )
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'CATEGORY_EXISTS' }, { status: 409 })
    }
    throw err
  }
}
