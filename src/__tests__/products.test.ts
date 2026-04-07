jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/products/route'
import { GET as GET_ONE, PUT, DELETE } from '@/app/api/products/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, jsonReq, TEST_USER_ID, TEST_PRODUCT_ID , params } from './helpers'

let categoryId: number

beforeAll(async () => {
  const [rows] = await pool.query<any[]>('SELECT id FROM categories LIMIT 1')
  categoryId = rows[0].id
})

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM products WHERE created_by = ? AND id != ?', [TEST_USER_ID, TEST_PRODUCT_ID])
})

function productBody(overrides = {}) {
  return {
    name: `Test Product ${Date.now()}`,
    category_id: categoryId,
    ref_unit: 'unité',
    ref_quantity: 1,
    ...overrides,
  }
}

describe('GET /api/products', () => {
  it('returns 200 with products array and total', async () => {
    const res = await GET(makeReq('/api/products'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.products)).toBe(true)
    expect(typeof data.total).toBe('number')
  })

  it('filters by search query', async () => {
    await POST(jsonReq('/api/products', 'POST', productBody({ name: 'Test Lait Entier' })))
    const res = await GET(makeReq('/api/products?q=Lait+Entier'))
    const data = await res.json()
    expect(data.products.some((p: any) => p.name === 'Test Lait Entier')).toBe(true)
  })

  it('filters by category_id', async () => {
    const res = await GET(makeReq(`/api/products?category_id=${categoryId}`))
    const data = await res.json()
    data.products.forEach((p: any) => expect(p.category_id).toBe(categoryId))
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await GET(makeReq('/api/products'))).status).toBe(401)
  })
})

describe('POST /api/products', () => {
  it('creates a product and returns 201', async () => {
    const body = productBody({ name: 'Test Nouveau Produit' })
    const res = await POST(jsonReq('/api/products', 'POST', body))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.name).toBe('Test Nouveau Produit')
    expect(data.ref_quantity).toBe(1)
    expect(data.icon_url).toBeNull()
  })

  it('returns 409 for duplicate name', async () => {
    const body = productBody({ name: 'Test Duplicate Produit' })
    await POST(jsonReq('/api/products', 'POST', body))
    const res = await POST(jsonReq('/api/products', 'POST', body))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('PRODUCT_EXISTS')
  })

  it('returns 400 for missing required fields', async () => {
    const res = await POST(jsonReq('/api/products', 'POST', { name: 'Test Incomplet' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-existent category', async () => {
    const res = await POST(jsonReq('/api/products', 'POST', productBody({ category_id: 999999 })))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('CATEGORY_NOT_FOUND')
  })
})

describe('GET /api/products/[id]', () => {
  it('returns the product', async () => {
    const created = await (await POST(jsonReq('/api/products', 'POST', productBody()))).json()
    const res = await GET_ONE(makeReq(`/api/products/${created.id}`), params({ id: String(created.id) }))
    expect(res.status).toBe(200)
    expect((await res.json()).id).toBe(created.id)
  })

  it('returns 404 for non-existent id', async () => {
    const res = await GET_ONE(makeReq('/api/products/999999'), params({ id: '999999' }))
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/products/[id]', () => {
  it('updates product fields', async () => {
    const created = await (await POST(jsonReq('/api/products', 'POST', productBody()))).json()
    const res = await PUT(
      jsonReq(`/api/products/${created.id}`, 'PUT', { ref_unit: 'kg', ref_quantity: 0.5 }),
      params({ id: String(created.id) })
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ref_unit).toBe('kg')
    expect(data.ref_quantity).toBe(0.5)
  })

  it('returns 404 for non-existent id', async () => {
    const res = await PUT(
      jsonReq('/api/products/999999', 'PUT', { ref_unit: 'L' }),
      params({ id: '999999' })
    )
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/products/[id]', () => {
  it('deletes a product', async () => {
    const created = await (await POST(jsonReq('/api/products', 'POST', productBody()))).json()
    const res = await DELETE(
      makeReq(`/api/products/${created.id}`, { method: 'DELETE' }),
      params({ id: String(created.id) })
    )
    expect(res.status).toBe(204)
  })

  it('returns 404 for non-existent id', async () => {
    const res = await DELETE(
      makeReq('/api/products/999999', { method: 'DELETE' }),
      params({ id: '999999' })
    )
    expect(res.status).toBe(404)
  })
})
