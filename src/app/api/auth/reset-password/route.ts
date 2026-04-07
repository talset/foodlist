import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 })
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })
  }

  // Find the token
  const [rows] = await pool.query<any[]>(
    'SELECT id, user_id, expires_at FROM password_reset_tokens WHERE token = ?',
    [token]
  )

  if (!rows.length) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 })
  }

  const resetToken = rows[0]

  if (new Date(resetToken.expires_at) < new Date()) {
    // Clean up expired token
    await pool.query('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id])
    return NextResponse.json({ error: 'TOKEN_EXPIRED' }, { status: 400 })
  }

  // Update password
  const hash = await bcrypt.hash(password, 10)
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, resetToken.user_id])

  // Delete all tokens for this user (single-use)
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [resetToken.user_id])

  return NextResponse.json({ ok: true })
}
