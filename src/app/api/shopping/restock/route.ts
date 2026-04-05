import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { broadcast } from '@/lib/sse'

// POST /api/shopping/restock
// 1. Marks all out_of_stock items as in_stock
// 2. Creates in_stock entries for recipe ingredients not yet in stock
// 3. Clears all shopping_recipes for the household
export async function POST(_req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const hid = session.user.householdId
  const uid = session.user.id

  // Mark existing out_of_stock as in_stock
  const [r1] = await pool.query<any>(
    `UPDATE stock
     SET status = 'in_stock', quantity = 0, updated_by = ?, updated_at = NOW()
     WHERE household_id = ? AND status = 'out_of_stock'`,
    [uid, hid]
  )

  // Insert in_stock entries for recipe ingredients missing from stock
  const [r2] = await pool.query<any>(
    `INSERT IGNORE INTO stock (product_id, household_id, quantity, status, updated_by)
     SELECT DISTINCT ri.product_id, ?, 0, 'in_stock', ?
     FROM recipe_ingredients ri
     JOIN shopping_recipes sr ON sr.recipe_id = ri.recipe_id AND sr.household_id = ?
     WHERE ri.product_id NOT IN (SELECT product_id FROM stock WHERE household_id = ?)`,
    [hid, uid, hid, hid]
  )

  // Clear shopping recipes
  await pool.query('DELETE FROM shopping_recipes WHERE household_id = ?', [hid])

  broadcast(hid, 'stock_updated')
  broadcast(hid, 'shopping_updated')
  return NextResponse.json({ restocked: r1.affectedRows + r2.affectedRows })
}
