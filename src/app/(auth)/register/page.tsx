'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: 'Cette adresse email est déjà utilisée.',
  INVALID_EMAIL: 'Adresse email invalide.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  INVALID_INPUT: 'Tous les champs sont obligatoires.',
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(ERROR_MESSAGES[data.error] ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    // Auto sign-in after registration
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Inscription réussie, mais connexion échouée. Connectez-vous manuellement.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
        Créer un compte
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Prénom ou nom"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={inputStyle}
        />
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
          placeholder="Mot de passe (8 caractères min.)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && <p style={{ color: '#e53e3e', fontSize: '0.875rem' }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnPrimaryStyle}>
          {loading ? 'Création…' : 'Créer le compte'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
        Déjà un compte ?{' '}
        <Link href="/login" style={{ color: '#3182ce' }}>Se connecter</Link>
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
