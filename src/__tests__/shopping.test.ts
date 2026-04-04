jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET } from '@/app/api/shopping/route'
import { POST as restockAll } from '@/app/api/shopping/restock/route'
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

describe('POST /api/shopping/restock', () => {
  it('marks all out_of_stock items as in_stock and returns restocked count', async () => {
    await pool.query(
      `INSERT INTO stock (product_id, household_id, quantity, status, updated_by)
       VALUES (?, ?, 0, 'out_of_stock', 9999)`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    const res = await restockAll(makeReq('/api/shopping/restock', { method: 'POST' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.restocked).toBe(1)

    // Shopping list should now be empty
    const list = await (await GET(makeReq('/api/shopping'))).json()
    expect(list.items).toEqual([])
  })

  it('returns restocked=0 when nothing was out_of_stock', async () => {
    const res = await restockAll(makeReq('/api/shopping/restock', { method: 'POST' }))
    expect(res.status).toBe(200)
    expect((await res.json()).restocked).toBe(0)
  })

  it('does not affect in_stock or low items', async () => {
    await pool.query(
      `INSERT INTO stock (product_id, household_id, quantity, status, updated_by)
       VALUES (?, ?, 2, 'in_stock', 9999)`,
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    const res = await restockAll(makeReq('/api/shopping/restock', { method: 'POST' }))
    expect((await res.json()).restocked).toBe(0)

    const [[row]] = await pool.query<any[]>(
      'SELECT status FROM stock WHERE product_id = ? AND household_id = ?',
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    expect(row.status).toBe('in_stock')
  })

  it('returns 401 without session', async () => {
    mockNoSession()
    expect((await restockAll(makeReq('/api/shopping/restock', { method: 'POST' }))).status).toBe(401)
  })
})
