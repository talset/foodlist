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

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const [households] = await pool.query<any[]>(
    'SELECT id, name, created_at, invite_token FROM households ORDER BY created_at ASC'
  )

  const [members] = await pool.query<any[]>(`
    SELECT hm.household_id, hm.user_id, hm.role, hm.joined_at,
           u.name AS user_name, u.email AS user_email
    FROM household_members hm
    JOIN users u ON u.id = hm.user_id
  `)

  const membersByHousehold: Record<number, any[]> = {}
  for (const m of members as any[]) {
    if (!membersByHousehold[m.household_id]) membersByHousehold[m.household_id] = []
    membersByHousehold[m.household_id].push({
      userId: m.user_id,
      userName: m.user_name,
      userEmail: m.user_email,
      role: m.role,
      joinedAt: m.joined_at instanceof Date ? m.joined_at.toISOString() : String(m.joined_at),
    })
  }

  return NextResponse.json(
    (households as any[]).map(h => ({
      id: h.id,
      name: h.name,
      createdAt: h.created_at instanceof Date ? h.created_at.toISOString() : String(h.created_at),
      inviteToken: h.invite_token,
      inviteLink: makeInviteLink(h.invite_token),
      members: membersByHousehold[h.id] ?? [],
    }))
  )
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const body = await req.json()
  const { name } = body ?? {}

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const inviteToken = randomBytes(32).toString('hex')
  const [result] = await pool.query<any>(
    'INSERT INTO households (name, created_by, invite_token) VALUES (?, ?, ?)',
    [name.trim(), session.user.id, inviteToken]
  )

  return NextResponse.json({
    id: result.insertId,
    name: name.trim(),
    inviteToken,
    inviteLink: makeInviteLink(inviteToken),
  }, { status: 201 })
}
