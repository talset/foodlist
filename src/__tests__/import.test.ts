jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { POST } from '@/app/api/import/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, jsonReq, TEST_USER_ID } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM products WHERE created_by = ?', [TEST_USER_ID])
  await pool.query("DELETE FROM categories WHERE name LIKE 'Test Import%'")
})

describe('POST /api/import', () => {
  it('imports products and returns created count', async () => {
    const res = await POST(jsonReq('/api/import', 'POST', [
      { name: 'Test Import Lait', category: 'Produits laitiers', ref_unit: 'L', ref_quantity: 1 },
      { name: 'Test Import Beurre', category: 'Produits laitiers', ref_unit: 'g', ref_quantity: 250 },
    ]))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.created).toBe(2)
    expect(data.skipped).toBe(0)
    expect(data.errors).toHaveLength(0)
  })

  it('skips duplicate product names', async () => {
    const items = [{ name: 'Test Import Unique', category: 'Produits laitiers', ref_unit: 'L', ref_quantity: 1 }]
    await POST(jsonReq('/api/import', 'POST', items))
    const res = await POST(jsonReq('/api/import', 'POST', items))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.created).toBe(0)
    expect(data.skipped).toBe(1)
  })

  it('skips duplicates within the same batch', async () => {
    const res = await POST(jsonReq('/api/import', 'POST', [
      { name: 'Test Import Same', category: 'Produits laitiers', ref_unit: 'L', ref_quantity: 1 },
      { name: 'Test Import Same', category: 'Produits laitiers', ref_unit: 'L', ref_quantity: 1 },
    ]))
    const data = await res.json()
    expect(data.created).toBe(1)
    expect(data.skipped).toBe(1)
  })

  it('creates missing categories on the fly', async () => {
    const res = await POST(jsonReq('/api/import', 'POST', [
      { name: 'Test Import Produit', category: 'Test Import Nouvelle Catégorie', ref_unit: 'unité', ref_quantity: 1 },
    ]))
    const data = await res.json()
    expect(data.created).toBe(1)

    const [rows] = await pool.query<any[]>("SELECT id FROM categories WHERE name = 'Test Import Nouvelle Catégorie'")
    expect((rows as any[]).length).toBe(1)
  })

  it('reports items with missing required fields as errors', async () => {
    const res = await POST(jsonReq('/api/import', 'POST', [
      { name: 'Test Import Bad' },  // missing category, ref_unit, ref_quantity
    ]))
    const data = await res.json()
    expect(data.errors.length).toBeGreaterThan(0)
    expect(data.created).toBe(0)
  })

  it('returns 400 for non-array body', async () => {
    const res = await POST(jsonReq('/api/import', 'POST', { name: 'not an array' }))
    expect(res.status).toBe(400)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    const res = await POST(jsonReq('/api/import', 'POST', []))
    expect(res.status).toBe(401)
  })
})
