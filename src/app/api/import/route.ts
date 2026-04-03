import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] }
  const userId = session.user.id

  // Pre-fetch categories
  const [catRows] = await pool.query<any[]>('SELECT id, name FROM categories')
  const catMap = new Map<string, number>(catRows.map(r => [r.name, r.id]))

  // Pre-fetch existing product names
  const [prodRows] = await pool.query<any[]>('SELECT name FROM products')
  const existingNames = new Set<string>(prodRows.map(r => r.name))

  for (const item of body) {
    const { name, category, ref_unit, ref_quantity, icon_ref } = item ?? {}

    if (!name || !category || !ref_unit || ref_quantity == null) {
      results.errors.push(`Champ manquant : ${JSON.stringify(item)}`)
      continue
    }

    if (existingNames.has(name)) {
      results.skipped++
      continue
    }

    // Resolve or create category
    let categoryId = catMap.get(category)
    if (!categoryId) {
      const [res] = await pool.query<any>(
        'INSERT IGNORE INTO categories (name, is_default, sort_order) VALUES (?, 0, 999)',
        [category]
      )
      if (res.insertId) {
        categoryId = res.insertId as number
        catMap.set(category, categoryId)
      } else {
        const [refetch] = await pool.query<any[]>('SELECT id FROM categories WHERE name = ?', [category])
        categoryId = refetch[0]?.id as number | undefined
      }
    }

    if (!categoryId) {
      results.errors.push(`Impossible de résoudre la catégorie pour : ${name}`)
      continue
    }

    try {
      await pool.query(
        'INSERT INTO products (name, category_id, ref_unit, ref_quantity, icon_ref, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [name, categoryId, ref_unit, parseFloat(ref_quantity), icon_ref ?? null, userId]
      )
      existingNames.add(name)
      results.created++
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        results.skipped++
      } else {
        results.errors.push(`Erreur DB pour ${name} : ${err.message}`)
      }
    }
  }

  return NextResponse.json(results)
}
