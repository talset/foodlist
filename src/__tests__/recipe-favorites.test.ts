jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { POST, DELETE } from '@/app/api/recipes/[id]/favorite/route'
import { GET } from '@/app/api/recipes/route'
import { GET as GET_ONE } from '@/app/api/recipes/[id]/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, TEST_USER_ID, TEST_RECIPE_ID , params } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM recipe_favorites WHERE user_id = ?', [TEST_USER_ID])
})

describe('POST /api/recipes/[id]/favorite', () => {
  it('adds favorite and returns is_favorite true', async () => {
    const res = await POST(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'POST' }), params({ id: String(TEST_RECIPE_ID) }))
    expect(res.status).toBe(200)
    expect((await res.json()).is_favorite).toBe(true)
  })

  it('is idempotent — adding twice does not error', async () => {
    await POST(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'POST' }), params({ id: String(TEST_RECIPE_ID) }))
    const res = await POST(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'POST' }), params({ id: String(TEST_RECIPE_ID) }))
    expect(res.status).toBe(200)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    const res = await POST(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'POST' }), params({ id: String(TEST_RECIPE_ID) }))
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/recipes/[id]/favorite', () => {
  it('removes favorite and returns is_favorite false', async () => {
    await POST(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'POST' }), params({ id: String(TEST_RECIPE_ID) }))
    const res = await DELETE(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'DELETE' }), params({ id: String(TEST_RECIPE_ID) }))
    expect(res.status).toBe(200)
    expect((await res.json()).is_favorite).toBe(false)
  })

  it('is idempotent — removing when not favorited does not error', async () => {
    const res = await DELETE(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'DELETE' }), params({ id: String(TEST_RECIPE_ID) }))
    expect(res.status).toBe(200)
  })
})

describe('is_favorite in recipe responses', () => {
  it('GET /api/recipes includes is_favorite=false by default', async () => {
    const res = await GET(makeReq('/api/recipes'))
    const data = await res.json()
    const recipe = data.recipes.find((r: any) => r.id === TEST_RECIPE_ID)
    expect(recipe.is_favorite).toBe(false)
  })

  it('GET /api/recipes includes is_favorite=true after favoriting', async () => {
    await POST(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'POST' }), params({ id: String(TEST_RECIPE_ID) }))
    const res = await GET(makeReq('/api/recipes'))
    const data = await res.json()
    const recipe = data.recipes.find((r: any) => r.id === TEST_RECIPE_ID)
    expect(recipe.is_favorite).toBe(true)
  })

  it('GET /api/recipes/[id] includes is_favorite', async () => {
    await POST(makeReq(`/api/recipes/${TEST_RECIPE_ID}/favorite`, { method: 'POST' }), params({ id: String(TEST_RECIPE_ID) }))
    const res = await GET_ONE(makeReq(`/api/recipes/${TEST_RECIPE_ID}`), params({ id: String(TEST_RECIPE_ID) }))
    const data = await res.json()
    expect(data.is_favorite).toBe(true)
  })
})
