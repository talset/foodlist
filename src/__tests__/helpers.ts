import { getServerSession } from 'next-auth'

export const TEST_USER_ID = 9999
export const TEST_HOUSEHOLD_ID = 9999

export function mockSession(userId = TEST_USER_ID) {
  jest.mocked(getServerSession).mockResolvedValue({
    user: {
      id: userId,
      householdId: TEST_HOUSEHOLD_ID,
      householdRole: 'admin',
      email: 'test@foodlist.test',
      name: 'Test User',
    },
    expires: '2099-01-01',
  })
}

export function mockNoSession() {
  jest.mocked(getServerSession).mockResolvedValue(null)
}

export function makeReq(url: string, options?: RequestInit): Request {
  return new Request(`http://localhost${url}`, options)
}

export function jsonReq(url: string, method: string, body: unknown): Request {
  return makeReq(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
