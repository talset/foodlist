jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/sse', () => ({ broadcast: jest.fn() }))

import { POST } from '@/app/api/shopping/recipes/route'
import pool from '@/lib/db'
import { mockSession, jsonReq, TEST_HOUSEHOLD_ID, TEST_RECIPE_ID, TEST_PRODUCT_ID } from './helpers'

beforeEach(() => mockSession())

afterEach(async () => {
  await pool.query('DELETE FROM shopping_recipes WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
  await pool.query('DELETE FROM stock WHERE household_id = ?', [TEST_HOUSEHOLD_ID])
})

describe('Shopping recipe auto-stock', () => {
  it('creates out_of_stock entry for ingredients not in stock', async () => {
    // Verify no stock entry exists
    const [[before]] = await pool.query<any[]>(
      'SELECT COUNT(*) AS n FROM stock WHERE product_id = ? AND household_id = ?',
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    expect(before.n).toBe(0)

    // Add recipe to shopping list
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID }))

    // Verify stock entry was created as out_of_stock
    const [[after]] = await pool.query<any[]>(
      'SELECT status, quantity FROM stock WHERE product_id = ? AND household_id = ?',
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    expect(after.status).toBe('out_of_stock')
    expect(after.quantity).toBe(0)
  })

  it('does not overwrite existing stock entries', async () => {
    // Create an in_stock entry first
    await pool.query(
      "INSERT INTO stock (product_id, household_id, quantity, status, updated_by) VALUES (?, ?, 5, 'in_stock', 9999)",
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )

    // Add recipe to shopping list
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID }))

    // Verify existing entry was not changed
    const [[row]] = await pool.query<any[]>(
      'SELECT status, quantity FROM stock WHERE product_id = ? AND household_id = ?',
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    expect(row.status).toBe('in_stock')
    expect(row.quantity).toBe(5)
  })

  it('adding same recipe twice does not duplicate stock entries', async () => {
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID }))
    await POST(jsonReq('/api/shopping/recipes', 'POST', { recipe_id: TEST_RECIPE_ID }))

    const [[{ n }]] = await pool.query<any[]>(
      'SELECT COUNT(*) AS n FROM stock WHERE product_id = ? AND household_id = ?',
      [TEST_PRODUCT_ID, TEST_HOUSEHOLD_ID]
    )
    expect(n).toBe(1)
  })
})
