import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { iconUrl } from '@/lib/icon'

// Shopping list = out_of_stock stock items, enriched with recipe quantity bubbles
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const theme = session.user.iconTheme

  const [[rows], [recipeRows]] = await Promise.all([
    pool.query<any[]>(
      `SELECT
         s.id, s.product_id, s.quantity, s.status, s.updated_at,
         p.name       AS product_name,
         p.icon_ref,
         p.ref_unit,
         p.category_id,
         c.name       AS category_name,
         c.sort_order,
         COALESCE(SUM(ri.quantity * sr.multiplier), 0) AS recipe_quantity,
         GROUP_CONCAT(DISTINCT CASE WHEN sr.recipe_id IS NOT NULL THEN sr.recipe_id END) AS recipe_ids_csv
       FROM stock s
       JOIN products   p  ON p.id = s.product_id
       JOIN categories c  ON c.id = p.category_id
       LEFT JOIN recipe_ingredients ri ON ri.product_id = s.product_id
       LEFT JOIN shopping_recipes   sr ON sr.recipe_id = ri.recipe_id
                                      AND sr.household_id = s.household_id
       WHERE s.household_id = ? AND s.status = 'out_of_stock'
       GROUP BY s.id
       ORDER BY c.sort_order, c.name, p.name`,
      [session.user.householdId]
    ),
    pool.query<any[]>(
      `SELECT sr.recipe_id AS id, r.name AS recipe_name, sr.multiplier
       FROM shopping_recipes sr
       JOIN recipes r ON r.id = sr.recipe_id
       WHERE sr.household_id = ?
       ORDER BY r.name`,
      [session.user.householdId]
    ),
  ])

  const items = (rows as any[]).map(row => ({
    id: row.id,
    product_id: row.product_id,
    product_name: row.product_name,
    category_id: row.category_id,
    category_name: row.category_name,
    ref_unit: row.ref_unit,
    icon_url: iconUrl(row.icon_ref, theme),
    quantity: row.quantity,
    status: row.status,
    recipe_quantity: parseFloat(row.recipe_quantity) || 0,
    recipe_ids: row.recipe_ids_csv
      ? row.recipe_ids_csv.split(',').map(Number)
      : [] as number[],
    updated_at: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at),
  }))

  const activeRecipes = (recipeRows as any[]).map(r => ({
    id: r.id,
    recipe_name: r.recipe_name,
    multiplier: parseFloat(r.multiplier),
  }))

  return NextResponse.json({ items, activeRecipes })
}
