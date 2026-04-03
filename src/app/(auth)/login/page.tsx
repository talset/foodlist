'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
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
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
        Connexion
      </h1>

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

        {error && <p style={{ color: '#e53e3e', fontSize: '0.875rem' }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnPrimaryStyle}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div style={{ margin: '1rem 0', textAlign: 'center', color: '#999', fontSize: '0.875rem' }}>
        ou
      </div>

      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        style={btnSecondaryStyle}
      >
        Continuer avec Google
      </button>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
        Pas encore de compte ?{' '}
        <Link href="/register" style={{ color: '#3182ce' }}>S&apos;inscrire</Link>
      </p>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box',
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '0.625rem',
  background: '#3182ce',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 600,
}

const btnSecondaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem',
  background: '#fff',
  color: '#333',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
}
