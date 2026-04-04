import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import pool from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const [rows] = await pool.query<any[]>(
    `SELECT p.name, c.name AS category, p.ref_unit, p.ref_quantity, p.icon_ref
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ORDER BY c.sort_order, c.name, p.name`
  )

  const products = (rows as any[]).map(r => ({
    name: r.name,
    category: r.category,
    ref_unit: r.ref_unit,
    ref_quantity: parseFloat(r.ref_quantity),
    icon_ref: r.icon_ref ?? null,
  }))

  return new Response(JSON.stringify(products, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="products.json"',
    },
  })
}
