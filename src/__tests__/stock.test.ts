jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/stock/route'
import { PATCH, DELETE } from '@/app/api/stock/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, jsonReq, TEST_HOUSEHOLD_ID, TEST_PRODUCT_ID } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM stock WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
})

async function createStockItem(overrides = {}) {
  const res = await POST(jsonReq('/api/stock', 'POST', {
    product_id: TEST_PRODUCT_ID,
    quantity: 2,
    status: 'in_stock',
    ...overrides,
  }))
  return res.json()
}

describe('GET /api/stock', () => {
  it('returns 200 with empty items array', async () => {
    const res = await GET(makeReq('/api/stock'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.items)).toBe(true)
  })

  it('returns item with joined product and category info', async () => {
    await createStockItem()
    const res = await GET(makeReq('/api/stock'))
    const data = await res.json()
    expect(data.items.length).toBe(1)
    const item = data.items[0]
    expect(item.product_name).toBe('Test Product Stock')
    expect(item.category_name).toBeTruthy()
    expect(item.ref_unit).toBe('unité')
    expect(item.quantity).toBe(2)
    expect(item.status).toBe('in_stock')
  })

  it('filters by status=out_of_stock', async () => {
    await createStockItem({ status: 'out_of_stock', quantity: 0 })
    const res = await GET(makeReq('/api/stock?status=out_of_stock'))
    const data = await res.json()
    expect(data.items.length).toBe(1)
    expect(data.items[0].status).toBe('out_of_stock')
  })

  it('returns 400 for invalid status filter', async () => {
    const res = await GET(makeReq('/api/stock?status=shopping_list'))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('INVALID_STATUS')
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await GET(makeReq('/api/stock'))).status).toBe(401)
  })
})

describe('POST /api/stock', () => {
  it('creates item and returns 201 with full shape', async () => {
    const res = await POST(jsonReq('/api/stock', 'POST', {
      product_id: TEST_PRODUCT_ID,
      quantity: 3,
      status: 'low',
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.product_id).toBe(TEST_PRODUCT_ID)
    expect(data.quantity).toBe(3)
    expect(data.status).toBe('low')
    expect(data.product_name).toBe('Test Product Stock')
    expect(data.updated_at).toBeTruthy()
  })

  it('defaults quantity to 0, status to in_stock', async () => {
    const res = await POST(jsonReq('/api/stock', 'POST', { product_id: TEST_PRODUCT_ID }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.quantity).toBe(0)
    expect(data.status).toBe('in_stock')
  })

  it('returns 409 STOCK_ITEM_EXISTS for duplicate', async () => {
    await createStockItem()
    const res = await POST(jsonReq('/api/stock', 'POST', { product_id: TEST_PRODUCT_ID }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('STOCK_ITEM_EXISTS')
  })

  it('returns 400 PRODUCT_NOT_FOUND for unknown product', async () => {
    const res = await POST(jsonReq('/api/stock', 'POST', { product_id: 999999 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('PRODUCT_NOT_FOUND')
  })

  it('returns 400 for invalid status', async () => {
    const res = await POST(jsonReq('/api/stock', 'POST', {
      product_id: TEST_PRODUCT_ID,
      status: 'shopping_list',
    }))
    expect(res.status).toBe(400)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await POST(jsonReq('/api/stock', 'POST', {}))).status).toBe(401)
  })
})

describe('PATCH /api/stock/[id]', () => {
  it('updates quantity', async () => {
    const item = await createStockItem()
    const res = await PATCH(
      jsonReq(`/api/stock/${item.id}`, 'PATCH', { quantity: 10 }),
      { params: { id: String(item.id) } }
    )
    expect(res.status).toBe(200)
    expect((await res.json()).quantity).toBe(10)
  })

  it('updates status to low', async () => {
    const item = await createStockItem()
    const res = await PATCH(
      jsonReq(`/api/stock/${item.id}`, 'PATCH', { status: 'low' }),
      { params: { id: String(item.id) } }
    )
    expect((await res.json()).status).toBe('low')
  })

  it('auto-derives out_of_stock status when quantity set to 0', async () => {
    const item = await createStockItem({ quantity: 2, status: 'in_stock' })
    const res = await PATCH(
      jsonReq(`/api/stock/${item.id}`, 'PATCH', { quantity: 0 }),
      { params: { id: String(item.id) } }
    )
    expect((await res.json()).status).toBe('out_of_stock')
  })

  it('auto-derives in_stock status when quantity set from 0 to positive', async () => {
    const item = await createStockItem({ quantity: 0, status: 'out_of_stock' })
    const res = await PATCH(
      jsonReq(`/api/stock/${item.id}`, 'PATCH', { quantity: 1 }),
      { params: { id: String(item.id) } }
    )
    expect((await res.json()).status).toBe('in_stock')
  })

  it('returns 400 NOTHING_TO_UPDATE for empty body', async () => {
    const item = await createStockItem()
    const res = await PATCH(
      jsonReq(`/api/stock/${item.id}`, 'PATCH', {}),
      { params: { id: String(item.id) } }
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('NOTHING_TO_UPDATE')
  })

  it('returns 400 for invalid status', async () => {
    const item = await createStockItem()
    const res = await PATCH(
      jsonReq(`/api/stock/${item.id}`, 'PATCH', { status: 'shopping_list' }),
      { params: { id: String(item.id) } }
    )
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown id', async () => {
    const res = await PATCH(
      jsonReq('/api/stock/999999', 'PATCH', { quantity: 1 }),
      { params: { id: '999999' } }
    )
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/stock/[id]', () => {
  it('deletes item and returns 204', async () => {
    const item = await createStockItem()
    const res = await DELETE(
      makeReq(`/api/stock/${item.id}`, { method: 'DELETE' }),
      { params: { id: String(item.id) } }
    )
    expect(res.status).toBe(204)
  })

  it('returns 404 for unknown id', async () => {
    const res = await DELETE(
      makeReq('/api/stock/999999', { method: 'DELETE' }),
      { params: { id: '999999' } }
    )
    expect(res.status).toBe(404)
  })
})
