import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { defaultIconRef } from '@/lib/search'
import seedProducts from '../../../../../seed/products.json'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const userId = session.user.id

  const [catRows] = await pool.query<any[]>('SELECT id, name FROM categories')
  const catMap = new Map<string, number>(catRows.map((r: any) => [r.name, r.id]))

  let created = 0
  let updated = 0

  for (const item of seedProducts as any[]) {
    const { name, category, ref_unit, ref_quantity, icon_ref } = item

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
      const [res] = await pool.query<any>(
        `INSERT INTO products (name, category_id, ref_unit, ref_quantity, icon_ref, created_by)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           category_id = VALUES(category_id),
           ref_unit = VALUES(ref_unit),
           ref_quantity = VALUES(ref_quantity),
           icon_ref = VALUES(icon_ref)`,
        [name, categoryId, ref_unit, parseFloat(ref_quantity), icon_ref || defaultIconRef(name), userId]
      )
      if (res.affectedRows === 1) created++
      else if (res.affectedRows === 2) updated++
    } catch {
      // skip on unexpected error
    }
  }

  return NextResponse.json({ created, updated })
}
