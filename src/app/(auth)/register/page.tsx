'use client'

import { Suspense, useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: 'Cette adresse email est déjà utilisée.',
  INVALID_EMAIL: 'Adresse email invalide.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  INVALID_INPUT: 'Tous les champs sont obligatoires.',
  INVITE_REQUIRED: "Un lien d'invitation est requis pour créer un compte.",
  INVALID_TOKEN: "Ce lien d'invitation est invalide ou a expiré.",
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/setup-status')
      .then(r => r.json())
      .then(d => setIsFirstUser(d.isFirstUser))
  }, [])

  const canRegister = isFirstUser === true || !!token

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, invite_token: token || undefined }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(ERROR_MESSAGES[data.error] ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Inscription réussie, mais connexion échouée. Connectez-vous manuellement.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  // Loading state while we check
  if (isFirstUser === null) {
    return <p style={{ textAlign: 'center', color: '#666' }}>Chargement…</p>
  }

  // Invite-only: no token, not first user
  if (!canRegister) {
    return (
      <>
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
          Accès sur invitation
        </h1>
        <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          L&apos;inscription est fermée. Pour rejoindre Foodlist, demandez un lien
          d&apos;invitation à l&apos;administrateur du foyer.
        </p>
        <Link href="/login" style={{ color: '#3182ce', fontSize: '0.9rem' }}>
          ← Retour à la connexion
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 style={{ marginBottom: '0.25rem', fontSize: '1.5rem', fontWeight: 700 }}>
        {isFirstUser ? 'Créer le compte admin' : 'Rejoindre Foodlist'}
      </h1>
      {isFirstUser && (
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Premier lancement — ce compte sera l&apos;administrateur.
        </p>
      )}
      {!isFirstUser && (
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Vous avez été invité à rejoindre un foyer.
        </p>
      )}

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

      {isFirstUser && (
        <>
          <div style={{ margin: '1rem 0', textAlign: 'center', color: '#999', fontSize: '0.875rem' }}>
            ou
          </div>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            style={btnSecondaryStyle}
          >
            Continuer avec Google
          </button>
        </>
      )}

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
        Déjà un compte ?{' '}
        <Link href="/login" style={{ color: '#3182ce' }}>Se connecter</Link>
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
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
