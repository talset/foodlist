jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET as GET_CATEGORIES } from '@/app/api/recipe-categories/route'
import { POST } from '@/app/api/recipes/route'
import { PUT, GET as GET_ONE } from '@/app/api/recipes/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, jsonReq, TEST_USER_ID } from './helpers'

let testCategoryId: number

beforeAll(async () => {
  const [[row]] = await pool.query<any[]>("SELECT id FROM recipe_categories WHERE name = 'Dessert' LIMIT 1")
  testCategoryId = row?.id
})

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE created_by = ? AND id != 9999)', [TEST_USER_ID])
  await pool.query('DELETE FROM recipes WHERE created_by = ? AND id != 9999', [TEST_USER_ID])
})

describe('GET /api/recipe-categories', () => {
  it('returns 200 with array of categories', async () => {
    const res = await GET_CATEGORIES()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('sort_order')
  })

  it('includes Dessert category', async () => {
    const res = await GET_CATEGORIES()
    const data = await res.json()
    expect(data.some((c: any) => c.name === 'Dessert')).toBe(true)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    const res = await GET_CATEGORIES()
    expect(res.status).toBe(401)
  })
})

describe('recipe_category_id on recipes', () => {
  it('POST creates recipe with category', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', {
      name: `Cat Test ${Date.now()}`,
      base_servings: 4,
      recipe_category_id: testCategoryId,
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.recipe_category_id).toBe(testCategoryId)
    expect(data.recipe_category_name).toBe('Dessert')
  })

  it('POST creates recipe without category (null)', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', {
      name: `NoCat Test ${Date.now()}`,
      base_servings: 4,
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.recipe_category_id).toBeNull()
    expect(data.recipe_category_name).toBeNull()
  })

  it('PUT updates recipe category', async () => {
    const created = await (await POST(jsonReq('/api/recipes', 'POST', {
      name: `UpdCat Test ${Date.now()}`,
      base_servings: 4,
    }))).json()

    const res = await PUT(
      jsonReq(`/api/recipes/${created.id}`, 'PUT', { recipe_category_id: testCategoryId }),
      { params: { id: String(created.id) } }
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.recipe_category_id).toBe(testCategoryId)
    expect(data.recipe_category_name).toBe('Dessert')
  })

  it('PUT can set category to null', async () => {
    const created = await (await POST(jsonReq('/api/recipes', 'POST', {
      name: `NullCat Test ${Date.now()}`,
      base_servings: 4,
      recipe_category_id: testCategoryId,
    }))).json()

    const res = await PUT(
      jsonReq(`/api/recipes/${created.id}`, 'PUT', { recipe_category_id: null }),
      { params: { id: String(created.id) } }
    )
    expect(res.status).toBe(200)
    expect((await res.json()).recipe_category_id).toBeNull()
  })

  it('GET /api/recipes/[id] includes category fields', async () => {
    const created = await (await POST(jsonReq('/api/recipes', 'POST', {
      name: `GetCat Test ${Date.now()}`,
      base_servings: 4,
      recipe_category_id: testCategoryId,
    }))).json()

    const res = await GET_ONE(makeReq(`/api/recipes/${created.id}`), { params: { id: String(created.id) } })
    const data = await res.json()
    expect(data.recipe_category_id).toBe(testCategoryId)
    expect(data.recipe_category_name).toBe('Dessert')
  })
})
