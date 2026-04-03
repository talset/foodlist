'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import IconPicker from '@/components/IconPicker'
import type { ApiCategory } from '@/types'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [refUnit, setRefUnit] = useState('')
  const [refQuantity, setRefQuantity] = useState<number | ''>(1)
  const [iconRef, setIconRef] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((cats: ApiCategory[]) => {
        setCategories(cats)
        if (cats.length) setCategoryId(cats[0].id)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category_id: categoryId,
        ref_unit: refUnit,
        ref_quantity: Number(refQuantity),
        icon_ref: iconRef,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error === 'PRODUCT_EXISTS' ? 'Un produit avec ce nom existe déjà.' : 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    router.push('/products')
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Nouveau produit</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={labelStyle}>
          Nom
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={inputStyle}
            placeholder="Ex : Lait entier"
          />
        </label>

        <label style={labelStyle}>
          Catégorie
          <select
            value={categoryId}
            onChange={e => setCategoryId(Number(e.target.value))}
            required
            style={inputStyle}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Unité de référence
          <input
            type="text"
            value={refUnit}
            onChange={e => setRefUnit(e.target.value)}
            required
            style={inputStyle}
            placeholder="Ex : L, g, kg, unité…"
          />
        </label>

        <label style={labelStyle}>
          Quantité par item physique
          <input
            type="number"
            value={refQuantity}
            onChange={e => setRefQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            required
            min={0.001}
            step={0.001}
            style={inputStyle}
          />
        </label>

        <div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Icône</span>
          <IconPicker value={iconRef} onChange={setIconRef} />
        </div>

        {error && <p style={{ color: '#e53e3e', fontSize: '0.875rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={() => router.back()} style={btnSecondaryStyle}>
            Annuler
          </button>
          <button type="submit" disabled={loading} style={btnPrimaryStyle}>
            {loading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: '0.9rem',
  fontWeight: 500,
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
  flex: 1,
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
  padding: '0.625rem 1.25rem',
  background: '#fff',
  color: '#333',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
}
