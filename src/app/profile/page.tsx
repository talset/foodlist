'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { SITE_THEMES } from '@/types'
import type { SiteTheme } from '@/types'

interface ProfileData {
  id: number
  name: string
  email: string
  isAdmin: boolean
  siteTheme: SiteTheme
  iconTheme: string
  availableIconThemes: string[]
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState('')
  const [siteTheme, setSiteTheme] = useState<SiteTheme>('dark')
  const [iconTheme, setIconTheme] = useState('default')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [themeIcons, setThemeIcons] = useState<Record<string, string[]>>({})
  const themeIconsRef = useRef(themeIcons)
  themeIconsRef.current = themeIcons

  const loadThemePreview = useCallback((theme: string) => {
    if (themeIconsRef.current[theme]) return
    fetch(`/api/icons?theme=${theme}`)
      .then(r => r.json())
      .then(data => {
        const icons: string[] = (data.icons ?? [])
          .map((i: any) => typeof i === 'string' ? i : i.name)
          .filter(Boolean)
          .slice(0, 8)
        setThemeIcons(prev => ({ ...prev, [theme]: icons }))
      })
  }, [])

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: ProfileData) => {
        setProfile(data)
        setName(data.name)
        setSiteTheme(data.siteTheme)
        setIconTheme(data.iconTheme)
        loadThemePreview(data.iconTheme)
      })
  }, [loadThemePreview])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, siteTheme, iconTheme }),
      })
      if (!res.ok) {
        const err = await res.json()
        setMessage(`Erreur : ${err.error}`)
        return
      }
      await update()
      setMessage('Profil mis à jour')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg2)' }}>
        Chargement…
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '1.5rem' }}>
        Mon profil
      </h1>

      {/* User info */}
      <section style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1rem',
        marginBottom: '1.25rem',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Informations
        </h2>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--fg2)', marginBottom: '0.25rem' }}>Nom</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: '0.875rem',
              background: 'var(--input-bg)',
              color: 'var(--fg)',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--fg2)', marginBottom: '0.25rem' }}>Email</label>
          <div style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: '0.875rem',
            color: 'var(--fg2)',
            background: 'var(--bg2)',
          }}>
            {profile.email}
          </div>
        </div>
      </section>

      {/* Site theme picker */}
      <section style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1rem',
        marginBottom: '1.25rem',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Thème visuel
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {(Object.keys(SITE_THEMES) as SiteTheme[]).map(t => {
            const info = SITE_THEMES[t]
            const selected = siteTheme === t
            return (
              <button
                key={t}
                onClick={() => setSiteTheme(t)}
                style={{
                  padding: '0.75rem',
                  border: selected ? `2px solid ${info.primary}` : '1px solid var(--border)',
                  borderRadius: 10,
                  background: selected ? `${info.bg}` : 'var(--bg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: info.bg, border: '1px solid #ccc', display: 'inline-block' }} />
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: info.primary, display: 'inline-block' }} />
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: info.fg, display: 'inline-block' }} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg)' }}>{info.label}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--fg2)' }}>{info.description}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Icon theme picker */}
      {profile.availableIconThemes.length > 1 && (
        <section style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '1rem',
          marginBottom: '1.25rem',
        }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pack d&apos;icônes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {profile.availableIconThemes.map(t => {
              const selected = iconTheme === t
              const preview = themeIcons[t] ?? []
              return (
                <div key={t}>
                  <button
                    onClick={() => { setIconTheme(t); loadThemePreview(t) }}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: selected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 8,
                      background: selected ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--bg)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      color: 'var(--fg)',
                      fontWeight: selected ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                    {selected && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>✓ Actif</span>}
                  </button>
                  {selected && (
                    <div style={{
                      display: 'flex', gap: '0.375rem', flexWrap: 'wrap',
                      padding: '0.5rem 0.625rem',
                      background: 'var(--bg2)', borderRadius: '0 0 8px 8px',
                      border: '1px solid var(--border)', borderTop: 'none',
                    }}>
                      {preview.length === 0 && (
                        <button
                          type="button"
                          onClick={() => loadThemePreview(t)}
                          style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          Charger aperçu
                        </button>
                      )}
                      {preview.map(filename => (
                        <img key={filename} src={`/api/icons/${filename}?theme=${t}`} width={32} height={32} alt={filename} title={filename.replace(/\.[^.]+$/, '')} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Save */}
      {message && (
        <div style={{
          padding: '0.625rem 0.75rem',
          borderRadius: 8,
          background: message.startsWith('Erreur') ? '#fef2f2' : '#f0fdf4',
          color: message.startsWith('Erreur') ? '#b91c1c' : '#166534',
          fontSize: '0.875rem',
          marginBottom: '0.75rem',
        }}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'var(--primary)',
          color: 'var(--primary-fg)',
          border: 'none',
          borderRadius: 10,
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
          marginBottom: '1rem',
        }}
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>

      {/* Admin link */}
      {session?.user?.isAdmin && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--fg)',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Administration
          </Link>
        </div>
      )}
    </div>
  )
}
