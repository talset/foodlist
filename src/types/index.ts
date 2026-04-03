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

export interface DbCategory {
  id: number
  name: string
  is_default: number
  sort_order: number
  created_at: Date
}

export interface DbProduct {
  id: number
  name: string
  category_id: number
  ref_unit: string
  ref_quantity: string  // mysql2 returns DECIMAL as string
  icon_ref: string | null
  created_by: number
  created_at: Date
}

export interface ApiProduct {
  id: number
  name: string
  category_id: number
  category_name: string
  ref_unit: string
  ref_quantity: number
  icon_ref: string | null
  icon_url: string | null
}

export interface ApiCategory {
  id: number
  name: string
  is_default: boolean
  sort_order: number
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
