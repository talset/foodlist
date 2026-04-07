import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomBytes } from 'crypto'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function makeInviteLink(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return `${base}/register?token=${token}`
}

export async function DELETE(_req: Request, props: { params: Promise<{  id: string  }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const householdId = parseInt(params.id)
  if (isNaN(householdId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  // Delete dependent data first
  await pool.query('DELETE FROM shopping_recipes WHERE household_id = ?', [householdId])
  await pool.query('DELETE FROM stock WHERE household_id = ?', [householdId])
  await pool.query('DELETE FROM household_members WHERE household_id = ?', [householdId])
  await pool.query('DELETE FROM households WHERE id = ?', [householdId])

  return new Response(null, { status: 204 })
}

export async function PATCH(_req: Request, props: { params: Promise<{  id: string  }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const householdId = parseInt(params.id)
  if (isNaN(householdId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const newToken = randomBytes(32).toString('hex')
  const [result] = await pool.query<any>(
    'UPDATE households SET invite_token = ? WHERE id = ?',
    [newToken, householdId]
  )
  if ((result as any).affectedRows === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({
    inviteToken: newToken,
    inviteLink: makeInviteLink(newToken),
  })
}
