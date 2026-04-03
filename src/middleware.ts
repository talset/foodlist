import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Authenticated but no household yet → gate to /setup
    if (token && token.householdId == null) {
      const allowed = ['/setup', '/api/households', '/api/auth']
      const isAllowed = allowed.some(p => pathname.startsWith(p))
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/setup', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  // Exclude public routes and Next.js internals from middleware
  matcher: [
    '/((?!login|register|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
