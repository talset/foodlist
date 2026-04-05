'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

const AUTH_ERRORS: Record<string, string> = {
  InviteRequired: "Ce compte Google n'est pas encore enregistré. Demandez un lien d'invitation à l'administrateur, créez d'abord votre compte avec l'email associé, puis Google se connectera automatiquement.",
  OAuthAccountNotLinked: "Cet email est déjà utilisé avec un autre mode de connexion.",
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--fg)' }}>
        Connexion
      </h1>

      {authError && AUTH_ERRORS[authError] && (
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8,
          padding: '0.75rem 1rem', marginBottom: '1rem',
          color: '#9a3412', fontSize: '0.875rem', lineHeight: 1.5,
        }}>
          {AUTH_ERRORS[authError]}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnPrimaryStyle}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div style={{ margin: '1rem 0', textAlign: 'center', color: 'var(--fg2)', fontSize: '0.875rem' }}>
        ou
      </div>

      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        style={btnSecondaryStyle}
      >
        Continuer avec Google
      </button>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
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

const btnSecondaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem',
  background: 'var(--bg)',
  color: 'var(--fg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
}
