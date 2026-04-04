import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

// POST /api/shopping/restock
// Marks all out_of_stock items in the household as in_stock in a single query.
// Intended for the "Tout restockér" button after returning from shopping.
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.householdId) return NextResponse.json({ error: 'NO_HOUSEHOLD' }, { status: 400 })

  const [result] = await pool.query<any>(
    `UPDATE stock
     SET status = 'in_stock', quantity = 0, updated_by = ?, updated_at = NOW()
     WHERE household_id = ? AND status = 'out_of_stock'`,
    [session.user.id, session.user.householdId]
  )

  return NextResponse.json({ restocked: result.affectedRows })
}
