import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { broadcast } from '@/lib/sse'

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const { id } = await props.params
  const [result] = await pool.query<any>(
    'DELETE FROM shopping_items WHERE id = ? AND household_id = ?',
    [id, session.user.householdId]
  )

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  broadcast(session.user.householdId, 'shopping_updated')
  return new Response(null, { status: 204 })
}
