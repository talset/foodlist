import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

const ICONS_ROOT = path.join(process.cwd(), 'uploads/icons')
const CUSTOM_DIR = process.env.ICONS_DIR ?? path.join(ICONS_ROOT, 'custom')
const RECIPES_DIR = path.join(process.cwd(), 'uploads/recipes')
const EXCLUDED_DIRS = new Set(['custom', 'default-bak', 'default-global'])

async function listFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir)
    return files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
  } catch {
    return []
  }
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  // Icon counts
  const [[productRows], customFiles] = await Promise.all([
    pool.query<any[]>('SELECT icon_ref FROM products'),
    listFiles(CUSTOM_DIR),
  ])
  const referencedIcons = new Set((productRows as any[]).map(r => r.icon_ref).filter(Boolean))
  const productsWithoutIcon = (productRows as any[]).filter(r => !r.icon_ref).length
  const orphanCustom = customFiles.filter(f => !referencedIcons.has(f)).length

  // Theme orphans
  let orphanTheme = 0
  try {
    const entries = await fs.readdir(ICONS_ROOT, { withFileTypes: true })
    const themes = entries.filter(e => e.isDirectory() && !EXCLUDED_DIRS.has(e.name)).map(e => e.name)
    for (const t of themes) {
      const files = await listFiles(path.join(ICONS_ROOT, t))
      orphanTheme += files.filter(f => !referencedIcons.has(f)).length
    }
  } catch {}

  // Recipe photo counts
  const [[recipeRows], recipeFiles] = await Promise.all([
    pool.query<any[]>('SELECT photo_url FROM recipes'),
    listFiles(RECIPES_DIR),
  ])
  const referencedPhotos = new Set(
    (recipeRows as any[]).map(r => r.photo_url).filter(Boolean).map((u: string) => path.basename(u))
  )
  const recipesWithoutPhoto = (recipeRows as any[]).filter(r => !r.photo_url).length
  const orphanPhotos = recipeFiles.filter(f => !referencedPhotos.has(f)).length

  return NextResponse.json({
    icons: productsWithoutIcon + orphanCustom + orphanTheme,
    photos: recipesWithoutPhoto + orphanPhotos,
    total: productsWithoutIcon + orphanCustom + orphanTheme + recipesWithoutPhoto + orphanPhotos,
  })
}
