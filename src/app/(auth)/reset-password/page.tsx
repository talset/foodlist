'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <>
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--fg)' }}>
          Lien invalide
        </h1>
        <p style={{ color: 'var(--fg2)', marginBottom: '1.5rem' }}>
          Ce lien de réinitialisation est invalide ou incomplet.
        </p>
        <Link href="/login" style={{ color: 'var(--primary)' }}>← Retour à la connexion</Link>
      </>
    )
  }

  if (success) {
    return (
      <>
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--fg)' }}>
          Mot de passe modifié ✓
        </h1>
        <p style={{ color: 'var(--fg2)', marginBottom: '1.5rem' }}>
          Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.
        </p>
        <Link href="/login" style={{
          display: 'inline-block', padding: '0.625rem 1.5rem',
          background: 'var(--primary)', color: 'var(--primary-fg)',
          borderRadius: 8, textDecoration: 'none', fontWeight: 600,
        }}>
          Se connecter
        </Link>
      </>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      const messages: Record<string, string> = {
        INVALID_TOKEN: 'Ce lien est invalide ou a expiré.',
        TOKEN_EXPIRED: 'Ce lien a expiré. Demandez un nouveau lien à votre administrateur.',
        PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
      }
      setError(messages[data.error] ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--fg)' }}>
        Nouveau mot de passe
      </h1>
      <p style={{ color: 'var(--fg2)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="password"
          placeholder="Nouveau mot de passe (8 caractères min.)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={inputStyle}
        />

        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnPrimaryStyle}>
          {loading ? 'Enregistrement…' : 'Changer le mot de passe'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--input-bg)',
  color: 'var(--fg)',
  outline: 'none',
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '0.625rem',
  background: 'var(--primary)',
  color: 'var(--primary-fg)',
  border: 'none',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 600,
}
