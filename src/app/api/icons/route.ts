import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import { authOptions } from '@/lib/auth'

const DEFAULT_DIR = path.join(process.cwd(), 'uploads/icons/default')
const CUSTOM_DIR = process.env.ICONS_DIR ?? path.join(process.cwd(), 'uploads/icons/custom')
const THEMES_OVERRIDE_DIR = path.join(CUSTOM_DIR, 'themes')

async function listDir(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir)
    return files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f)).sort()
  } catch {
    return []
  }
}

// GET /api/icons — list available icons
// ?theme=<theme>  → returns all icons from default/, enriched with which ones the theme covers
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const theme = searchParams.get('theme') ?? ''

  const defaultIcons = await listDir(DEFAULT_DIR)

  if (!theme || theme === 'default') {
    return NextResponse.json({ icons: defaultIcons, theme: 'default' })
  }

  // Collect which filenames are covered by the theme (override or embedded)
  const overrideFiles = new Set(await listDir(path.join(THEMES_OVERRIDE_DIR, theme)))
  const embeddedFiles = new Set(await listDir(path.join(process.cwd(), 'uploads/icons', theme)))
  const themeFiles = new Set([...overrideFiles, ...embeddedFiles])

  const icons = defaultIcons.map(name => ({
    name,
    has_theme: themeFiles.has(name),
  }))

  return NextResponse.json({ icons, theme })
}

// GET /api/icons/themes — list available icon themes (directories in uploads/icons/)
export async function HEAD() {
  // placeholder; themes listed via /api/icons/themes route (admin)
  return new Response(null, { status: 204 })
}
