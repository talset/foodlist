import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const [recipeRows] = await pool.query<any[]>(
    `SELECT r.id, r.name, r.description, r.steps_markdown, r.base_servings, r.photo_url,
            rc.name AS category
     FROM recipes r
     LEFT JOIN recipe_categories rc ON rc.id = r.recipe_category_id
     ORDER BY r.name`
  )

  const [ingRows] = await pool.query<any[]>(
    `SELECT ri.recipe_id, p.name AS product, ri.quantity
     FROM recipe_ingredients ri
     JOIN products p ON p.id = ri.product_id
     ORDER BY ri.recipe_id, p.name`
  )

  const ingByRecipe = new Map<number, { product: string; quantity: number }[]>()
  for (const r of ingRows as any[]) {
    if (!ingByRecipe.has(r.recipe_id)) ingByRecipe.set(r.recipe_id, [])
    ingByRecipe.get(r.recipe_id)!.push({ product: r.product, quantity: parseFloat(r.quantity) })
  }

  const recipes = (recipeRows as any[]).map(r => ({
    name: r.name,
    description: r.description ?? null,
    category: r.category ?? null,
    base_servings: r.base_servings,
    steps_markdown: r.steps_markdown ?? null,
    photo_url: r.photo_url ?? null,
    ingredients: ingByRecipe.get(r.id) ?? [],
  }))

  return new Response(JSON.stringify(recipes, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="recipes.json"',
    },
  })
}
