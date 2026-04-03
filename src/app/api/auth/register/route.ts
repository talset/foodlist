import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password, name } = body ?? {}

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

  const [existing] = await pool.query<any[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  )
  if ((existing as any[]).length) {
    return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 12)
  const [result] = await pool.query<any>(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [email, password_hash, name.trim()]
  )

  return NextResponse.json(
    { id: result.insertId, email, name: name.trim() },
    { status: 201 }
  )
}
