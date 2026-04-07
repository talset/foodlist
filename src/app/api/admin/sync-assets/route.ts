import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import { authOptions } from '@/lib/auth'

const CWD = process.cwd()

// In Docker: seed-assets/ is a pristine copy baked into the image, never shadowed by the volume.
// In dev: seed-assets/ doesn't exist, so we fall back to uploads/ (same directory, sync is a no-op).
const SEED_ICONS_DOCKER = path.join(CWD, 'seed-assets/icons')
const SEED_RECIPES_DOCKER = path.join(CWD, 'seed-assets/recipes')
const SEED_ICONS_DEV = path.join(CWD, 'uploads/icons')
const SEED_RECIPES_DEV = path.join(CWD, 'uploads/recipes')
const DEST_ICONS = path.join(CWD, 'uploads/icons')
const DEST_RECIPES = path.join(CWD, 'uploads/recipes')

async function exists(p: string): Promise<boolean> {
  try { await fs.access(p); return true } catch { return false }
}

async function syncDir(src: string, dest: string, force: boolean): Promise<{ copied: number; skipped: number }> {
  let copied = 0, skipped = 0
  if (!await exists(src)) return { copied, skipped }
  await fs.mkdir(dest, { recursive: true })

  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      // Skip the 'custom' directory — it contains user uploads, not seed data
      if (entry.name === 'custom') continue
      const sub = await syncDir(srcPath, destPath, force)
      copied += sub.copied
      skipped += sub.skipped
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
      if (!force && await exists(destPath)) {
        skipped++
      } else {
        await fs.copyFile(srcPath, destPath)
        copied++
      }
    }
  }
  return { copied, skipped }
}

// POST /api/admin/sync-assets  { target: 'icons' | 'recipes' | 'all', force?: boolean }
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const target: string = body.target ?? 'all'
    const force: boolean = body.force === true

    const result: Record<string, { copied: number; skipped: number; source: string }> = {}

    if (target === 'icons' || target === 'all') {
      const hasSeedDir = await exists(SEED_ICONS_DOCKER)
      const src = hasSeedDir ? SEED_ICONS_DOCKER : SEED_ICONS_DEV
      result.icons = { ...await syncDir(src, DEST_ICONS, force), source: hasSeedDir ? 'docker' : 'local' }
    }
    if (target === 'recipes' || target === 'all') {
      const hasSeedDir = await exists(SEED_RECIPES_DOCKER)
      const src = hasSeedDir ? SEED_RECIPES_DOCKER : SEED_RECIPES_DEV
      result.recipes = { ...await syncDir(src, DEST_RECIPES, force), source: hasSeedDir ? 'docker' : 'local' }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('sync-assets error:', err)
    return NextResponse.json({ error: err?.message ?? 'INTERNAL_ERROR' }, { status: 500 })
  }
}
