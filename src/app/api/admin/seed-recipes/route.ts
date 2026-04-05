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

  const [recipeRows] = await pool.query<any[]>('SELECT name FROM recipes')
  const existingNames = new Set<string>(recipeRows.map((r: any) => r.name))

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const item of seedRecipes as any[]) {
    const { name, description, steps_markdown, base_servings, category, ingredients, photo_url } = item

    if (!name) continue
    if (existingNames.has(name)) { skipped++; continue }

    const categoryId = category ? (rcMap.get(category) ?? null) : null

    const conn = await (pool as any).getConnection()
    try {
      await conn.beginTransaction()

      const [res] = await conn.query(
        'INSERT INTO recipes (name, description, steps_markdown, photo_url, base_servings, recipe_category_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description ?? null, steps_markdown ?? null, photo_url ?? null, base_servings ?? 4, categoryId, userId]
      )
      const recipeId = res.insertId

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
      existingNames.add(name)
      created++
    } catch (err: any) {
      await conn.rollback()
      if (err.code === 'ER_DUP_ENTRY') skipped++
      else errors.push(`Erreur pour "${name}": ${err.message}`)
    } finally {
      conn.release()
    }
  }

  return NextResponse.json({ created, skipped, errors: errors.length ? errors : undefined })
}
