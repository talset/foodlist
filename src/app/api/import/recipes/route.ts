import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const body = await req.json()
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const results = { created: 0, updated: 0, errors: [] as string[] }
  const userId = session.user.id

  // Pre-fetch products (by name)
  const [prodRows] = await pool.query<any[]>('SELECT id, name FROM products')
  const prodMap = new Map<string, number>(prodRows.map(r => [r.name, r.id]))

  // Pre-fetch recipe categories (by name)
  const [rcRows] = await pool.query<any[]>('SELECT id, name FROM recipe_categories')
  const rcMap = new Map<string, number>(rcRows.map(r => [r.name, r.id]))

  // Pre-fetch existing recipes (name -> id)
  const [recipeRows] = await pool.query<any[]>('SELECT id, name FROM recipes')
  const existingRecipes = new Map<string, number>(recipeRows.map(r => [r.name, r.id]))

  for (const item of body) {
    const { name, description, steps_markdown, base_servings, ingredients, category, photo_url } = item ?? {}

    if (!name) {
      results.errors.push(`Champ "name" manquant : ${JSON.stringify(item)}`)
      continue
    }

    const categoryId = category ? (rcMap.get(category) ?? null) : null
    const existingId = existingRecipes.get(name)

    const conn = await (pool as any).getConnection()
    try {
      await conn.beginTransaction()

      let recipeId: number

      if (existingId) {
        await conn.query(
          'UPDATE recipes SET description=?, steps_markdown=?, photo_url=?, base_servings=?, recipe_category_id=? WHERE id=?',
          [description ?? null, steps_markdown ?? null, photo_url ?? null, base_servings ?? 4, categoryId, existingId]
        )
        await conn.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [existingId])
        recipeId = existingId
      } else {
        const [res] = await conn.query(
          'INSERT INTO recipes (name, description, steps_markdown, photo_url, base_servings, recipe_category_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, description ?? null, steps_markdown ?? null, photo_url ?? null, base_servings ?? 4, categoryId, userId]
        )
        recipeId = res.insertId
        existingRecipes.set(name, recipeId)
      }

      if (Array.isArray(ingredients)) {
        for (const ing of ingredients) {
          const productId = prodMap.get(ing.product)
          if (!productId) {
            results.errors.push(`Produit introuvable "${ing.product}" dans la recette "${name}"`)
            continue
          }
          await conn.query(
            'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity) VALUES (?, ?, ?)',
            [recipeId, productId, parseFloat(ing.quantity) || 0]
          )
        }
      }

      await conn.commit()
      if (existingId) results.updated++
      else results.created++
    } catch (err: any) {
      await conn.rollback()
      results.errors.push(`Erreur DB pour "${name}" : ${err.message}`)
    } finally {
      conn.release()
    }
  }

  return NextResponse.json(results)
}
