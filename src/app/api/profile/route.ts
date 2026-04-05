import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { SITE_THEMES } from '@/types'
import type { SiteTheme } from '@/types'

export const dynamic = 'force-dynamic'

// Directories that are never selectable as user icon themes
const EXCLUDED_ICON_DIRS = new Set(['custom', 'default-global'])

async function getAvailableIconThemes(): Promise<string[]> {
  const iconsRoot = path.join(process.cwd(), 'uploads/icons')
  try {
    const entries = await fs.readdir(iconsRoot, { withFileTypes: true })
    return entries
      .filter(e => e.isDirectory() && !EXCLUDED_ICON_DIRS.has(e.name))
      .map(e => e.name)
      .sort((a, b) => a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b))
  } catch {
    return ['default']
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const [rows] = await pool.query<any[]>(
    'SELECT id, name, email, is_admin, site_theme, icon_theme FROM users WHERE id = ?',
    [session.user.id]
  )
  if (!(rows as any[]).length) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }
  const user = (rows as any[])[0]
  const availableIconThemes = await getAvailableIconThemes()

  const siteTheme = (user.site_theme && user.site_theme !== 'default') ? user.site_theme : 'dark'

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.is_admin),
    siteTheme,
    iconTheme: user.icon_theme ?? 'default',
    availableIconThemes,
  })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const { name, siteTheme, iconTheme } = body ?? {}

  const sets: string[] = []
  const values: any[] = []

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      return NextResponse.json({ error: 'INVALID_NAME' }, { status: 400 })
    }
    sets.push('name = ?')
    values.push(name.trim())
  }

  if (siteTheme !== undefined) {
    const resolved = siteTheme === 'default' ? 'dark' : siteTheme
    if (!Object.keys(SITE_THEMES).includes(resolved)) {
      return NextResponse.json({ error: 'INVALID_THEME' }, { status: 400 })
    }
    sets.push('site_theme = ?')
    values.push(resolved as SiteTheme)
  }

  if (iconTheme !== undefined) {
    if (typeof iconTheme !== 'string' || !/^[a-z0-9_-]+$/.test(iconTheme)) {
      return NextResponse.json({ error: 'INVALID_ICON_THEME' }, { status: 400 })
    }
    sets.push('icon_theme = ?')
    values.push(iconTheme)
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'NOTHING_TO_UPDATE' }, { status: 400 })
  }

  values.push(session.user.id)
  await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, values)

  const [rows] = await pool.query<any[]>(
    'SELECT id, name, email, is_admin, site_theme, icon_theme FROM users WHERE id = ?',
    [session.user.id]
  )
  const user = (rows as any[])[0]

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.is_admin),
    siteTheme: (user.site_theme && user.site_theme !== 'default') ? user.site_theme : 'dark',
    iconTheme: user.icon_theme ?? 'default',
  })
}
