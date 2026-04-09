'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { THEMES } from '@/lib/themes'
import type { SiteTheme } from '@/lib/themes'
import type { ReactNode } from 'react'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { parseVoiceCommand, findStockItem } from '@/lib/voiceCommand'
import type { ApiStockItem } from '@/types'

type NavKey = 'shopping' | 'stock' | 'recipes'
type VoiceFeedback = { type: 'success' | 'notfound' | 'error'; text: string } | null

const NAV_ITEMS: { href: string; label: string; key: NavKey; icon: (active: boolean) => ReactNode }[] = [
  {
    href: '/shopping', label: 'Courses', key: 'shopping',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: '/stock', label: 'Stock', key: 'stock',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    href: '/recipes', label: 'Recettes', key: 'recipes',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>
    ),
  },
]

const HIDDEN_PATHS = ['/login', '/register', '/setup', '/forgot-password', '/reset-password', '/api']

export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [adminNotif, setAdminNotif] = useState(false)
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedback>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetVoiceRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!session?.user?.isAdmin) return
    fetch('/api/admin/notifications')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAdminNotif(d.total > 0) })
      .catch(() => {})
  }, [session])

  const showFeedback = useCallback((fb: VoiceFeedback) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    setVoiceFeedback(fb)
    feedbackTimerRef.current = setTimeout(
      () => setVoiceFeedback(null),
      fb?.type === 'success' ? 3000 : 4000,
    )
  }, [])

  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    const names = parseVoiceCommand(transcript)
    if (names.length === 0) {
      showFeedback({ type: 'error', text: `Non compris : "${transcript}"` })
      resetVoiceRef.current()
      return
    }

    const res = await fetch('/api/stock')
    if (!res.ok) {
      showFeedback({ type: 'error', text: 'Erreur de connexion au stock' })
      resetVoiceRef.current()
      return
    }
    const { items: allStock } = await res.json() as { items: ApiStockItem[] }

    const added: string[] = []
    const notFound: string[] = []

    for (const name of names) {
      const item = findStockItem(name, allStock)
      if (!item) { notFound.push(name); continue }
      if (item.status === 'out_of_stock') { added.push(item.product_name); continue }
      const patch = await fetch(`/api/stock/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'out_of_stock' }),
      })
      if (patch.ok) added.push(item.product_name)
      else notFound.push(name)
    }

    const parts: string[] = []
    if (added.length > 0) parts.push(`✓ ${added.join(', ')}`)
    if (notFound.length > 0) parts.push(`introuvable : ${notFound.join(', ')}`)
    showFeedback({
      type: notFound.length === 0 ? 'success' : added.length === 0 ? 'notfound' : 'notfound',
      text: parts.join(' — '),
    })
    resetVoiceRef.current()
  }, [showFeedback])

  const handleVoiceError = useCallback((error: string) => {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const notAllowedMsg = isHttps
      ? 'Micro refusé — appuyez sur 🔒 dans la barre d\'adresse > Microphone > Autoriser'
      : 'Micro refusé — HTTPS requis pour utiliser le microphone'
    const messages: Record<string, string> = {
      'not-supported':       'Reconnaissance vocale non supportée (utilisez Chrome)',
      'not-allowed':         notAllowedMsg,
      'service-not-allowed': notAllowedMsg,
      'network':             'Erreur réseau — vérifiez votre connexion',
      'no-speech':           '',  // silent — user just didn't speak
      'aborted':             '',  // silent — user cancelled manually
    }
    const msg = messages[error] ?? `Erreur microphone : ${error}`
    if (msg) showFeedback({ type: 'error', text: msg })
  }, [showFeedback])

  const { state: voiceState, start: startListening, stop: stopListening, resetState } = useVoiceInput(handleVoiceTranscript, handleVoiceError)
  resetVoiceRef.current = resetState

  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return null
  }

  const theme = (session?.user?.siteTheme ?? 'dark') as SiteTheme
  const themeNav = THEMES[theme]?.navIcons

  const profileActive = pathname === '/profile' || pathname.startsWith('/profile/') ||
    pathname === '/admin' || pathname.startsWith('/admin/')

  const micEmoji = themeNav?.mic

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
      {/* Courses + Stock */}
      {NAV_ITEMS.slice(0, 2).map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        const emoji = themeNav?.[item.key]
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
            {emoji ? (
              <span style={{ fontSize: '1.25rem', lineHeight: 1, filter: active ? 'none' : 'grayscale(0.5) opacity(0.6)' }}>
                {emoji}
              </span>
            ) : (
              item.icon(active)
            )}
            <span style={{ fontSize: '0.625rem', fontWeight: active ? 600 : 400, color: active ? 'var(--primary)' : 'var(--fg2)' }}>
              {item.label}
            </span>
          </Link>
        )
      })}

      {/* Mic button — center FAB */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0.25rem 0',
        position: 'relative',
      }}>
        {/* Feedback toast */}
        {voiceFeedback && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 4px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            padding: '0.375rem 0.75rem',
            borderRadius: 8,
            fontSize: '0.8125rem',
            fontWeight: 500,
            zIndex: 200,
            pointerEvents: 'none',
            background: voiceFeedback.type === 'success' ? '#166534' : voiceFeedback.type === 'notfound' ? '#92400e' : '#991b1b',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {voiceFeedback.text}
          </div>
        )}

        <button
          onClick={voiceState === 'listening' ? stopListening : voiceState === 'idle' ? startListening : undefined}
          className={voiceState === 'listening' ? 'voice-listening' : ''}
          title={voiceState === 'idle' ? 'Ajouter à la liste par la voix' : undefined}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: 'none',
            background: voiceState !== 'idle' ? 'var(--primary-hover, var(--primary))' : 'var(--primary)',
            color: 'var(--primary-fg)',
            cursor: voiceState === 'idle' ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2,
            transform: 'translateY(-10px)',
            boxShadow: '0 3px 10px var(--shadow, rgba(0,0,0,0.25))',
            fontSize: micEmoji ? '1.4rem' : undefined,
            flexShrink: 0,
          }}
        >
          {voiceState === 'listening' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : micEmoji ? (
            micEmoji
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        <span style={{
          fontSize: '0.625rem',
          fontWeight: 400,
          color: voiceState !== 'idle' ? 'var(--primary)' : 'var(--fg2)',
          marginTop: -6,
        }}>
          {voiceState === 'listening' ? 'Écoute…' : voiceState === 'processing' ? '…' : 'Voix'}
        </span>
      </div>

      {/* Recettes + Profil */}
      {NAV_ITEMS.slice(2).map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        const emoji = themeNav?.[item.key]
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
            {emoji ? (
              <span style={{ fontSize: '1.25rem', lineHeight: 1, filter: active ? 'none' : 'grayscale(0.5) opacity(0.6)' }}>
                {emoji}
              </span>
            ) : (
              item.icon(active)
            )}
            <span style={{ fontSize: '0.625rem', fontWeight: active ? 600 : 400, color: active ? 'var(--primary)' : 'var(--fg2)' }}>
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
        {themeNav?.profile ? (
          <span style={{ fontSize: '1.25rem', lineHeight: 1, filter: profileActive ? 'none' : 'grayscale(0.5) opacity(0.6)' }}>
            {themeNav.profile}
          </span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={profileActive ? 'var(--primary)' : 'var(--fg2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        )}
        {adminNotif && (
          <span style={{
            position: 'absolute', top: 4, right: '50%', marginRight: -14,
            width: 8, height: 8, borderRadius: '50%',
            background: '#dc2626',
          }} />
        )}
        <span style={{ fontSize: '0.625rem', fontWeight: profileActive ? 600 : 400, color: profileActive ? 'var(--primary)' : 'var(--fg2)' }}>
          Profil
        </span>
      </Link>
    </nav>
  )
}
