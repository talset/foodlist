import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import type { DbUser, SiteTheme } from '@/types'

async function getHouseholdMembership(userId: number): Promise<{ householdId: number; householdRole: string } | null> {
  const [rows] = await pool.query<any[]>(
    'SELECT household_id, role FROM household_members WHERE user_id = ? LIMIT 1',
    [userId]
  )
  if (!rows.length) return null
  return { householdId: rows[0].household_id, householdRole: rows[0].role }
}

async function getUserPrefs(userId: number): Promise<{ isAdmin: boolean; siteTheme: SiteTheme; iconTheme: string }> {
  const [rows] = await pool.query<any[]>(
    'SELECT is_admin, site_theme, icon_theme FROM users WHERE id = ?',
    [userId]
  )
  if (!rows.length) return { isAdmin: false, siteTheme: 'dark', iconTheme: 'default' }
  return {
    isAdmin: Boolean(rows[0].is_admin),
    siteTheme: ((rows[0].site_theme && rows[0].site_theme !== 'default') ? rows[0].site_theme : 'dark') as SiteTheme,
    iconTheme: rows[0].icon_theme ?? 'default',
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [rows] = await pool.query<any[]>(
          'SELECT id, email, password_hash, name FROM users WHERE email = ?',
          [credentials.email]
        )
        const user: DbUser | undefined = rows[0]

        if (!user || !user.password_hash) return null

        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null

        return { id: String(user.id), email: user.email, name: user.name }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === 'signIn' || trigger === 'signUp') {
        token.id = Number(user.id)
        const membership = await getHouseholdMembership(token.id)
        token.householdId = membership?.householdId ?? null
        token.householdRole = membership?.householdRole ?? null
        const prefs = await getUserPrefs(token.id)
        token.isAdmin = prefs.isAdmin
        token.siteTheme = prefs.siteTheme
        token.iconTheme = prefs.iconTheme
      }

      if (trigger === 'update') {
        const membership = await getHouseholdMembership(token.id)
        token.householdId = membership?.householdId ?? null
        token.householdRole = membership?.householdRole ?? null
        const prefs = await getUserPrefs(token.id)
        token.isAdmin = prefs.isAdmin
        token.siteTheme = prefs.siteTheme
        token.iconTheme = prefs.iconTheme
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.householdId = token.householdId
      session.user.householdRole = token.householdRole
      session.user.isAdmin = token.isAdmin ?? false
      session.user.siteTheme = token.siteTheme ?? 'dark'
      session.user.iconTheme = token.iconTheme ?? 'default'
      return session
    },
  },

  debug: process.env.NODE_ENV === 'development',
}
