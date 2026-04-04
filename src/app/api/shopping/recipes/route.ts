import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { broadcast } from '@/lib/sse'
import type { ApiShoppingRecipe } from '@/types'

function toApiShoppingRecipe(row: any): ApiShoppingRecipe {
  return {
    id: row.id,
    recipe_id: row.recipe_id,
    recipe_name: row.recipe_name,
    base_servings: row.base_servings,
    multiplier: parseFloat(row.multiplier),
    added_at: row.added_at instanceof Date ? row.added_at.toISOString() : String(row.added_at),
    ingredient_count: Number(row.ingredient_count),
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const [rows] = await pool.query<any[]>(
    `SELECT sr.id, sr.recipe_id, sr.multiplier, sr.added_at,
            r.name AS recipe_name, r.base_servings,
            COUNT(ri.id) AS ingredient_count
     FROM shopping_recipes sr
     JOIN recipes r ON r.id = sr.recipe_id
     LEFT JOIN recipe_ingredients ri ON ri.recipe_id = sr.recipe_id
     WHERE sr.household_id = ?
     GROUP BY sr.id
     ORDER BY sr.added_at DESC`,
    [session.user.householdId]
  )

  return NextResponse.json({ items: (rows as any[]).map(toApiShoppingRecipe) })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const body = await req.json()
  const { recipe_id, multiplier = 1 } = body ?? {}

  if (!recipe_id || typeof recipe_id !== 'number') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (typeof multiplier !== 'number' || multiplier <= 0 || multiplier > 999.99) {
    return NextResponse.json({ error: 'INVALID_MULTIPLIER' }, { status: 400 })
  }

  const [[recipe]] = await pool.query<any[]>('SELECT id, name, base_servings FROM recipes WHERE id = ?', [recipe_id])
  if (!recipe) return NextResponse.json({ error: 'RECIPE_NOT_FOUND' }, { status: 400 })

  const [result] = await pool.query<any>(
    'INSERT INTO shopping_recipes (household_id, recipe_id, multiplier, added_by) VALUES (?, ?, ?, ?)',
    [session.user.householdId, recipe_id, multiplier, session.user.id]
  )

  const [[row]] = await pool.query<any[]>(
    `SELECT sr.id, sr.recipe_id, sr.multiplier, sr.added_at,
            r.name AS recipe_name, r.base_servings,
            COUNT(ri.id) AS ingredient_count
     FROM shopping_recipes sr
     JOIN recipes r ON r.id = sr.recipe_id
     LEFT JOIN recipe_ingredients ri ON ri.recipe_id = sr.recipe_id
     WHERE sr.id = ?
     GROUP BY sr.id`,
    [result.insertId]
  )

  broadcast(session.user.householdId, 'shopping_updated')
  return NextResponse.json(toApiShoppingRecipe(row), { status: 201 })
}
