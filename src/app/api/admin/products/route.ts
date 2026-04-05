import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const conn = await (pool as any).getConnection()
  try {
    await conn.beginTransaction()
    await conn.query('DELETE FROM shopping_recipes')
    await conn.query('DELETE FROM recipe_ingredients')
    await conn.query('DELETE FROM stock')
    await conn.query('DELETE FROM recipes')
    await conn.query('DELETE FROM products')
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return NextResponse.json({ ok: true })
}
