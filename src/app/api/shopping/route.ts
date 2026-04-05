import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { iconUrl } from '@/lib/icon'

// Shopping list = out_of_stock stock items + recipe ingredients needing purchase.
//
// A product appears in the shopping list if:
//   (a) it is in the household stock with status = 'out_of_stock', OR
//   (b) it is an ingredient of an active shopping_recipe and the household
//       does not have enough quantity in stock (or no stock entry at all).
//
// For each product we also compute the total recipe_quantity needed across
// all active shopping_recipes (SUM of ri.quantity * sr.multiplier).

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const hid = session.user.householdId
  const theme = session.user.iconTheme

  // 1. Fetch all products that should appear in the shopping list.
  //    We use a single query that gathers both sources via LEFT JOINs
  //    and filters in the HAVING clause.
  const [rows] = await pool.query<any[]>(
    `SELECT
       p.id          AS product_id,
       p.name        AS product_name,
       p.icon_ref,
       p.ref_unit,
       p.category_id,
       c.name        AS category_name,
       c.sort_order,
       s.id          AS stock_id,
       COALESCE(s.quantity, 0)  AS stock_quantity,
       COALESCE(s.status, 'out_of_stock') AS stock_status,
       s.updated_at,
       COALESCE(rq.recipe_quantity, 0) AS recipe_quantity,
       rq.recipe_ids_csv
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN stock s ON s.product_id = p.id AND s.household_id = ?
     LEFT JOIN (
       SELECT ri.product_id,
              SUM(ri.quantity * sr.multiplier) AS recipe_quantity,
              GROUP_CONCAT(DISTINCT sr.recipe_id) AS recipe_ids_csv
       FROM recipe_ingredients ri
       JOIN shopping_recipes sr ON sr.recipe_id = ri.recipe_id AND sr.household_id = ?
       GROUP BY ri.product_id
     ) rq ON rq.product_id = p.id
     WHERE
       (s.status = 'out_of_stock')
       OR (rq.recipe_quantity IS NOT NULL AND s.id IS NULL)
     ORDER BY c.sort_order, c.name, p.name`,
    [hid, hid]
  )

  // 2. Active recipes summary (grouped by recipe)
  const [recipeRows] = await pool.query<any[]>(
    `SELECT sr.recipe_id AS id, r.name AS recipe_name, SUM(sr.multiplier) AS multiplier
     FROM shopping_recipes sr
     JOIN recipes r ON r.id = sr.recipe_id
     WHERE sr.household_id = ?
     GROUP BY sr.recipe_id, r.name
     ORDER BY r.name`,
    [hid]
  )

  const items = (rows as any[]).map(row => ({
    id: row.stock_id ?? -row.product_id,   // negative id for products not yet in stock table
    product_id: row.product_id,
    product_name: row.product_name,
    category_id: row.category_id,
    category_name: row.category_name,
    ref_unit: row.ref_unit,
    icon_url: iconUrl(row.icon_ref, theme),
    quantity: row.stock_quantity,
    status: row.stock_status,
    recipe_quantity: parseFloat(row.recipe_quantity) || 0,
    recipe_ids: row.recipe_ids_csv
      ? row.recipe_ids_csv.split(',').map(Number)
      : [] as number[],
    updated_at: row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : row.updated_at ? String(row.updated_at) : new Date().toISOString(),
  }))

  const activeRecipes = (recipeRows as any[]).map(r => ({
    id: r.id,
    recipe_name: r.recipe_name,
    multiplier: parseFloat(r.multiplier),
  }))

  return NextResponse.json({ items, activeRecipes })
}
