jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/categories/route'
import { PUT, DELETE } from '@/app/api/categories/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, jsonReq , params } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query("DELETE FROM categories WHERE name LIKE 'Test%'")
})

describe('GET /api/categories', () => {
  it('returns 200 with the list of categories', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('is_default')
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    const res = await GET()
    expect(res.status).toBe(401)
  })
})

describe('POST /api/categories', () => {
  it('creates a new category and returns 201', async () => {
    const res = await POST(jsonReq('/api/categories', 'POST', { name: 'Test Catégorie' }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.name).toBe('Test Catégorie')
    expect(data.is_default).toBe(false)
  })

  it('returns 409 for duplicate name', async () => {
    await POST(jsonReq('/api/categories', 'POST', { name: 'Test Duplicate' }))
    const res = await POST(jsonReq('/api/categories', 'POST', { name: 'Test Duplicate' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('CATEGORY_EXISTS')
  })

  it('returns 400 for empty name', async () => {
    const res = await POST(jsonReq('/api/categories', 'POST', { name: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    const res = await POST(jsonReq('/api/categories', 'POST', { name: 'Test X' }))
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/categories/[id]', () => {
  it('renames a category', async () => {
    const created = await POST(jsonReq('/api/categories', 'POST', { name: 'Test Rename Me' }))
    const { id } = await created.json()

    const res = await PUT(
      jsonReq(`/api/categories/${id}`, 'PUT', { name: 'Test Renamed' }),
      params({ id: String(id) })
    )
    expect(res.status).toBe(200)
    expect((await res.json()).name).toBe('Test Renamed')
  })

  it('returns 404 for non-existent id', async () => {
    const res = await PUT(
      jsonReq('/api/categories/999999', 'PUT', { name: 'Test Ghost' }),
      params({ id: '999999' })
    )
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/categories/[id]', () => {
  it('deletes an empty category', async () => {
    const created = await POST(jsonReq('/api/categories', 'POST', { name: 'Test Delete Me' }))
    const { id } = await created.json()

    const res = await DELETE(makeReq(`/api/categories/${id}`, { method: 'DELETE' }), params({ id: String(id) }))
    expect(res.status).toBe(204)
  })

  it('returns 404 for non-existent id', async () => {
    const res = await DELETE(makeReq('/api/categories/999999', { method: 'DELETE' }), params({ id: '999999' }))
    expect(res.status).toBe(404)
  })
})
