import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomBytes } from 'crypto'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const userId = session.user.id

  // Check user doesn't already belong to a household
  const [existing] = await pool.query<any[]>(
    'SELECT household_id FROM household_members WHERE user_id = ?',
    [userId]
  )
  if ((existing as any[]).length) {
    return NextResponse.json({ error: 'ALREADY_IN_HOUSEHOLD' }, { status: 400 })
  }

  const body = await req.json()
  const { name } = body ?? {}
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const invite_token = randomBytes(32).toString('hex')

  const [result] = await pool.query<any>(
    'INSERT INTO households (name, created_by, invite_token) VALUES (?, ?, ?)',
    [name.trim(), userId, invite_token]
  )
  const householdId = result.insertId

  await pool.query(
    'INSERT INTO household_members (household_id, user_id, role) VALUES (?, ?, ?)',
    [householdId, userId, 'admin']
  )

  return NextResponse.json(
    { id: householdId, name: name.trim(), invite_token },
    { status: 201 }
  )
}
