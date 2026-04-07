import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { broadcast } from '@/lib/sse'

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const { recipe_id } = await req.json()
  if (!recipe_id || typeof recipe_id !== 'number') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  await pool.query(
    'DELETE FROM shopping_recipes WHERE recipe_id = ? AND household_id = ?',
    [recipe_id, session.user.householdId]
  )

  broadcast(session.user.householdId, 'shopping_updated')
  return new Response(null, { status: 204 })
}
