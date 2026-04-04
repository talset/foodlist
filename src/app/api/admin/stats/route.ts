import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const [[{ users }]] = await pool.query<any[]>('SELECT COUNT(*) AS users FROM users')
  const [[{ households }]] = await pool.query<any[]>('SELECT COUNT(*) AS households FROM households')
  const [[{ products }]] = await pool.query<any[]>('SELECT COUNT(*) AS products FROM products')
  const [[{ recipes }]] = await pool.query<any[]>('SELECT COUNT(*) AS recipes FROM recipes')

  return NextResponse.json({
    users: Number(users),
    households: Number(households),
    products: Number(products),
    recipes: Number(recipes),
  })
}
