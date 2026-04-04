'use client'

import { Suspense, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function SetupForm() {
  const { update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token') ?? ''

  const [mode, setMode] = useState<'create' | 'join'>(inviteToken ? 'join' : 'create')
  const [householdName, setHouseholdName] = useState('')
  const [token, setToken] = useState(inviteToken)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/households', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: householdName }),
    })

    if (!res.ok) {
      const data = await res.json()
      if (data.error === 'ALREADY_IN_HOUSEHOLD') {
        // JWT is stale — refresh and redirect
        await refreshAndRedirect()
        return
      }
      setError('Une erreur est survenue.')
      setLoading(false)
      return
    }

    await refreshAndRedirect()
  }

  async function refreshAndRedirect() {
    try {
      await Promise.race([
        update(),
        new Promise<void>(resolve => setTimeout(resolve, 4000)),
      ])
    } catch {}
    router.replace('/')
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/households/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error === 'INVALID_TOKEN' ? "Lien d'invitation invalide." : 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    await refreshAndRedirect()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--bg2)',
        borderRadius: 12,
        padding: '2rem',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 16px var(--shadow)',
      }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--fg)' }}>
          Bienvenue sur Foodlist
        </h1>
        <p style={{ marginBottom: '1.5rem', color: 'var(--fg2)', fontSize: '0.95rem' }}>
          Créez un foyer ou rejoignez-en un existant.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('create')}
            style={{ ...tabStyle, ...(mode === 'create' ? tabActiveStyle : {}) }}
          >
            Créer un foyer
          </button>
          <button
            onClick={() => setMode('join')}
            style={{ ...tabStyle, ...(mode === 'join' ? tabActiveStyle : {}) }}
          >
            Rejoindre
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Nom du foyer (ex : Famille Dupont)"
              value={householdName}
              onChange={e => setHouseholdName(e.target.value)}
              required
              style={inputStyle}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Création…' : 'Créer le foyer'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Token d'invitation"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              style={inputStyle}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Rejoindre…' : 'Rejoindre le foyer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupForm />
    </Suspense>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: '0.9375rem',
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--input-bg)',
  color: 'var(--fg)',
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  padding: '0.625rem',
  background: 'var(--primary)',
  color: 'var(--primary-fg)',
  border: 'none',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 600,
}

const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.5rem',
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--bg)',
  color: 'var(--fg)',
  cursor: 'pointer',
  fontSize: '0.9rem',
}

const tabActiveStyle: React.CSSProperties = {
  background: 'var(--primary)',
  color: 'var(--primary-fg)',
  border: '1px solid var(--primary)',
}
