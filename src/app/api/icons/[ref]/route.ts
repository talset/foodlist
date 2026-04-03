import fs from 'fs/promises'
import path from 'path'

const DEFAULT_DIR = path.join(process.cwd(), 'uploads/icons/default')
const CUSTOM_DIR = process.env.ICONS_DIR ?? path.join(process.cwd(), 'uploads/icons/custom')

export async function GET(
  _req: Request,
  { params }: { params: { ref: string } }
) {
  // Strip path traversal attempts
  const filename = path.basename(params.ref)
  if (!filename || !/^[\w\-]+\.(png|jpg|jpeg|webp)$/i.test(filename)) {
    return new Response(null, { status: 400 })
  }

  for (const dir of [DEFAULT_DIR, CUSTOM_DIR]) {
    try {
      const buffer = await fs.readFile(path.join(dir, filename))
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      // not in this dir, try next
    }
  }

  return new Response(null, { status: 404 })
}
