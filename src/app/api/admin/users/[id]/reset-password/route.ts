import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const userId = parseInt(params.id)
  if (isNaN(userId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  // Verify user exists
  const [[user]] = await pool.query<any[]>('SELECT id, name, email FROM users WHERE id = ?', [userId])
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  // Delete any existing tokens for this user
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId])

  // Generate token (48 bytes = 64 chars base64url)
  const token = crypto.randomBytes(48).toString('base64url')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  )

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const resetLink = `${baseUrl}/reset-password?token=${token}`

  return NextResponse.json({ resetLink, userName: user.name, userEmail: user.email })
}
