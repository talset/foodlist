import fs from 'fs/promises'
import path from 'path'

const DEFAULT_DIR = path.join(process.cwd(), 'uploads/icons/default')
const CUSTOM_DIR = process.env.ICONS_DIR ?? path.join(process.cwd(), 'uploads/icons/custom')
// Admin-uploaded theme overrides: $ICONS_DIR/themes/<theme>/ — takes priority over embedded themes
const THEMES_OVERRIDE_DIR = path.join(CUSTOM_DIR, 'themes')

export async function GET(
  req: Request,
  props: { params: Promise<{ ref: string }> }
) {
  const params = await props.params
  // Strip path traversal attempts
  const filename = path.basename(params.ref)
  if (!filename || !/^[\w\-]+\.(png|jpg|jpeg|webp)$/i.test(filename)) {
    return new Response(null, { status: 400 })
  }

  // Read theme param and sanitize (only allow safe chars)
  const { searchParams } = new URL(req.url)
  const rawTheme = searchParams.get('theme') ?? ''
  const theme = /^[a-z0-9_-]+$/.test(rawTheme) ? rawTheme : ''

  // Resolution order: admin override → embedded theme → default → custom UUID
  const dirs: string[] = []
  if (theme && theme !== 'default') {
    dirs.push(path.join(THEMES_OVERRIDE_DIR, theme))  // admin-uploaded override (writable volume)
    dirs.push(path.join(process.cwd(), 'uploads/icons', theme))  // embedded in Docker image
  }
  dirs.push(DEFAULT_DIR)
  dirs.push(CUSTOM_DIR)

  for (const dir of dirs) {
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
