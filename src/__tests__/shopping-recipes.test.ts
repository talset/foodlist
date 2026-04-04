jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/shopping/recipes/route'
import { DELETE } from '@/app/api/shopping/recipes/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, jsonReq, TEST_HOUSEHOLD_ID, TEST_RECIPE_ID } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM shopping_recipes WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
  await pool.query('DELETE FROM stock WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
})

describe('GET /api/shopping/recipes', () => {
  it('returns 200 with empty items array', async () => {
    const res = await GET(makeReq('/api/shopping/recipes'))
    expect(res.status).toBe(200)
    expect((await res.json()).items).toEqual([])
  })

  it('returns shopping_recipes after POST', async () => {
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID, multiplier: 1 }))
    const res = await GET(makeReq('/api/shopping/recipes'))
    const data = await res.json()
    expect(data.items.length).toBe(1)
    expect(data.items[0].recipe_id).toBe(TEST_RECIPE_ID)
    expect(data.items[0].recipe_name).toBe('Test Recipe')
  })

  it('multiplier is a number not a string', async () => {
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID, multiplier: 2 }))
    const res = await GET(makeReq('/api/shopping/recipes'))
    const data = await res.json()
    expect(typeof data.items[0].multiplier).toBe('number')
    expect(data.items[0].multiplier).toBe(2)
  })

  it('ingredient_count matches recipe', async () => {
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID }))
    const res = await GET(makeReq('/api/shopping/recipes'))
    expect((await res.json()).items[0].ingredient_count).toBe(1)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await GET(makeReq('/api/shopping/recipes'))).status).toBe(401)
  })
})

describe('POST /api/shopping/recipes', () => {
  it('adds recipe and returns 201 with ApiShoppingRecipe shape', async () => {
    const res = await POST(jsonReq('/api/shopping/recipes', 'POST', {
      recipe_id: TEST_RECIPE_ID,
      multiplier: 1,
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.recipe_id).toBe(TEST_RECIPE_ID)
    expect(data.recipe_name).toBe('Test Recipe')
    expect(data.multiplier).toBe(1)
    expect(data.ingredient_count).toBe(1)
  })

  it('does not modify stock table', async () => {
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID, multiplier: 1 }))
    const [[count]] = await pool.query<any[]>(
      'SELECT COUNT(*) AS n FROM stock WHERE household_id = ?',
      [TEST_HOUSEHOLD_ID]
    )
    expect(count.n).toBe(0)
  })

  it('returns 400 RECIPE_NOT_FOUND for unknown recipe', async () => {
    const res = await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: 999999 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('RECIPE_NOT_FOUND')
  })

  it('returns 400 INVALID_MULTIPLIER for multiplier <= 0', async () => {
    const res = await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID, multiplier: 0 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('INVALID_MULTIPLIER')
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await POST(jsonReq('/api/shopping/recipes', 'POST', {}))).status).toBe(401)
  })
})

describe('DELETE /api/shopping/recipes/[id]', () => {
  it('removes recipe from list and returns 204', async () => {
    const created = await (await POST(jsonReq('/api/shopping/recipes', 'POST', {
      recipe_id: TEST_RECIPE_ID,
    }))).json()

    const res = await DELETE(
      makeReq(`/api/shopping/recipes/${created.id}`, { method: 'DELETE' }),
      { params: { id: String(created.id) } }
    )
    expect(res.status).toBe(204)

    const list = await (await GET(makeReq('/api/shopping/recipes'))).json()
    expect(list.items).toEqual([])
  })

  it('returns 404 for unknown id', async () => {
    const res = await DELETE(
      makeReq('/api/shopping/recipes/999999', { method: 'DELETE' }),
      { params: { id: '999999' } }
    )
    expect(res.status).toBe(404)
  })
})
