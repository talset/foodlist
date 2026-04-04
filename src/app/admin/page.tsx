'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  users: number
  households: number
  products: number
  recipes: number
}

interface AdminUser {
  id: number
  name: string
  email: string
  isAdmin: boolean
  siteTheme: string
  iconTheme: string
  createdAt: string
  householdId: number | null
  householdName: string | null
  householdRole: string | null
}

interface HouseholdMember {
  userId: number
  userName: string
  userEmail: string
  role: string
  joinedAt: string
}

interface AdminHousehold {
  id: number
  name: string
  createdAt: string
  inviteToken: string
  inviteLink: string
  members: HouseholdMember[]
}

type Tab = 'overview' | 'users' | 'households' | 'catalogue'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [households, setHouseholds] = useState<AdminHousehold[]>([])
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [importingProducts, setImportingProducts] = useState(false)
  const [importingRecipes, setImportingRecipes] = useState(false)
  const importProductsRef = useRef<HTMLInputElement>(null)
  const importRecipesRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.isAdmin) {
      router.replace('/')
    }
  }, [session, status, router])

  const loadStats = useCallback(async () => {
    const r = await fetch('/api/admin/stats')
    if (r.ok) setStats(await r.json())
  }, [])

  const loadUsers = useCallback(async () => {
    const r = await fetch('/api/admin/users')
    if (r.ok) setUsers(await r.json())
  }, [])

  const loadHouseholds = useCallback(async () => {
    const r = await fetch('/api/admin/households')
    if (r.ok) setHouseholds(await r.json())
  }, [])

  useEffect(() => {
    if (!session?.user?.isAdmin) return
    loadStats()
    loadUsers()
    loadHouseholds()
  }, [session, loadStats, loadUsers, loadHouseholds])

  async function toggleAdmin(userId: number, current: boolean) {
    setActionMsg('')
    const r = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !current }),
    })
    if (!r.ok) {
      const err = await r.json()
      setActionMsg(`Erreur : ${err.error}`)
    } else {
      await loadUsers()
    }
  }

  async function deleteUser(userId: number, userName: string) {
    if (!confirm(`Supprimer l'utilisateur "${userName}" ?`)) return
    setActionMsg('')
    const r = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (!r.ok) {
      const err = await r.json()
      setActionMsg(`Erreur : ${err.error ?? err.message}`)
    } else {
      await loadUsers()
    }
  }

  async function deleteHousehold(hId: number, hName: string) {
    if (!confirm(`Supprimer le foyer "${hName}" et toutes ses données ?`)) return
    setActionMsg('')
    const r = await fetch(`/api/admin/households/${hId}`, { method: 'DELETE' })
    if (r.ok) {
      await loadHouseholds()
    } else {
      const err = await r.json()
      setActionMsg(`Erreur : ${err.error}`)
    }
  }

  async function regenerateToken(hId: number) {
    setActionMsg('')
    const r = await fetch(`/api/admin/households/${hId}`, { method: 'PATCH' })
    if (r.ok) {
      await loadHouseholds()
      setActionMsg('Lien d\'invitation régénéré')
    }
  }

  async function removeMember(hId: number, userId: number) {
    setActionMsg('')
    const r = await fetch(`/api/admin/households/${hId}/members/${userId}`, { method: 'DELETE' })
    if (r.ok) {
      await loadHouseholds()
    } else {
      const err = await r.json()
      setActionMsg(`Erreur : ${err.error}`)
    }
  }

  async function seedCatalogue() {
    if (!confirm('Importer le catalogue de base (177 produits) ? Les produits existants seront ignorés.')) return
    setSeeding(true)
    setActionMsg('')
    const r = await fetch('/api/admin/seed', { method: 'POST' })
    const data = await r.json()
    if (r.ok) {
      await loadStats()
      setActionMsg(`Catalogue importé : ${data.created} ajoutés, ${data.skipped} ignorés`)
    } else {
      setActionMsg(`Erreur : ${data.error}`)
    }
    setSeeding(false)
  }

  async function importProducts(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportingProducts(true)
    setActionMsg('')
    try {
      const json = JSON.parse(await file.text())
      const r = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const data = await r.json()
      if (r.ok) {
        await loadStats()
        setActionMsg(`Produits importés : ${data.created} ajoutés, ${data.skipped} ignorés${data.errors?.length ? `, ${data.errors.length} erreur(s)` : ''}`)
      } else {
        setActionMsg(`Erreur : ${data.error}`)
      }
    } catch {
      setActionMsg('Erreur : fichier JSON invalide')
    }
    setImportingProducts(false)
  }

  async function importRecipes(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportingRecipes(true)
    setActionMsg('')
    try {
      const json = JSON.parse(await file.text())
      const r = await fetch('/api/import/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const data = await r.json()
      if (r.ok) {
        await loadStats()
        setActionMsg(`Recettes importées : ${data.created} ajoutées, ${data.skipped} ignorées${data.errors?.length ? `, ${data.errors.length} erreur(s)` : ''}`)
      } else {
        setActionMsg(`Erreur : ${data.error}`)
      }
    } catch {
      setActionMsg('Erreur : fichier JSON invalide')
    }
    setImportingRecipes(false)
  }

  async function createHousehold() {
    if (!newHouseholdName.trim()) return
    setActionMsg('')
    const r = await fetch('/api/admin/households', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newHouseholdName.trim() }),
    })
    if (r.ok) {
      setNewHouseholdName('')
      await loadHouseholds()
      setActionMsg('Foyer créé')
    } else {
      const err = await r.json()
      setActionMsg(`Erreur : ${err.error}`)
    }
  }

  if (status === 'loading' || !session?.user?.isAdmin) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg2)' }}>Chargement…</div>
  }

  const statCards = [
    { label: 'Utilisateurs', value: stats?.users ?? '—' },
    { label: 'Foyers', value: stats?.households ?? '—' },
    { label: 'Produits', value: stats?.products ?? '—' },
    { label: 'Recettes', value: stats?.recipes ?? '—' },
  ]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'households', label: 'Foyers' },
    { id: 'catalogue', label: 'Import / Export' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '1.5rem' }}>
        Administration
      </h1>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none',
              color: tab === t.id ? 'var(--primary)' : 'var(--fg2)',
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionMsg && (
        <div style={{
          padding: '0.625rem 0.75rem',
          borderRadius: 8,
          background: actionMsg.startsWith('Erreur') ? '#fef2f2' : '#f0fdf4',
          color: actionMsg.startsWith('Erreur') ? '#b91c1c' : '#166534',
          fontSize: '0.875rem',
          marginBottom: '1rem',
        }}>
          {actionMsg}
        </div>
      )}

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {statCards.map(card => (
            <div key={card.label} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '1.25rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{card.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--fg2)', marginTop: '0.25rem' }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map(u => (
            <div key={u.id} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '0.875rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {u.name}
                    {u.isAdmin && (
                      <span style={{ fontSize: '0.6875rem', background: '#fee2e2', color: '#b91c1c', padding: '0.125rem 0.375rem', borderRadius: 4, fontWeight: 600 }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--fg2)', marginTop: '0.125rem' }}>{u.email}</div>
                  {u.householdName && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginTop: '0.25rem' }}>
                      Foyer : {u.householdName} ({u.householdRole})
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleAdmin(u.id, u.isAdmin)}
                    style={{
                      padding: '0.375rem 0.625rem',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      background: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {u.isAdmin ? 'Retirer admin' : 'Promouvoir'}
                  </button>
                  <button
                    onClick={() => deleteUser(u.id, u.name)}
                    style={{
                      padding: '0.375rem 0.625rem',
                      border: '1px solid #fca5a5',
                      borderRadius: 6,
                      background: 'var(--bg)',
                      color: '#dc2626',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import / Export */}
      {tab === 'catalogue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Produits */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Produits
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginBottom: '0.75rem' }}>
              {stats?.products != null && `${stats.products} produit${stats.products !== 1 ? 's' : ''} dans la base.`}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Seed */}
              <button
                onClick={seedCatalogue}
                disabled={seeding}
                style={btnSecondary(seeding)}
                title="Importe ~230 produits alimentaires courants. Les doublons sont ignorés."
              >
                {seeding ? 'Import en cours…' : '↓ Catalogue de base'}
              </button>
              {/* Import JSON */}
              <button onClick={() => importProductsRef.current?.click()} disabled={importingProducts} style={btnSecondary(importingProducts)} title="Importe un fichier JSON de produits. Les doublons sont ignorés.">
                {importingProducts ? 'Import en cours…' : '↑ Import produits'}
              </button>
              <input ref={importProductsRef} type="file" accept=".json,application/json" onChange={importProducts} style={{ display: 'none' }} />
              {/* Export JSON */}
              <a
                href="/api/export/products"
                download="products.json"
                style={btnSecondary(false) as React.CSSProperties}
              >
                ↓ Export produits
              </a>
            </div>
          </div>

          {/* Recettes */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Recettes
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginBottom: '0.75rem' }}>
              {stats?.recipes != null && `${stats.recipes} recette${stats.recipes !== 1 ? 's' : ''} dans la base.`}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Import JSON */}
              <button onClick={() => importRecipesRef.current?.click()} disabled={importingRecipes} style={btnSecondary(importingRecipes)} title="Importe un fichier JSON de recettes. Les doublons sont ignorés. Les produits référencés doivent exister.">
                {importingRecipes ? 'Import en cours…' : '↑ Import recettes'}
              </button>
              <input ref={importRecipesRef} type="file" accept=".json,application/json" onChange={importRecipes} style={{ display: 'none' }} />
              {/* Export JSON */}
              <a
                href="/api/export/recipes"
                download="recipes.json"
                style={btnSecondary(false) as React.CSSProperties}
              >
                ↓ Export recettes
              </a>
            </div>
          </div>

        </div>
      )}

      {/* Households */}
      {tab === 'households' && (
        <div>
          {/* Create form */}
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '0.875rem',
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem',
          }}>
            <input
              value={newHouseholdName}
              onChange={e => setNewHouseholdName(e.target.value)}
              placeholder="Nom du nouveau foyer"
              onKeyDown={e => e.key === 'Enter' && createHousehold()}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: '0.875rem',
                background: 'var(--input-bg)',
                color: 'var(--fg)',
              }}
            />
            <button
              onClick={createHousehold}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: 'var(--primary-fg)',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Créer
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {households.map(h => (
              <div key={h.id} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '0.875rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--fg)' }}>{h.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginTop: '0.125rem' }}>
                      {h.members.length} membre{h.members.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => { navigator.clipboard.writeText(h.inviteLink); setActionMsg('Lien copié') }}
                      style={{
                        padding: '0.375rem 0.625rem',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        background: 'var(--bg)',
                        color: 'var(--fg)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Copier lien
                    </button>
                    <button
                      onClick={() => regenerateToken(h.id)}
                      style={{
                        padding: '0.375rem 0.625rem',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        background: 'var(--bg)',
                        color: 'var(--fg)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Régénérer
                    </button>
                    <button
                      onClick={() => deleteHousehold(h.id, h.name)}
                      style={{
                        padding: '0.375rem 0.625rem',
                        border: '1px solid #fca5a5',
                        borderRadius: 6,
                        background: '#fff',
                        color: '#dc2626',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {h.members.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {h.members.map(m => (
                      <div key={m.userId} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.375rem 0.5rem',
                        background: 'var(--bg)',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                      }}>
                        <span style={{ color: 'var(--fg)' }}>
                          {m.userName}
                          <span style={{ color: 'var(--fg2)', marginLeft: '0.375rem' }}>({m.role})</span>
                        </span>
                        <button
                          onClick={() => removeMember(h.id, m.userId)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #fca5a5',
                            borderRadius: 4,
                            background: 'none',
                            color: '#dc2626',
                            fontSize: '0.6875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function btnSecondary(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    background: disabled ? 'var(--bg2)' : 'var(--primary)',
    color: disabled ? 'var(--fg2)' : 'var(--primary-fg)',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
  }
}
