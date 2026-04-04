import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const [rows] = await pool.query<any[]>(`
    SELECT u.id, u.name, u.email, u.is_admin, u.site_theme, u.icon_theme, u.created_at,
           hm.household_id, h.name AS household_name, hm.role AS household_role
    FROM users u
    LEFT JOIN household_members hm ON hm.user_id = u.id
    LEFT JOIN households h ON h.id = hm.household_id
    ORDER BY u.created_at ASC
  `)

  return NextResponse.json(
    (rows as any[]).map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      isAdmin: Boolean(r.is_admin),
      siteTheme: r.site_theme ?? 'default',
      iconTheme: r.icon_theme ?? 'default',
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      householdId: r.household_id ?? null,
      householdName: r.household_name ?? null,
      householdRole: r.household_role ?? null,
    }))
  )
}
