import type { DefaultSession } from 'next-auth'

// ── Database row types ────────────────────────────────────────────────────────

export interface DbUser {
  id: number
  email: string
  password_hash: string | null
  google_id: string | null
  name: string
  created_at: Date
}

export interface DbHousehold {
  id: number
  name: string
  created_by: number
  invite_token: string
  created_at: Date
}

export interface DbHouseholdMember {
  household_id: number
  user_id: number
  role: 'admin' | 'member'
  joined_at: Date
}

// ── NextAuth type augmentation ────────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      householdId: number | null
      householdRole: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    householdId: number | null
    householdRole: string | null
  }
}
