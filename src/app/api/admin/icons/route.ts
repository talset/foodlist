import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

const ICONS_ROOT = path.join(process.cwd(), 'uploads/icons')
const CUSTOM_DIR = process.env.ICONS_DIR ?? path.join(ICONS_ROOT, 'custom')
const EXCLUDED_DIRS = new Set(['custom', 'default-bak', 'default-global'])

async function listFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir)
    return files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f)).sort()
  } catch {
    return []
  }
}

async function getThemeDirs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(ICONS_ROOT, { withFileTypes: true })
    return entries
      .filter(e => e.isDirectory() && !EXCLUDED_DIRS.has(e.name))
      .map(e => e.name)
      .sort((a, b) => a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b))
  } catch {
    return ['default']
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const themes = await getThemeDirs()

  const [[productRows], customFiles, ...themeFileLists] = await Promise.all([
    pool.query<any[]>('SELECT p.id, p.name, p.icon_ref, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id ORDER BY c.sort_order, c.name, p.name'),
    listFiles(CUSTOM_DIR),
    ...themes.map(t => listFiles(path.join(ICONS_ROOT, t))),
  ])

  const referencedIcons = new Set((productRows as any[]).map(r => r.icon_ref).filter(Boolean))

  // Products without any icon_ref
  const products_without_icon = (productRows as any[])
    .filter(r => !r.icon_ref)
    .map(r => ({ id: r.id, name: r.name, category_name: r.category_name }))

  // Products that have an icon_ref but the file is missing in a given theme
  const themeFiles: Record<string, Set<string>> = {}
  themes.forEach((t, i) => { themeFiles[t] = new Set(themeFileLists[i]) })

  const products_missing_in_theme: { id: number; name: string; category_name: string; icon_ref: string; missing_themes: string[] }[] = []
  for (const r of (productRows as any[])) {
    if (!r.icon_ref) continue
    const missing = themes.filter(t => !themeFiles[t].has(r.icon_ref))
    if (missing.length > 0) {
      products_missing_in_theme.push({ id: r.id, name: r.name, category_name: r.category_name, icon_ref: r.icon_ref, missing_themes: missing })
    }
  }

  // Custom UUID files not referenced by any product
  const orphan_custom = customFiles.filter(f => !referencedIcons.has(f))

  // Theme icons not referenced by any product — per theme
  const orphan_theme: { filename: string; theme: string }[] = []
  for (let i = 0; i < themes.length; i++) {
    for (const f of themeFileLists[i]) {
      if (!referencedIcons.has(f)) {
        orphan_theme.push({ filename: f, theme: themes[i] })
      }
    }
  }

  return NextResponse.json({
    themes,
    products_without_icon,
    products_missing_in_theme,
    orphan_custom,
    orphan_theme,
  })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const { filenames, theme } = await req.json()
  if (!Array.isArray(filenames) || filenames.length === 0) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  // Determine target directory
  let targetDir: string
  if (theme && typeof theme === 'string' && /^[a-z0-9_-]+$/.test(theme) && !EXCLUDED_DIRS.has(theme)) {
    targetDir = path.join(ICONS_ROOT, theme)
  } else {
    targetDir = CUSTOM_DIR
  }

  let deleted = 0
  for (const filename of filenames) {
    const safe = path.basename(filename)
    if (!safe || !/^[\w\-]+\.(png|jpg|jpeg|webp)$/i.test(safe)) continue
    try {
      await fs.unlink(path.join(targetDir, safe))
      deleted++
    } catch {
      // file may already be gone
    }
  }

  return NextResponse.json({ deleted })
}
