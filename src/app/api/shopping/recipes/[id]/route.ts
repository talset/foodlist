import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const [result] = await pool.query<any>(
    'DELETE FROM shopping_recipes WHERE id = ? AND household_id = ?',
    [id, session.user.householdId]
  )

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}
