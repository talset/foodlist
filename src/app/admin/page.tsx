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

type Tab = 'overview' | 'users' | 'households' | 'catalogue' | 'icons' | 'recipe-photos'

interface IconsData {
  themes: string[]
  products_without_icon: { id: number; name: string; category_name: string }[]
  products_missing_in_theme: { id: number; name: string; category_name: string; icon_ref: string; missing_themes: string[] }[]
  orphan_custom: string[]
  orphan_theme: { filename: string; theme: string }[]
}

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
  const [seedingRecipes, setSeedingRecipes] = useState(false)
  const [importingProducts, setImportingProducts] = useState(false)
  const [importingRecipes, setImportingRecipes] = useState(false)
  const importProductsRef = useRef<HTMLInputElement>(null)
  const importRecipesRef = useRef<HTMLInputElement>(null)
  const [iconsData, setIconsData] = useState<IconsData | null>(null)
  const [recipePhotosData, setRecipePhotosData] = useState<any>(null)
  const [uploadingIconFor, setUploadingIconFor] = useState<number | null>(null)
  const [deletingIcons, setDeletingIcons] = useState<Set<string>>(new Set())
  const [orphanThemeFilter, setOrphanThemeFilter] = useState<string | null>(null)
  const [missingThemeFilter, setMissingThemeFilter] = useState<string | null>(null)
  const uploadIconRef = useRef<HTMLInputElement>(null)
  const uploadTargetIdRef = useRef<number | null>(null)

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

  const loadIcons = useCallback(async () => {
    const r = await fetch('/api/admin/icons')
    if (r.ok) setIconsData(await r.json())
  }, [])

  const loadRecipePhotos = useCallback(async () => {
    const r = await fetch('/api/admin/recipe-photos')
    if (r.ok) setRecipePhotosData(await r.json())
  }, [])

  useEffect(() => {
    if (!session?.user?.isAdmin) return
    loadStats()
    loadUsers()
    loadHouseholds()
  }, [session, loadStats, loadUsers, loadHouseholds])

  useEffect(() => {
    if (tab === 'icons' && session?.user?.isAdmin) loadIcons()
    if (tab === 'recipe-photos' && session?.user?.isAdmin) loadRecipePhotos()
  }, [tab, session, loadIcons, loadRecipePhotos])

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
    if (!confirm('Importer le catalogue de base ? Les produits existants seront ignorés.')) return
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

  async function seedRecipes() {
    if (!confirm('Importer les recettes de base ? Les recettes existantes seront ignorées.')) return
    setSeedingRecipes(true)
    setActionMsg('')
    const r = await fetch('/api/admin/seed-recipes', { method: 'POST' })
    const data = await r.json()
    if (r.ok) {
      await loadStats()
      setActionMsg(`Recettes importées : ${data.created} ajoutées, ${data.skipped} ignorées${data.errors?.length ? `, ${data.errors.length} erreur(s)` : ''}`)
    } else {
      setActionMsg(`Erreur : ${data.error}`)
    }
    setSeedingRecipes(false)
  }

  async function deleteAllProducts() {
    if (!confirm('Supprimer TOUS les produits, recettes, stocks et listes de courses ? Cette action est irréversible.')) return
    setActionMsg('')
    const r = await fetch('/api/admin/products', { method: 'DELETE' })
    if (r.ok) {
      await loadStats()
      setActionMsg('Tous les produits et données associées ont été supprimés')
    } else {
      setActionMsg('Erreur lors de la suppression')
    }
  }

  async function deleteAllRecipes() {
    if (!confirm('Supprimer TOUTES les recettes et listes de courses associées ? Cette action est irréversible.')) return
    setActionMsg('')
    const r = await fetch('/api/admin/recipes', { method: 'DELETE' })
    if (r.ok) {
      await loadStats()
      setActionMsg('Toutes les recettes ont été supprimées')
    } else {
      setActionMsg('Erreur lors de la suppression')
    }
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

  async function uploadIconForProduct(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    const productId = uploadTargetIdRef.current
    if (!file || productId === null) return
    setUploadingIconFor(productId)
    setActionMsg('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', String(productId))
      const r = await fetch('/api/icons/upload', { method: 'POST', body: formData })
      if (r.ok) {
        await loadIcons()
        setActionMsg('Icône mise à jour')
      } else {
        const d = await r.json()
        setActionMsg(`Erreur : ${d.error}`)
      }
    } catch {
      setActionMsg('Erreur lors de l\'upload')
    }
    setUploadingIconFor(null)
    uploadTargetIdRef.current = null
  }

  async function deleteOrphanCustom(filenames: string[]) {
    const key = filenames.join(',')
    setDeletingIcons(prev => new Set(prev).add(key))
    setActionMsg('')
    const r = await fetch('/api/admin/icons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames }),
    })
    if (r.ok) {
      const d = await r.json()
      await loadIcons()
      const msg = `${d.deleted} icône${d.deleted !== 1 ? 's' : ''} supprimée${d.deleted !== 1 ? 's' : ''}`
      setActionMsg(msg)
    } else {
      setActionMsg('Erreur lors de la suppression')
    }
    setDeletingIcons(prev => { const s = new Set(prev); s.delete(key); return s })
  }

  async function deleteThemeIcon(filename: string, theme: string) {
    const key = `${theme}/${filename}`
    setDeletingIcons(prev => new Set(prev).add(key))
    setActionMsg('')
    const r = await fetch('/api/admin/icons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames: [filename], theme }),
    })
    if (r.ok) {
      const d = await r.json()
      await loadIcons()
      const msg = `${d.deleted} ic\u00f4ne${d.deleted !== 1 ? 's' : ''} supprim\u00e9e${d.deleted !== 1 ? 's' : ''}`
      setActionMsg(msg)
    } else {
      setActionMsg('Erreur lors de la suppression')
    }
    setDeletingIcons(prev => { const s = new Set(prev); s.delete(key); return s })
  }

  async function deleteOrphanRecipePhotos(filenames: string[]) {
    setActionMsg('')
    const r = await fetch('/api/admin/recipe-photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames }),
    })
    if (r.ok) {
      const d = await r.json()
      await loadRecipePhotos()
      setActionMsg(`${d.deleted} photo${d.deleted !== 1 ? 's' : ''} supprimée${d.deleted !== 1 ? 's' : ''}`)
    } else {
      setActionMsg('Erreur lors de la suppression')
    }
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
    { id: 'icons', label: 'Icônes' },
    { id: 'recipe-photos', label: 'Photos' },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Produits
              </div>
              <button
                onClick={deleteAllProducts}
                style={{ padding: '0.25rem 0.625rem', border: '1px solid #fca5a5', borderRadius: 6, background: 'var(--bg)', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Tout supprimer
              </button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recettes
              </div>
              <button
                onClick={deleteAllRecipes}
                style={{ padding: '0.25rem 0.625rem', border: '1px solid #fca5a5', borderRadius: 6, background: 'var(--bg)', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Tout supprimer
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginBottom: '0.75rem' }}>
              {stats?.recipes != null && `${stats.recipes} recette${stats.recipes !== 1 ? 's' : ''} dans la base.`}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Seed */}
              <button
                onClick={seedRecipes}
                disabled={seedingRecipes}
                style={btnSecondary(seedingRecipes)}
                title="Importe les recettes de base. Les doublons sont ignorés."
              >
                {seedingRecipes ? 'Import en cours…' : '↓ Catalogue de base'}
              </button>
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

      {/* Icons */}
      {tab === 'icons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input
            ref={uploadIconRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            onChange={uploadIconForProduct}
            style={{ display: 'none' }}
          />

          {/* Products without icon */}
          {(() => {
            const allProducts = [
              ...(iconsData?.products_without_icon.map(p => ({ ...p, icon_ref: null as string | null, missing_themes: iconsData.themes })) ?? []),
              ...(iconsData?.products_missing_in_theme.map(p => ({ ...p, icon_ref: p.icon_ref as string | null })) ?? []),
            ]
            const filtered = missingThemeFilter
              ? allProducts.filter(p => p.missing_themes.includes(missingThemeFilter!))
              : allProducts
            return (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Produits sans icône ({filtered.length})
                </div>
                {iconsData && iconsData.themes.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <button onClick={() => setMissingThemeFilter(null)} style={filterChip(missingThemeFilter === null)}>Tous</button>
                    {iconsData.themes.map(t => (
                      <button key={t} onClick={() => setMissingThemeFilter(t === missingThemeFilter ? null : t)} style={filterChip(missingThemeFilter === t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {!iconsData ? (
                  <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Chargement…</p>
                ) : filtered.length === 0 ? (
                  <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>
                    {missingThemeFilter ? `Tous les produits ont une icône dans ${missingThemeFilter}.` : 'Tous les produits ont une icône.'}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {filtered.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.375rem 0.5rem', background: 'var(--bg)', borderRadius: 6,
                        fontSize: '0.8125rem',
                      }}>
                        <span style={{ color: 'var(--fg)', flex: 1 }}>
                          {p.name}
                          <span style={{ color: 'var(--fg2)', marginLeft: '0.375rem', fontSize: '0.75rem' }}>({p.category_name})</span>
                          {p.icon_ref && (
                            <span style={{ color: 'var(--fg2)', marginLeft: '0.375rem', fontSize: '0.6875rem', fontStyle: 'italic' }}>({p.icon_ref})</span>
                          )}
                        </span>
                        {!p.icon_ref && (
                          <button
                            onClick={() => { uploadTargetIdRef.current = p.id; uploadIconRef.current?.click() }}
                            disabled={uploadingIconFor === p.id}
                            style={{
                              padding: '0.25rem 0.625rem',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              background: 'var(--bg2)',
                              color: 'var(--fg)',
                              fontSize: '0.75rem',
                              cursor: uploadingIconFor === p.id ? 'not-allowed' : 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            {uploadingIconFor === p.id ? '…' : '↑ Upload'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Orphan custom icons */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Icônes custom orphelines ({iconsData?.orphan_custom.length ?? '…'})
              </div>
              {(iconsData?.orphan_custom.length ?? 0) > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`Supprimer ${iconsData!.orphan_custom.length} icône(s) orpheline(s) ?`))
                      deleteOrphanCustom(iconsData!.orphan_custom)
                  }}
                  disabled={deletingIcons.size > 0}
                  style={{
                    padding: '0.25rem 0.625rem',
                    border: '1px solid #fca5a5',
                    borderRadius: 6,
                    background: 'var(--bg)',
                    color: '#dc2626',
                    fontSize: '0.75rem',
                    cursor: deletingIcons.size > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Tout supprimer
                </button>
              )}
            </div>
            {!iconsData ? (
              <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Chargement…</p>
            ) : iconsData.orphan_custom.length === 0 ? (
              <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Aucune icône orpheline.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {iconsData.orphan_custom.map(filename => (
                  <div key={filename} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                    background: 'var(--bg)', borderRadius: 8, padding: '0.5rem',
                    border: '1px solid var(--border)', width: 80,
                  }}>
                    <img src={`/api/icons/${filename}`} alt={filename} width={40} height={40} style={{ borderRadius: 4, objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.625rem', color: 'var(--fg2)', wordBreak: 'break-all', textAlign: 'center', lineHeight: 1.2 }}>
                      {filename.length > 16 ? filename.slice(0, 8) + '…' + filename.slice(-4) : filename}
                    </span>
                    <button
                      onClick={() => deleteOrphanCustom([filename])}
                      disabled={deletingIcons.has(filename)}
                      style={{ padding: '0.125rem 0.375rem', border: '1px solid #fca5a5', borderRadius: 4, background: 'none', color: '#dc2626', fontSize: '0.6875rem', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme icons not linked to any product */}
          {(() => {
            const allOrphans = iconsData?.orphan_theme ?? []
            const filtered = orphanThemeFilter
              ? allOrphans.filter(o => o.theme === orphanThemeFilter)
              : allOrphans
            return (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Icônes de thème non utilisées ({filtered.length})
                </div>
                {iconsData && iconsData.themes.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <button onClick={() => setOrphanThemeFilter(null)} style={filterChip(orphanThemeFilter === null)}>Tous</button>
                    {iconsData.themes.map(t => (
                      <button key={t} onClick={() => setOrphanThemeFilter(t === orphanThemeFilter ? null : t)} style={filterChip(orphanThemeFilter === t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {!iconsData ? (
                  <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Chargement…</p>
                ) : filtered.length === 0 ? (
                  <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Aucune icône de thème non utilisée.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {filtered.map(({ filename, theme }) => (
                      <div key={`${theme}/${filename}`} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                        background: 'var(--bg)', borderRadius: 8, padding: '0.375rem',
                        border: '1px solid var(--border)', width: 72,
                      }}>
                        <img
                          src={`/api/icons/${filename}?theme=${theme}`}
                          alt={filename}
                          width={36}
                          height={36}
                          style={{ borderRadius: 4, objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: '0.6rem', color: 'var(--fg2)', wordBreak: 'break-all', textAlign: 'center', lineHeight: 1.2 }}>
                          {filename.replace(/\.(png|jpg|jpeg|webp)$/i, '')}
                        </span>
                        {!orphanThemeFilter && (
                          <span style={{ fontSize: '0.55rem', color: 'var(--primary)', fontWeight: 600 }}>{theme}</span>
                        )}
                        <button
                          onClick={() => deleteThemeIcon(filename, theme)}
                          disabled={deletingIcons.has(`${theme}/${filename}`)}
                          style={{ padding: '0.125rem 0.375rem', border: '1px solid #fca5a5', borderRadius: 4, background: 'none', color: '#dc2626', fontSize: '0.6875rem', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Recipe Photos */}
      {tab === 'recipe-photos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Recipes without photo */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Recettes sans photo ({recipePhotosData?.recipes_without_photo?.length ?? '\u2026'})
            </div>
            {!recipePhotosData ? (
              <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Chargement\u2026</p>
            ) : recipePhotosData.recipes_without_photo.length === 0 ? (
              <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Toutes les recettes ont une photo.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {recipePhotosData.recipes_without_photo.map((r: any) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0.5rem', background: 'var(--bg)', borderRadius: 6, fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--fg)' }}>
                      {r.name}
                      {r.category_name && <span style={{ color: 'var(--fg2)', marginLeft: '0.375rem', fontSize: '0.75rem' }}>({r.category_name})</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipes with photo */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Recettes avec photo ({recipePhotosData?.recipes_with_photo?.length ?? '\u2026'})
            </div>
            {recipePhotosData?.recipes_with_photo?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {recipePhotosData.recipes_with_photo.map((r: any) => (
                  <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: 'var(--bg)', borderRadius: 8, padding: '0.375rem', border: '1px solid var(--border)', width: 90 }}>
                    <img src={r.photo_url} alt={r.name} width={72} height={72} style={{ borderRadius: 6, objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--fg2)', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-all' }}>{r.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orphan photos */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Photos orphelines ({recipePhotosData?.orphan_photos?.length ?? '\u2026'})
              </div>
              {(recipePhotosData?.orphan_photos?.length ?? 0) > 0 && (
                <button
                  onClick={() => { if (confirm(`Supprimer ${recipePhotosData.orphan_photos.length} photo(s) orpheline(s) ?`)) deleteOrphanRecipePhotos(recipePhotosData.orphan_photos) }}
                  style={{ padding: '0.25rem 0.625rem', border: '1px solid #fca5a5', borderRadius: 6, background: 'var(--bg)', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Tout supprimer
                </button>
              )}
            </div>
            {!recipePhotosData ? (
              <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Chargement\u2026</p>
            ) : recipePhotosData.orphan_photos.length === 0 ? (
              <p style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Aucune photo orpheline.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {recipePhotosData.orphan_photos.map((f: string) => (
                  <div key={f} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: 'var(--bg)', borderRadius: 8, padding: '0.375rem', border: '1px solid var(--border)', width: 90 }}>
                    <img src={`/api/recipes/photos/${f}`} alt={f} width={72} height={72} style={{ borderRadius: 6, objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--fg2)', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-all' }}>{f}</span>
                    <button
                      onClick={() => deleteOrphanRecipePhotos([f])}
                      style={{ padding: '0.125rem 0.375rem', border: '1px solid #fca5a5', borderRadius: 4, background: 'none', color: '#dc2626', fontSize: '0.6875rem', cursor: 'pointer' }}
                    >\u00d7</button>
                  </div>
                ))}
              </div>
            )}
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

function filterChip(active: boolean): React.CSSProperties {
  return {
    padding: '0.2rem 0.6rem',
    borderRadius: 9999,
    border: '1px solid var(--border)',
    background: active ? 'var(--primary)' : 'var(--bg)',
    color: active ? 'var(--primary-fg)' : 'var(--fg2)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  }
}
