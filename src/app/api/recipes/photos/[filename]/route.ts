import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const RECIPES_DIR = path.join(process.cwd(), 'uploads/recipes')

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

export async function GET(_req: Request, { params }: { params: { filename: string } }) {
  const safe = path.basename(params.filename)
  if (!safe || safe.includes('..')) {
    return NextResponse.json({ error: 'INVALID' }, { status: 400 })
  }

  const filePath = path.join(RECIPES_DIR, safe)
  try {
    const data = await fs.readFile(filePath)
    const ext = path.extname(safe).toLowerCase()
    return new Response(data, {
      headers: {
        'Content-Type': MIME[ext] ?? 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }
}
