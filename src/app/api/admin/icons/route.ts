import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

const CUSTOM_DIR = process.env.ICONS_DIR ?? path.join(process.cwd(), 'uploads/icons/custom')
const DEFAULT_DIR = path.join(process.cwd(), 'uploads/icons/default')

async function listFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir)
    return files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f)).sort()
  } catch {
    return []
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const [[productRows], customFiles, defaultFiles] = await Promise.all([
    pool.query<any[]>('SELECT p.id, p.name, p.icon_ref, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id ORDER BY c.sort_order, c.name, p.name'),
    listFiles(CUSTOM_DIR),
    listFiles(DEFAULT_DIR),
  ])

  const referencedIcons = new Set((productRows as any[]).map(r => r.icon_ref).filter(Boolean))

  // Products without any icon
  const products_without_icon = (productRows as any[])
    .filter(r => !r.icon_ref)
    .map(r => ({ id: r.id, name: r.name, category_name: r.category_name }))

  // Custom UUID files not referenced by any product
  const orphan_custom = customFiles.filter(f => !referencedIcons.has(f))

  // Default/theme icons not referenced by any product
  const orphan_default = defaultFiles.filter(f => !referencedIcons.has(f))

  return NextResponse.json({ products_without_icon, orphan_custom, orphan_default })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const { filenames } = await req.json()
  if (!Array.isArray(filenames) || filenames.length === 0) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  let deleted = 0
  for (const filename of filenames) {
    // Only allow safe filenames — no path traversal
    const safe = path.basename(filename)
    if (!safe || !/^[\w\-]+\.(png|jpg|jpeg|webp)$/i.test(safe)) continue
    try {
      await fs.unlink(path.join(CUSTOM_DIR, safe))
      deleted++
    } catch {
      // file may already be gone
    }
  }

  return NextResponse.json({ deleted })
}
