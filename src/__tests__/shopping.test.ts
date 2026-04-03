jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/shopping/route'
import { PATCH } from '@/app/api/stock/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, jsonReq, TEST_HOUSEHOLD_ID, TEST_PRODUCT_ID } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM stock WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
})

describe('GET /api/shopping', () => {
  it('returns 200 with empty items array', async () => {
    const res = await GET(makeReq('/api/shopping'))
    expect(res.status).toBe(200)
    expect((await res.json()).items).toEqual([])
  })

  it('returns only shopping_list items', async () => {
    // Add one in_stock and one shopping_list
    await pool.query(
      `INSERT INTO stock (product_id, household_id, quantity, unit, status, updated_by)
       VALUES (?, ?, 1, 'unité', 'in_stock', 9999)`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    // Can't add second row for same product due to UNIQUE — update status instead
    await pool.query(
      `UPDATE stock SET status = 'shopping_list' WHERE product_id = ? AND household_id = ?`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    const res = await GET(makeReq('/api/shopping'))
    const data = await res.json()
    expect(data.items.length).toBe(1)
    expect(data.items[0].status).toBe('shopping_list')
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await GET(makeReq('/api/shopping'))).status).toBe(401)
  })
})

describe('POST /api/shopping', () => {
  it('creates item with shopping_list status and returns 201', async () => {
    const res = await POST(jsonReq('/api/shopping', 'POST', {
      product_id: TEST_PRODUCT_ID,
      quantity: 1,
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.status).toBe('shopping_list')
    expect(data.product_name).toBe('Test Product Stock')
  })

  it('returns 409 if product already in stock', async () => {
    await POST(jsonReq('/api/shopping', 'POST', { product_id: TEST_PRODUCT_ID }))
    const res = await POST(jsonReq('/api/shopping', 'POST', { product_id: TEST_PRODUCT_ID }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('STOCK_ITEM_EXISTS')
  })

  it('returns 400 for unknown product', async () => {
    const res = await POST(jsonReq('/api/shopping', 'POST', { product_id: 999999 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('PRODUCT_NOT_FOUND')
  })
})

describe('Shopping workflow', () => {
  it('add to list → appears in GET /api/shopping', async () => {
    const postRes = await POST(jsonReq('/api/shopping', 'POST', { product_id: TEST_PRODUCT_ID }))
    expect(postRes.status).toBe(201)
    const res = await GET(makeReq('/api/shopping'))
    const data = await res.json()
    expect(data.items.some((i: any) => i.product_id === TEST_PRODUCT_ID)).toBe(true)
  })

  it('check off (PATCH in_stock) → removed from shopping list', async () => {
    const created = await (await POST(jsonReq('/api/shopping', 'POST', {
      product_id: TEST_PRODUCT_ID,
    }))).json()

    await PATCH(
      jsonReq(`/api/stock/${created.id}`, 'PATCH', { status: 'in_stock' }),
      { params: { id: String(created.id) } }
    )

    const res = await GET(makeReq('/api/shopping'))
    const data = await res.json()
    expect(data.items.every((i: any) => i.product_id !== TEST_PRODUCT_ID)).toBe(true)
  })

  it('mark in_stock item as shopping_list → appears in GET /api/shopping', async () => {
    // Insert directly as in_stock
    await pool.query(
      `INSERT INTO stock (product_id, household_id, quantity, unit, status, updated_by)
       VALUES (?, ?, 0, 'unité', 'in_stock', 9999)`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    const [[row]] = await pool.query<any[]>(
      'SELECT id FROM stock WHERE product_id = ? AND household_id = ?',
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    await PATCH(
      jsonReq(`/api/stock/${row.id}`, 'PATCH', { status: 'shopping_list' }),
      { params: { id: String(row.id) } }
    )
    const res = await GET(makeReq('/api/shopping'))
    expect((await res.json()).items.length).toBe(1)
  })
})
