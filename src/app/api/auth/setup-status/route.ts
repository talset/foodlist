import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

// Public endpoint — used by /register to know if signup is open (first user) or invite-only
export async function GET() {
  const [[row]] = await pool.query<any[]>('SELECT COUNT(*) as count FROM users')
  return NextResponse.json({ isFirstUser: Number(row.count) === 0 })
}
