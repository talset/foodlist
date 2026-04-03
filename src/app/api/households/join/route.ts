import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const userId = session.user.id

  const [existing] = await pool.query<any[]>(
    'SELECT household_id FROM household_members WHERE user_id = ?',
    [userId]
  )
  if ((existing as any[]).length) {
    return NextResponse.json({ error: 'ALREADY_IN_HOUSEHOLD' }, { status: 400 })
  }

  const body = await req.json()
  const { token } = body ?? {}
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const [households] = await pool.query<any[]>(
    'SELECT id, name FROM households WHERE invite_token = ?',
    [token]
  )
  if (!(households as any[]).length) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 404 })
  }
  const household = (households as any[])[0]

  await pool.query(
    'INSERT IGNORE INTO household_members (household_id, user_id, role) VALUES (?, ?, ?)',
    [household.id, userId, 'member']
  )

  return NextResponse.json({ householdId: household.id, householdName: household.name })
}
