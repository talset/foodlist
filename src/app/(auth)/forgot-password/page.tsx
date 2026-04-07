'use client'

import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--fg)' }}>
        Mot de passe oublié
      </h1>
      <p style={{ color: 'var(--fg2)', lineHeight: 1.6, marginBottom: '1rem' }}>
        Contactez l&apos;administrateur de votre foyer pour qu&apos;il vous envoie un lien de réinitialisation de mot de passe.
      </p>
      <p style={{ color: 'var(--fg2)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        L&apos;administrateur peut générer ce lien depuis la page <strong>Administration</strong> → onglet <strong>Utilisateurs</strong>.
      </p>
      <Link href="/login" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
        ← Retour à la connexion
      </Link>
    </>
  )
}
