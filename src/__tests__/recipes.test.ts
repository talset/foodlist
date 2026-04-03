jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/recipes/route'
import { GET as GET_ONE, PUT, DELETE } from '@/app/api/recipes/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, jsonReq, TEST_USER_ID, TEST_RECIPE_ID, TEST_PRODUCT_ID } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM recipes WHERE created_by = ? AND id != ?', [TEST_USER_ID, TEST_RECIPE_ID])
})

function recipeBody(overrides = {}) {
  return {
    name: `Test Recipe ${Date.now()}`,
    base_servings: 4,
    ...overrides,
  }
}

async function createRecipe(overrides = {}) {
  const res = await POST(jsonReq('/api/recipes', 'POST', recipeBody(overrides)))
  return res.json()
}

describe('GET /api/recipes', () => {
  it('returns 200 with recipes array', async () => {
    const res = await GET(makeReq('/api/recipes'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.recipes)).toBe(true)
  })

  it('includes ingredient_count for seeded recipe', async () => {
    const res = await GET(makeReq('/api/recipes'))
    const data = await res.json()
    const seeded = data.recipes.find((r: any) => r.id === TEST_RECIPE_ID)
    expect(seeded).toBeDefined()
    expect(seeded.ingredient_count).toBe(1)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await GET(makeReq('/api/recipes'))).status).toBe(401)
  })
})

describe('POST /api/recipes', () => {
  it('creates recipe without ingredients and returns 201', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', recipeBody()))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.ingredients).toEqual([])
    expect(data.base_servings).toBe(4)
  })

  it('creates recipe with ingredients, quantity is a number', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', recipeBody({
      ingredients: [{ product_id: TEST_PRODUCT_ID, quantity: 1.5 }],
    })))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.ingredients.length).toBe(1)
    expect(typeof data.ingredients[0].quantity).toBe('number')
    expect(data.ingredients[0].quantity).toBe(1.5)
  })

  it('returns 400 INVALID_INPUT for missing name', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', { base_servings: 4 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('INVALID_INPUT')
  })

  it('returns 400 INVALID_INPUT for non-integer base_servings', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', recipeBody({ base_servings: 4.5 })))
    expect(res.status).toBe(400)
  })

  it('returns 400 PRODUCT_NOT_FOUND for unknown product in ingredients', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', recipeBody({
      ingredients: [{ product_id: 999999, quantity: 1 }],
    })))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('PRODUCT_NOT_FOUND')
  })

  it('returns 400 DUPLICATE_INGREDIENT for duplicate product_id', async () => {
    const res = await POST(jsonReq('/api/recipes', 'POST', recipeBody({
      ingredients: [
        { product_id: TEST_PRODUCT_ID, quantity: 1 },
        { product_id: TEST_PRODUCT_ID, quantity: 2 },
      ],
    })))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('DUPLICATE_INGREDIENT')
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await POST(jsonReq('/api/recipes', 'POST', {}))).status).toBe(401)
  })
})

describe('GET /api/recipes/[id]', () => {
  it('returns full recipe with ingredients for seeded recipe', async () => {
    const res = await GET_ONE(makeReq(`/api/recipes/${TEST_RECIPE_ID}`), { params: { id: String(TEST_RECIPE_ID) } })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBe(TEST_RECIPE_ID)
    expect(data.ingredients.length).toBe(1)
    expect(data.ingredients[0].product_name).toBe('Test Product Stock')
  })

  it('ingredient quantity is a number not a string', async () => {
    const res = await GET_ONE(makeReq(`/api/recipes/${TEST_RECIPE_ID}`), { params: { id: String(TEST_RECIPE_ID) } })
    const data = await res.json()
    expect(typeof data.ingredients[0].quantity).toBe('number')
  })

  it('returns 404 for unknown id', async () => {
    const res = await GET_ONE(makeReq('/api/recipes/999999'), { params: { id: '999999' } })
    expect(res.status).toBe(404)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await GET_ONE(makeReq(`/api/recipes/${TEST_RECIPE_ID}`), { params: { id: String(TEST_RECIPE_ID) } })).status).toBe(401)
  })
})

describe('PUT /api/recipes/[id]', () => {
  it('updates name', async () => {
    const created = await createRecipe()
    const res = await PUT(
      jsonReq(`/api/recipes/${created.id}`, 'PUT', { name: 'Updated Name' }),
      { params: { id: String(created.id) } }
    )
    expect(res.status).toBe(200)
    expect((await res.json()).name).toBe('Updated Name')
  })

  it('replaces ingredients entirely', async () => {
    const created = await createRecipe({
      ingredients: [{ product_id: TEST_PRODUCT_ID, quantity: 1 }],
    })
    const res = await PUT(
      jsonReq(`/api/recipes/${created.id}`, 'PUT', {
        ingredients: [{ product_id: TEST_PRODUCT_ID, quantity: 5 }],
      }),
      { params: { id: String(created.id) } }
    )
    const data = await res.json()
    expect(data.ingredients.length).toBe(1)
    expect(data.ingredients[0].quantity).toBe(5)
  })

  it('accepts empty ingredients array to remove all', async () => {
    const created = await createRecipe({
      ingredients: [{ product_id: TEST_PRODUCT_ID, quantity: 1 }],
    })
    const res = await PUT(
      jsonReq(`/api/recipes/${created.id}`, 'PUT', { ingredients: [] }),
      { params: { id: String(created.id) } }
    )
    expect((await res.json()).ingredients).toEqual([])
  })

  it('returns 400 NOTHING_TO_UPDATE for empty body', async () => {
    const created = await createRecipe()
    const res = await PUT(
      jsonReq(`/api/recipes/${created.id}`, 'PUT', {}),
      { params: { id: String(created.id) } }
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('NOTHING_TO_UPDATE')
  })

  it('returns 404 for unknown id', async () => {
    const res = await PUT(
      jsonReq('/api/recipes/999999', 'PUT', { name: 'X' }),
      { params: { id: '999999' } }
    )
    expect(res.status).toBe(404)
  })

  it('returns 400 PRODUCT_NOT_FOUND for invalid ingredient product_id', async () => {
    const created = await createRecipe()
    const res = await PUT(
      jsonReq(`/api/recipes/${created.id}`, 'PUT', {
        ingredients: [{ product_id: 999999, quantity: 1 }],
      }),
      { params: { id: String(created.id) } }
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('PRODUCT_NOT_FOUND')
  })
})

describe('DELETE /api/recipes/[id]', () => {
  it('deletes recipe and returns 204', async () => {
    const created = await createRecipe()
    const res = await DELETE(
      makeReq(`/api/recipes/${created.id}`, { method: 'DELETE' }),
      { params: { id: String(created.id) } }
    )
    expect(res.status).toBe(204)
  })

  it('cascade-deletes ingredients', async () => {
    const created = await createRecipe({
      ingredients: [{ product_id: TEST_PRODUCT_ID, quantity: 1 }],
    })
    await DELETE(
      makeReq(`/api/recipes/${created.id}`, { method: 'DELETE' }),
      { params: { id: String(created.id) } }
    )
    const [[{ count }]] = await pool.query<any[]>(
      'SELECT COUNT(*) AS count FROM recipe_ingredients WHERE recipe_id = ?',
      [created.id]
    )
    expect(Number(count)).toBe(0)
  })

  it('returns 404 for unknown id', async () => {
    const res = await DELETE(
      makeReq('/api/recipes/999999', { method: 'DELETE' }),
      { params: { id: '999999' } }
    )
    expect(res.status).toBe(404)
  })
})
