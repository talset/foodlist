import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string; userId: string }> }
) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const householdId = parseInt(params.id)
  const userId = parseInt(params.userId)
  if (isNaN(householdId) || isNaN(userId)) {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  await pool.query(
    'DELETE FROM household_members WHERE household_id = ? AND user_id = ?',
    [householdId, userId]
  )

  return new Response(null, { status: 204 })
}
