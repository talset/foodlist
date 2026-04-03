import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import type { DbUser, DbHouseholdMember } from '@/types'

async function getHouseholdMembership(userId: number): Promise<{ householdId: number; householdRole: string } | null> {
  const [rows] = await pool.query<any[]>(
    'SELECT household_id, role FROM household_members WHERE user_id = ? LIMIT 1',
    [userId]
  )
  if (!rows.length) return null
  return { householdId: rows[0].household_id, householdRole: rows[0].role }
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

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const googleId = account.providerAccountId
        const email = user.email!
        const name = user.name ?? email

        // Look up by google_id first, then by email
        let [rows] = await pool.query<any[]>(
          'SELECT id FROM users WHERE google_id = ?',
          [googleId]
        )

        if (!rows.length) {
          const [byEmail] = await pool.query<any[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
          )

          if (byEmail.length) {
            // Existing email account — attach google_id
            await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [
              googleId,
              byEmail[0].id,
            ])
            rows = byEmail
          } else {
            // New user — create account
            const [result] = await pool.query<any>(
              'INSERT INTO users (email, name, google_id) VALUES (?, ?, ?)',
              [email, name, googleId]
            )
            rows = [{ id: result.insertId }]
          }
        }

        // Overwrite user.id with our DB integer (not Google's subject string)
        user.id = String(rows[0].id)
      }
      return true
    },

    async jwt({ token, user, trigger }) {
      if (trigger === 'signIn' || trigger === 'signUp') {
        token.id = Number(user.id)
        const membership = await getHouseholdMembership(token.id)
        token.householdId = membership?.householdId ?? null
        token.householdRole = membership?.householdRole ?? null
      }

      if (trigger === 'update') {
        const membership = await getHouseholdMembership(token.id)
        token.householdId = membership?.householdId ?? null
        token.householdRole = membership?.householdRole ?? null
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.householdId = token.householdId
      session.user.householdRole = token.householdRole
      return session
    },
  },

  debug: process.env.NODE_ENV === 'development',
}
