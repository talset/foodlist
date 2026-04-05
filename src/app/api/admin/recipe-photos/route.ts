import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

const RECIPES_DIR = path.join(process.cwd(), 'uploads/recipes')

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

  const [[recipeRows], diskFiles] = await Promise.all([
    pool.query<any[]>(
      `SELECT r.id, r.name, r.photo_url, rc.name AS category_name
       FROM recipes r LEFT JOIN recipe_categories rc ON rc.id = r.recipe_category_id
       ORDER BY r.name`
    ),
    listFiles(RECIPES_DIR),
  ])

  const referencedFiles = new Set(
    (recipeRows as any[])
      .map(r => r.photo_url)
      .filter(Boolean)
      .map((url: string) => path.basename(url))
  )

  const recipes_without_photo = (recipeRows as any[])
    .filter(r => !r.photo_url)
    .map(r => ({ id: r.id, name: r.name, category_name: r.category_name }))

  const recipes_with_photo = (recipeRows as any[])
    .filter(r => r.photo_url)
    .map(r => ({ id: r.id, name: r.name, category_name: r.category_name, photo_url: r.photo_url }))

  const orphan_photos = diskFiles.filter(f => !referencedFiles.has(f))

  return NextResponse.json({ recipes_without_photo, recipes_with_photo, orphan_photos })
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
    const safe = path.basename(filename)
    if (!safe || safe.includes('..')) continue
    try {
      await fs.unlink(path.join(RECIPES_DIR, safe))
      deleted++
    } catch {
      // file may already be gone
    }
  }

  return NextResponse.json({ deleted })
}
