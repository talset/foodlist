import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import type { ApiRecipe, ApiRecipeDetail, RecipeFeasibility } from '@/types'

function toApiRecipe(row: any): ApiRecipe {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    recipe_category_id: row.recipe_category_id ?? null,
    recipe_category_name: row.recipe_category_name ?? null,
    base_servings: row.base_servings,
    ingredient_count: Number(row.ingredient_count),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    feasibility: (row.feasibility as RecipeFeasibility) ?? null,
    is_favorite: Boolean(row.is_favorite),
    photo_url: row.photo_url ?? null,
  }
}

async function fetchDetail(id: number, userId?: number): Promise<ApiRecipeDetail | null> {
  const [[recipe]] = await pool.query<any[]>(
    `SELECT r.id, r.name, r.description, r.steps_markdown, r.photo_url, r.base_servings, r.created_at,
            r.recipe_category_id, rc.name AS recipe_category_name,
            (rf.user_id IS NOT NULL) AS is_favorite
     FROM recipes r
     LEFT JOIN recipe_categories rc ON rc.id = r.recipe_category_id
     LEFT JOIN recipe_favorites rf ON rf.recipe_id = r.id AND rf.user_id = ?
     WHERE r.id = ?`,
    [userId ?? 0, id]
  )
  if (!recipe) return null

  const [ingredients] = await pool.query<any[]>(
    `SELECT ri.id, ri.product_id, ri.quantity,
            p.name AS product_name, p.ref_unit, p.icon_ref
     FROM recipe_ingredients ri
     JOIN products p ON p.id = ri.product_id
     WHERE ri.recipe_id = ?
     ORDER BY p.name`,
    [id]
  )

  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    recipe_category_id: recipe.recipe_category_id ?? null,
    recipe_category_name: recipe.recipe_category_name ?? null,
    is_favorite: Boolean(recipe.is_favorite),
    steps_markdown: recipe.steps_markdown,
    photo_url: recipe.photo_url,
    base_servings: recipe.base_servings,
    created_at: recipe.created_at instanceof Date ? recipe.created_at.toISOString() : String(recipe.created_at),
    ingredients: (ingredients as any[]).map(r => ({
      id: r.id,
      product_id: r.product_id,
      product_name: r.product_name,
      ref_unit: r.ref_unit,
      icon_url: r.icon_ref ? `/api/icons/${r.icon_ref}` : null,
      quantity: parseFloat(r.quantity),
    })),
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const householdId = session.user.householdId ?? null
  const userId = session.user.id

  const [rows] = await pool.query<any[]>(
    `SELECT r.id, r.name, r.description, r.base_servings, r.created_at, r.photo_url,
            r.recipe_category_id, rc.name AS recipe_category_name,
            COUNT(DISTINCT ri.id) AS ingredient_count,
            CASE
              WHEN COUNT(DISTINCT ri.id) = 0 THEN NULL
              WHEN SUM(CASE WHEN s.id IS NOT NULL AND s.status != 'out_of_stock' THEN 1 ELSE 0 END) = COUNT(DISTINCT ri.id) THEN 'ok'
              WHEN SUM(CASE WHEN s.id IS NOT NULL AND s.status != 'out_of_stock' THEN 1 ELSE 0 END) = 0 THEN 'missing'
              ELSE 'partial'
            END AS feasibility,
            (rf.user_id IS NOT NULL) AS is_favorite
     FROM recipes r
     LEFT JOIN recipe_categories rc ON rc.id = r.recipe_category_id
     LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     LEFT JOIN stock s ON s.product_id = ri.product_id AND s.household_id = ?
     LEFT JOIN recipe_favorites rf ON rf.recipe_id = r.id AND rf.user_id = ?
     GROUP BY r.id
     ORDER BY is_favorite DESC, r.name`,
    [householdId, userId]
  )

  return NextResponse.json({ recipes: (rows as any[]).map(toApiRecipe) })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const { name, description = null, steps_markdown = null, photo_url = null, base_servings = 4, recipe_category_id = null, ingredients = [] } = body ?? {}

  if (!name || typeof name !== 'string' || !name.trim() || name.trim().length > 255) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (!Number.isInteger(base_servings) || base_servings < 1) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  if (!Array.isArray(ingredients)) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  // Validate ingredients
  const seenProducts = new Set<number>()
  for (const ing of ingredients) {
    if (!ing.product_id || typeof ing.product_id !== 'number') {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    if (typeof ing.quantity !== 'number' || ing.quantity <= 0) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    if (seenProducts.has(ing.product_id)) {
      return NextResponse.json({ error: 'DUPLICATE_INGREDIENT' }, { status: 400 })
    }
    seenProducts.add(ing.product_id)
  }

  // Validate product IDs exist
  if (ingredients.length > 0) {
    const ids = ingredients.map((i: any) => i.product_id)
    const [rows] = await pool.query<any[]>(
      `SELECT id FROM products WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    )
    if ((rows as any[]).length !== ids.length) {
      return NextResponse.json({ error: 'PRODUCT_NOT_FOUND' }, { status: 400 })
    }
  }

  let conn
  try {
    conn = await pool.getConnection()
    await conn.beginTransaction()

    const [result] = await conn.query<any>(
      'INSERT INTO recipes (name, description, steps_markdown, photo_url, base_servings, recipe_category_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), description, steps_markdown, photo_url, base_servings, recipe_category_id, session.user.id]
    )
    const recipeId = result.insertId

    for (const ing of ingredients) {
      await conn.query(
        'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity) VALUES (?, ?, ?)',
        [recipeId, ing.product_id, ing.quantity]
      )
    }

    await conn.commit()
    const detail = await fetchDetail(recipeId, session.user.id)
    return NextResponse.json(detail, { status: 201 })
  } catch (err) {
    if (conn) await conn.rollback()
    throw err
  } finally {
    if (conn) conn.release()
  }
}
