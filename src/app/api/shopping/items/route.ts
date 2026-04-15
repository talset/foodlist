import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { broadcast } from '@/lib/sse'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const [rows] = await pool.query<any[]>(
    'SELECT id, name, added_at FROM shopping_items WHERE household_id = ? ORDER BY added_at',
    [session.user.householdId]
  )
  return NextResponse.json({ items: rows })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const { name } = await req.json()
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const [result] = await pool.query<any>(
    'INSERT INTO shopping_items (household_id, name, added_by) VALUES (?, ?, ?)',
    [session.user.householdId, name.trim(), session.user.id]
  )

  broadcast(session.user.householdId, 'shopping_updated')
  return NextResponse.json({ id: result.insertId, name: name.trim() }, { status: 201 })
}
