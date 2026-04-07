import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, props: { params: Promise<{  id: string  }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const targetId = parseInt(params.id)
  if (isNaN(targetId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const body = await req.json()
  const { isAdmin } = body ?? {}

  if (typeof isAdmin !== 'boolean') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  // Cannot remove admin from yourself
  if (!isAdmin && session.user.id === targetId) {
    return NextResponse.json({ error: 'CANNOT_REMOVE_OWN_ADMIN' }, { status: 400 })
  }

  // Cannot remove admin if only one admin left
  if (!isAdmin) {
    const [[{ adminCount }]] = await pool.query<any[]>(
      'SELECT COUNT(*) AS adminCount FROM users WHERE is_admin = 1'
    )
    if (Number(adminCount) <= 1) {
      return NextResponse.json({ error: 'LAST_ADMIN' }, { status: 400 })
    }
  }

  await pool.query('UPDATE users SET is_admin = ? WHERE id = ?', [isAdmin ? 1 : 0, targetId])

  const [rows] = await pool.query<any[]>(
    'SELECT id, name, email, is_admin FROM users WHERE id = ?',
    [targetId]
  )
  const u = (rows as any[])[0]
  if (!u) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  return NextResponse.json({ id: u.id, name: u.name, email: u.email, isAdmin: Boolean(u.is_admin) })
}

export async function DELETE(_req: Request, props: { params: Promise<{  id: string  }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const targetId = parseInt(params.id)
  if (isNaN(targetId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  // Cannot delete yourself
  if (session.user.id === targetId) {
    return NextResponse.json({ error: 'CANNOT_DELETE_SELF' }, { status: 400 })
  }

  try {
    await pool.query('DELETE FROM household_members WHERE user_id = ?', [targetId])
    await pool.query('DELETE FROM users WHERE id = ?', [targetId])
    return new Response(null, { status: 204 })
  } catch (err: any) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return NextResponse.json({ error: 'USER_HAS_REFERENCES', message: 'Impossible de supprimer : l\'utilisateur a des recettes ou d\'autres données associées.' }, { status: 400 })
    }
    throw err
  }
}
