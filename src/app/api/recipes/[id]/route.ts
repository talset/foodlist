import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { iconUrl } from '@/lib/icon'
import type { ApiRecipeDetail } from '@/types'

async function fetchDetail(id: number, theme?: string): Promise<ApiRecipeDetail | null> {
  const [[recipe]] = await pool.query<any[]>(
    'SELECT id, name, description, steps_markdown, photo_url, base_servings, created_at FROM recipes WHERE id = ?',
    [id]
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
    steps_markdown: recipe.steps_markdown,
    photo_url: recipe.photo_url,
    base_servings: recipe.base_servings,
    created_at: recipe.created_at instanceof Date ? recipe.created_at.toISOString() : String(recipe.created_at),
    ingredients: (ingredients as any[]).map(r => ({
      id: r.id,
      product_id: r.product_id,
      product_name: r.product_name,
      ref_unit: r.ref_unit,
      icon_url: iconUrl(r.icon_ref, theme),
      quantity: parseFloat(r.quantity),
    })),
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const detail = await fetchDetail(id, session.user.iconTheme)
  if (!detail) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  return NextResponse.json(detail)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const body = await req.json()
  const { name, description, steps_markdown, photo_url, base_servings, ingredients } = body ?? {}

  const sets: string[] = []
  const values: any[] = []

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 255) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    sets.push('name = ?')
    values.push(name.trim())
  }
  if (description !== undefined) { sets.push('description = ?'); values.push(description) }
  if (steps_markdown !== undefined) { sets.push('steps_markdown = ?'); values.push(steps_markdown) }
  if (photo_url !== undefined) { sets.push('photo_url = ?'); values.push(photo_url) }
  if (base_servings !== undefined) {
    if (!Number.isInteger(base_servings) || base_servings < 1) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    sets.push('base_servings = ?'); values.push(base_servings)
  }

  if (sets.length === 0 && ingredients === undefined) {
    return NextResponse.json({ error: 'NOTHING_TO_UPDATE' }, { status: 400 })
  }

  // Validate ingredients if provided
  if (ingredients !== undefined) {
    if (!Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
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
  }

  let conn
  try {
    conn = await pool.getConnection()
    await conn.beginTransaction()

    if (sets.length > 0) {
      const [result] = await conn.query<any>(
        `UPDATE recipes SET ${sets.join(', ')} WHERE id = ?`,
        [...values, id]
      )
      if (result.affectedRows === 0) {
        await conn.rollback()
        conn.release()
        return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      }
    } else {
      // Verify recipe exists
      const [[row]] = await conn.query<any[]>('SELECT id FROM recipes WHERE id = ?', [id])
      if (!row) {
        await conn.rollback()
        conn.release()
        return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      }
    }

    if (ingredients !== undefined) {
      await conn.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id])
      for (const ing of ingredients) {
        await conn.query(
          'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity) VALUES (?, ?, ?)',
          [id, ing.product_id, ing.quantity]
        )
      }
    }

    await conn.commit()
    const detail = await fetchDetail(id)
    return NextResponse.json(detail)
  } catch (err) {
    if (conn) await conn.rollback()
    throw err
  } finally {
    if (conn) conn.release()
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  let conn
  try {
    conn = await pool.getConnection()
    await conn.beginTransaction()

    // shopping_recipes has no CASCADE — must delete manually first
    await conn.query('DELETE FROM shopping_recipes WHERE recipe_id = ?', [id])
    const [result] = await conn.query<any>('DELETE FROM recipes WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      await conn.rollback()
      conn.release()
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    }

    await conn.commit()
    return new Response(null, { status: 204 })
  } catch (err) {
    if (conn) await conn.rollback()
    throw err
  } finally {
    if (conn) conn.release()
  }
}
