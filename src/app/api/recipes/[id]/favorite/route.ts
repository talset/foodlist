import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const recipeId = parseInt(params.id)
  if (isNaN(recipeId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  await pool.query(
    'INSERT IGNORE INTO recipe_favorites (user_id, recipe_id) VALUES (?, ?)',
    [session.user.id, recipeId]
  )

  return NextResponse.json({ is_favorite: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const recipeId = parseInt(params.id)
  if (isNaN(recipeId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  await pool.query(
    'DELETE FROM recipe_favorites WHERE user_id = ? AND recipe_id = ?',
    [session.user.id, recipeId]
  )

  return NextResponse.json({ is_favorite: false })
}
