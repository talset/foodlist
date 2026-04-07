'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import IconPicker from '@/components/IconPicker'
import NumberInput from '@/components/NumberInput'
import type { ApiProduct, ApiCategory } from '@/types'

const REF_UNITS = [
  { group: 'Poids', options: ['g', 'kg'] },
  { group: 'Volume', options: ['mL', 'cL', 'L'] },
  { group: 'Quantité', options: ['unité', 'pièce', 'tranche', 'dose'] },
  { group: 'Conditionnement', options: ['sachet', 'boîte', 'pot', 'bouteille', 'verre', 'tasse'] },
  { group: 'Cuisine', options: ['cuil. à soupe', 'cuil. à café'] },
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [refUnit, setRefUnit] = useState('unité')
  const [refQuantity, setRefQuantity] = useState<number>(1)
  const [iconRef, setIconRef] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/products/${params.id}`).then(r => r.ok ? r.json() : null),
    ]).then(([cats, product]: [ApiCategory[], ApiProduct | null]) => {
      setCategories(cats)
      if (!product) { setNotFound(true); return }
      setName(product.name)
      setCategoryId(product.category_id)
      setRefUnit(product.ref_unit)
      setRefQuantity(product.ref_quantity)
      setIconRef(product.icon_ref)
    })
  }, [params.id])

  function getStep(val: number): number {
    const str = val.toString()
    const dec = str.includes('.') ? str.split('.')[1].length : 0
    if (dec === 0) return 1
    if (dec === 1) return 0.1
    return 0.01
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/products/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category_id: categoryId, ref_unit: refUnit, ref_quantity: refQuantity, icon_ref: iconRef }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error === 'PRODUCT_EXISTS' ? 'Un produit avec ce nom existe déjà.' : 'Une erreur est survenue.')
      setLoading(false)
      return
    }
    router.push('/products')
  }

  async function handleDelete() {
    if (!window.confirm('Supprimer ce produit ?')) return
    const res = await fetch(`/api/products/${params.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error === 'PRODUCT_IN_USE' ? 'Ce produit est utilisé dans une recette ou un stock.' : 'Erreur lors de la suppression.')
      return
    }
    router.push('/products')
  }

  if (notFound) {
    return <main style={{ padding: '1rem', textAlign: 'center', color: 'var(--fg2)' }}>Produit introuvable.</main>
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Modifier le produit</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Nom */}
        <div>
          <label style={labelStyle}>Nom</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
        </div>

        {/* Catégorie */}
        <div>
          <label style={labelStyle}>Catégorie</label>
          <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} required style={inputStyle}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Unité de référence */}
        <div>
          <label style={labelStyle}>Unité de référence</label>
          <select value={refUnit} onChange={e => setRefUnit(e.target.value)} required style={inputStyle}>
            {REF_UNITS.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map(u => <option key={u} value={u}>{u}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Quantité par item physique */}
        <div>
          <label style={labelStyle}>Quantité par item physique</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button" onClick={() => setRefQuantity(q => Math.max(0.01, parseFloat((q - getStep(q)).toFixed(3))))} style={qtyBtnStyle}>−</button>
            <NumberInput
              value={refQuantity}
              onChange={v => setRefQuantity(v)}
              fallback={1}
              min={0.001} step="any"
              style={{ ...inputStyle, flex: 1, textAlign: 'center' }}
            />
            <button type="button" onClick={() => setRefQuantity(q => parseFloat((q + getStep(q)).toFixed(3)))} style={qtyBtnStyle}>+</button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginTop: '0.25rem' }}>
            = {refQuantity} {refUnit} par item
          </div>
        </div>

        {/* Icône */}
        <div>
          <label style={labelStyle}>Icône</label>
          <IconPicker value={iconRef} onChange={setIconRef} />
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={() => router.back()} style={btnSecondaryStyle}>Annuler</button>
          <button type="submit" disabled={loading} style={btnPrimaryStyle}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

      <button onClick={handleDelete} style={btnDangerStyle}>Supprimer ce produit</button>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--fg)',
  marginBottom: '0.375rem',
}

const inputStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: '0.9375rem',
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--input-bg)',
  color: 'var(--fg)',
  outline: 'none',
}

const qtyBtnStyle: React.CSSProperties = {
  width: 40, height: 40, flexShrink: 0,
  border: '1px solid var(--border)', borderRadius: 8,
  background: 'var(--bg2)', color: 'var(--fg)',
  fontSize: '1.125rem', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const btnPrimaryStyle: React.CSSProperties = {
  flex: 1,
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
  padding: '0.625rem 1.25rem',
  background: 'var(--bg2)',
  color: 'var(--fg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
}

const btnDangerStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem',
  background: 'var(--bg)',
  color: '#dc2626',
  border: '1px solid #fca5a5',
  borderRadius: 8,
  fontSize: '1rem',
  cursor: 'pointer',
}
