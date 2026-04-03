import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'
import { authOptions } from '@/lib/auth'

const DEFAULT_DIR = path.join(process.cwd(), 'uploads/icons/default')

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  try {
    const files = await fs.readdir(DEFAULT_DIR)
    const icons = files
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort()
    return NextResponse.json({ icons })
  } catch {
    return NextResponse.json({ icons: [] })
  }
}
