'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // En dev, Next.js peut recharger agressivement ; on enregistre quand même.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Enregistrement silencieux : pas bloquant pour l'app.
      })
    }
    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}
