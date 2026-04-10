import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import seedRecipes from '../../../../../seed/recipes.json'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const userId = session.user.id

  const [prodRows] = await pool.query<any[]>('SELECT id, name FROM products')
  const prodMap = new Map<string, number>(prodRows.map((r: any) => [r.name, r.id]))

  const [rcRows] = await pool.query<any[]>('SELECT id, name FROM recipe_categories')
  const rcMap = new Map<string, number>(rcRows.map((r: any) => [r.name, r.id]))

  // Pre-fetch existing recipes (name -> id)
  const [recipeRows] = await pool.query<any[]>('SELECT id, name FROM recipes')
  const existingRecipes = new Map<string, number>(recipeRows.map((r: any) => [r.name, r.id]))

  let created = 0
  let updated = 0
  const errors: string[] = []

  for (const item of seedRecipes as any[]) {
    const { name, description, steps_markdown, base_servings, category, ingredients, photo_url } = item

    if (!name) continue

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
            errors.push(`Produit introuvable "${ing.product}" dans "${name}"`)
            continue
          }
          await conn.query(
            'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity) VALUES (?, ?, ?)',
            [recipeId, productId, parseFloat(ing.quantity) || 0]
          )
        }
      }

      await conn.commit()
      if (existingId) updated++
      else created++
    } catch (err: any) {
      await conn.rollback()
      errors.push(`Erreur pour "${name}": ${err.message}`)
    } finally {
      conn.release()
    }
  }

  return NextResponse.json({ created, updated, errors: errors.length ? errors : undefined })
}
