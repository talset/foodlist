import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

const RECIPES_DIR = path.join(process.cwd(), 'uploads/recipes')
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const recipeId = formData.get('recipeId') as string | null

  if (!file || !recipeId) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'FILE_TOO_LARGE' }, { status: 400 })
  }

  const id = parseInt(recipeId)
  if (isNaN(id)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })

  const [[recipe]] = await pool.query<any[]>('SELECT id, name FROM recipes WHERE id = ?', [id])
  if (!recipe) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const ext = path.extname(file.name).toLowerCase() || '.png'
  const filename = slugify(recipe.name) + ext

  await fs.mkdir(RECIPES_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(RECIPES_DIR, filename), buffer)

  const photoUrl = `/api/recipes/photos/${filename}`
  await pool.query('UPDATE recipes SET photo_url = ? WHERE id = ?', [photoUrl, id])

  return NextResponse.json({ photo_url: photoUrl, filename })
}
