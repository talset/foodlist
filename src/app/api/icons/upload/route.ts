import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { authOptions } from '@/lib/auth'

const ICONS_DIR = process.env.ICONS_DIR ?? path.join(process.cwd(), 'uploads/icons/custom')
const MAX_BYTES = 4 * 1024 * 1024  // 4 MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'NO_FILE' }, { status: 400 })

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'FILE_TOO_LARGE' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  let outputBuffer: Buffer
  try {
    outputBuffer = await sharp(inputBuffer)
      .resize(128, 128, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 8 })
      .toBuffer()
  } catch {
    return NextResponse.json({ error: 'INVALID_IMAGE' }, { status: 422 })
  }

  const filename = `${uuidv4()}.png`
  await fs.mkdir(ICONS_DIR, { recursive: true })
  await fs.writeFile(path.join(ICONS_DIR, filename), outputBuffer)

  return NextResponse.json({ icon_ref: filename }, { status: 201 })
}
