import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import seedProducts from '../../../../../seed/products.json'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const userId = session.user.id

  const [catRows] = await pool.query<any[]>('SELECT id, name FROM categories')
  const catMap = new Map<string, number>(catRows.map((r: any) => [r.name, r.id]))

  const [prodRows] = await pool.query<any[]>('SELECT name FROM products')
  const existingNames = new Set<string>(prodRows.map((r: any) => r.name))

  let created = 0
  let skipped = 0

  for (const item of seedProducts as any[]) {
    const { name, category, ref_unit, ref_quantity, icon_ref } = item

    if (existingNames.has(name)) {
      skipped++
      continue
    }

    let categoryId = catMap.get(category)
    if (!categoryId) {
      const [res] = await pool.query<any>(
        'INSERT IGNORE INTO categories (name, is_default, sort_order) VALUES (?, 0, 999)',
        [category]
      )
      if (res.insertId) {
        categoryId = res.insertId
        catMap.set(category, categoryId!)
      } else {
        const [refetch] = await pool.query<any[]>('SELECT id FROM categories WHERE name = ?', [category])
        categoryId = (refetch as any[])[0]?.id
      }
    }

    if (!categoryId) continue

    try {
      await pool.query(
        'INSERT INTO products (name, category_id, ref_unit, ref_quantity, icon_ref, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [name, categoryId, ref_unit, parseFloat(ref_quantity), icon_ref ?? null, userId]
      )
      existingNames.add(name)
      created++
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') skipped++
    }
  }

  return NextResponse.json({ created, skipped })
}
