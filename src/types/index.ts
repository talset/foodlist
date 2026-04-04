import type { DefaultSession } from 'next-auth'
import type { SiteTheme } from '@/lib/themes'
export type { SiteTheme } from '@/lib/themes'
export { SITE_THEMES } from '@/lib/themes'

// ── Icon theme ────────────────────────────────────────────────────────────────
export type IconTheme = string  // directory name under uploads/icons/

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

export interface DbStock {
  id: number
  product_id: number
  household_id: number
  quantity: number
  status: 'in_stock' | 'low' | 'out_of_stock'
  updated_by: number
  updated_at: Date
}

export interface ApiStockItem {
  id: number
  product_id: number
  product_name: string
  category_id: number
  category_name: string
  ref_unit: string
  icon_url: string | null
  quantity: number
  status: 'in_stock' | 'low' | 'out_of_stock'
  recipe_quantity?: number   // total quantity needed by active recipes (shopping list only)
  recipe_ids?: number[]      // IDs of active shopping_recipes that reference this product
  updated_at: string
}

export interface DbRecipe {
  id: number
  name: string
  description: string | null
  steps_markdown: string | null
  photo_url: string | null
  base_servings: number
  created_by: number
  created_at: Date
}

export interface ApiRecipeIngredient {
  id: number
  product_id: number
  product_name: string
  ref_unit: string
  icon_url: string | null
  quantity: number
}

export interface ApiRecipe {
  id: number
  name: string
  description: string | null
  base_servings: number
  ingredient_count: number
  created_at: string
}

export interface ApiRecipeDetail extends Omit<ApiRecipe, 'ingredient_count'> {
  steps_markdown: string | null
  photo_url: string | null
  ingredients: ApiRecipeIngredient[]
}

export interface ApiShoppingRecipe {
  id: number
  recipe_id: number
  recipe_name: string
  base_servings: number
  multiplier: number
  added_at: string
  ingredient_count: number
}

// ── NextAuth type augmentation ────────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      householdId: number | null
      householdRole: string | null
      isAdmin: boolean
      siteTheme: SiteTheme
      iconTheme: string
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
    isAdmin: boolean
    siteTheme: SiteTheme
    iconTheme: string
  }
}
