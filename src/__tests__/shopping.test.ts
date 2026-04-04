jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET } from '@/app/api/shopping/route'
import pool from '@/lib/db'
import { mockSession, mockNoSession, makeReq, TEST_HOUSEHOLD_ID, TEST_PRODUCT_ID } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM shopping_recipes WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
  await pool.query('DELETE FROM stock WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
})

describe('GET /api/shopping', () => {
  it('returns 200 with empty items when nothing is out_of_stock', async () => {
    const res = await GET(makeReq('/api/shopping'))
    expect(res.status).toBe(200)
    expect((await res.json()).items).toEqual([])
  })

  it('returns out_of_stock items', async () => {
    await pool.query(
      `INSERT INTO stock (product_id, household_id, quantity, status, updated_by)
       VALUES (?, ?, 0, 'out_of_stock', 9999)`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    const res = await GET(makeReq('/api/shopping'))
    const data = await res.json()
    expect(data.items.length).toBe(1)
    expect(data.items[0].status).toBe('out_of_stock')
    expect(data.items[0].product_id).toBe(TEST_PRODUCT_ID)
  })

  it('does not return in_stock items', async () => {
    await pool.query(
      `INSERT INTO stock (product_id, household_id, quantity, status, updated_by)
       VALUES (?, ?, 2, 'in_stock', 9999)`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    const res = await GET(makeReq('/api/shopping'))
    expect((await res.json()).items).toEqual([])
  })

  it('includes recipe_quantity = 0 when no recipes are active', async () => {
    await pool.query(
      `INSERT INTO stock (product_id, household_id, quantity, status, updated_by)
       VALUES (?, ?, 0, 'out_of_stock', 9999)`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    const res = await GET(makeReq('/api/shopping'))
    const data = await res.json()
    expect(data.items[0].recipe_quantity).toBe(0)
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await GET(makeReq('/api/shopping'))).status).toBe(401)
  })
})
