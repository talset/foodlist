'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const NAV_ITEMS = [
  {
    href: '/shopping',
    label: 'Courses',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: '/stock',
    label: 'Stock',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    href: '/recipes',
    label: 'Recettes',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>
    ),
  },
]

const HIDDEN_PATHS = ['/login', '/register', '/setup', '/api']

export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [adminNotif, setAdminNotif] = useState(false)

  useEffect(() => {
    if (!session?.user?.isAdmin) return
    fetch('/api/admin/notifications')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAdminNotif(d.total > 0) })
      .catch(() => {})
  }, [session])

  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return null
  }

  const profileActive = pathname === '/profile' || pathname.startsWith('/profile/') ||
    pathname === '/admin' || pathname.startsWith('/admin/')

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--nav-bg)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0',
              textDecoration: 'none',
              gap: '0.125rem',
            }}
          >
            {item.icon(active)}
            <span style={{
              fontSize: '0.625rem',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--primary)' : 'var(--fg2)',
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}

      {/* Profile tab */}
      <Link
        href="/profile"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 0',
          textDecoration: 'none',
          gap: '0.125rem',
          position: 'relative',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={profileActive ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {adminNotif && (
          <span style={{
            position: 'absolute', top: 4, right: '50%', marginRight: -14,
            width: 8, height: 8, borderRadius: '50%',
            background: '#dc2626',
          }} />
        )}
        <span style={{
          fontSize: '0.625rem',
          fontWeight: profileActive ? 600 : 400,
          color: profileActive ? 'var(--primary)' : 'var(--fg2)',
        }}>
          Profil
        </span>
      </Link>
    </nav>
  )
}
