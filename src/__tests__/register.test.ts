import { POST } from '@/app/api/auth/register/route'
import pool from '@/lib/db'
import { makeReq, jsonReq } from './helpers'

// No session needed — register is a public endpoint

afterEach(async () => {
  await pool.query("DELETE FROM users WHERE email LIKE '%@test.register'")
})

describe('POST /api/auth/register', () => {
  it('creates a new user and returns 201', async () => {
    const res = await POST(jsonReq('/api/auth/register', 'POST', {
      email: 'alice@test.register',
      password: 'password123',
      name: 'Alice',
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.email).toBe('alice@test.register')
    expect(data.name).toBe('Alice')
    expect(data.id).toBeGreaterThan(0)
  })

  it('returns 409 for duplicate email', async () => {
    const body = { email: 'bob@test.register', password: 'password123', name: 'Bob' }
    await POST(jsonReq('/api/auth/register', 'POST', body))
    const res = await POST(jsonReq('/api/auth/register', 'POST', body))
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toBe('EMAIL_TAKEN')
  })

  it('returns 400 for password shorter than 8 chars', async () => {
    const res = await POST(jsonReq('/api/auth/register', 'POST', {
      email: 'carol@test.register',
      password: 'short',
      name: 'Carol',
    }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('PASSWORD_TOO_SHORT')
  })

  it('returns 400 for invalid email format', async () => {
    const res = await POST(jsonReq('/api/auth/register', 'POST', {
      email: 'not-an-email',
      password: 'password123',
      name: 'Dave',
    }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('INVALID_EMAIL')
  })

  it('returns 400 when fields are missing', async () => {
    const res = await POST(jsonReq('/api/auth/register', 'POST', { email: 'x@test.register' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('INVALID_INPUT')
  })
})
