import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password, name, invite_token } = body ?? {}

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 })
  }

  // Determine if this is the first user (bootstrap) or an invited user
  const [[{ count }]] = await pool.query<any[]>('SELECT COUNT(*) as count FROM users')
  const isFirstUser = Number(count) === 0

  let householdId: number | null = null

  if (!isFirstUser) {
    if (!invite_token || typeof invite_token !== 'string') {
      return NextResponse.json({ error: 'INVITE_REQUIRED' }, { status: 403 })
    }
    const [households] = await pool.query<any[]>(
      'SELECT id FROM households WHERE invite_token = ?',
      [invite_token]
    )
    if (!households.length) {
      return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 })
    }
    householdId = households[0].id
  }

  const [existing] = await pool.query<any[]>('SELECT id FROM users WHERE email = ?', [email])
  if ((existing as any[]).length) {
    return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 12)
  const [result] = await pool.query<any>(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [email, password_hash, name.trim()]
  )
  const userId = result.insertId

  // Auto-join the household when registering via invite link
  if (householdId !== null) {
    await pool.query(
      'INSERT INTO household_members (household_id, user_id, role) VALUES (?, ?, ?)',
      [householdId, userId, 'member']
    )
  }

  return NextResponse.json(
    { id: userId, email, name: name.trim() },
    { status: 201 }
  )
}
