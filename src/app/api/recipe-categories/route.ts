import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const [rows] = await pool.query<any[]>(
    'SELECT id, name, sort_order FROM recipe_categories ORDER BY sort_order, name'
  )

  return NextResponse.json(rows)
}
