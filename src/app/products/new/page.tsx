'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import IconPicker from '@/components/IconPicker'
import NumberInput from '@/components/NumberInput'
import type { ApiCategory } from '@/types'

const REF_UNITS = [
  { group: 'Poids', options: ['g', 'kg'] },
  { group: 'Volume', options: ['mL', 'cL', 'L'] },
  { group: 'Quantité', options: ['unité', 'pièce', 'tranche', 'dose'] },
  { group: 'Conditionnement', options: ['sachet', 'boîte', 'pot', 'bouteille', 'verre', 'tasse'] },
  { group: 'Cuisine', options: ['cuil. à soupe', 'cuil. à café'] },
]

const FIELD_HELP: Record<string, string> = {
  name: 'Nom exact du produit, tel qu\'il sera affiché dans le stock et les recettes.',
  category: 'Catégorie pour regrouper les produits dans le stock et la liste de courses.',
  refUnit: 'Unité dans laquelle la quantité est exprimée. Ex : "L" pour une brique de lait, "g" pour un paquet de farine.',
  refQuantity: 'Combien d\'unités contient un item physique (1 bouteille, 1 paquet, 1 boîte…). Ex : une brique de lait = 1 L → quantité 1. Un pot de 500 g → quantité 500.',
  icon: 'Icône représentant le produit. Recherchez par nom (ex : "lait") ou uploadez votre propre image.',
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [refUnit, setRefUnit] = useState('unité')
  const [refQuantity, setRefQuantity] = useState<number>(1)
  const [iconRef, setIconRef] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [helpOpen, setHelpOpen] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((cats: ApiCategory[]) => {
        setCategories(cats)
        if (cats.length) setCategoryId(cats[0].id)
      })
  }, [])

  function toggleHelp(field: string) {
    setHelpOpen(prev => prev === field ? null : field)
  }

  // Dynamic step: 1 for integers, 0.1 for 1 decimal, 0.01 for 2 decimals
  function getStep(val: number): number {
    const str = val.toString()
    const dec = str.includes('.') ? str.split('.')[1].length : 0
    if (dec === 0) return 1
    if (dec === 1) return 0.1
    return 0.01
  }

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
        ref_quantity: refQuantity,
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
      <h1 style={{ marginBottom: '1.5rem' }}>Nouveau produit</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Nom */}
        <div>
          <FieldLabel label="Nom" field="name" helpOpen={helpOpen} onToggle={toggleHelp} />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={inputStyle}
            placeholder="Ex : Lait entier"
          />
          <HelpText field="name" helpOpen={helpOpen} />
        </div>

        {/* Catégorie */}
        <div>
          <FieldLabel label="Catégorie" field="category" helpOpen={helpOpen} onToggle={toggleHelp} />
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
          <HelpText field="category" helpOpen={helpOpen} />
        </div>

        {/* Unité de référence */}
        <div>
          <FieldLabel label="Unité de référence" field="refUnit" helpOpen={helpOpen} onToggle={toggleHelp} />
          <select
            value={refUnit}
            onChange={e => setRefUnit(e.target.value)}
            required
            style={inputStyle}
          >
            {REF_UNITS.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <HelpText field="refUnit" helpOpen={helpOpen} />
        </div>

        {/* Quantité par item physique */}
        <div>
          <FieldLabel label="Quantité par item physique" field="refQuantity" helpOpen={helpOpen} onToggle={toggleHelp} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setRefQuantity(q => Math.max(0.01, parseFloat((q - getStep(q)).toFixed(3))))}
              style={qtyBtnStyle}
            >−</button>
            <NumberInput
              value={refQuantity}
              onChange={v => setRefQuantity(v)}
              fallback={1}
              min={0.001}
              step="any"
              style={{ ...inputStyle, flex: 1, textAlign: 'center' }}
            />
            <button
              type="button"
              onClick={() => setRefQuantity(q => parseFloat((q + getStep(q)).toFixed(3)))}
              style={qtyBtnStyle}
            >+</button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginTop: '0.25rem' }}>
            = {refQuantity} {refUnit} par item
          </div>
          <HelpText field="refQuantity" helpOpen={helpOpen} />
        </div>

        {/* Icône */}
        <div>
          <FieldLabel label="Icône" field="icon" helpOpen={helpOpen} onToggle={toggleHelp} />
          <HelpText field="icon" helpOpen={helpOpen} />
          <IconPicker value={iconRef} onChange={setIconRef} />
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={() => router.back()} style={btnSecondaryStyle}>
            Annuler
          </button>
          <button type="submit" disabled={loading} style={btnPrimaryStyle}>
            {loading ? 'Création…' : 'Créer le produit'}
          </button>
        </div>
      </form>
    </main>
  )
}

function FieldLabel({ label, field, helpOpen, onToggle }: {
  label: string
  field: string
  helpOpen: string | null
  onToggle: (f: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--fg)' }}>{label}</span>
      <button
        type="button"
        onClick={() => onToggle(field)}
        title="Aide"
        style={{
          width: 18, height: 18, borderRadius: '50%',
          border: '1px solid var(--border)',
          background: helpOpen === field ? 'var(--primary)' : 'var(--bg2)',
          color: helpOpen === field ? 'var(--primary-fg)' : 'var(--fg2)',
          fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, lineHeight: 1,
        }}
      >?</button>
    </div>
  )
}

function HelpText({ field, helpOpen }: { field: string; helpOpen: string | null }) {
  if (helpOpen !== field) return null
  return (
    <div style={{
      fontSize: '0.8rem', color: 'var(--fg2)',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '0.5rem 0.625rem',
      marginTop: '0.375rem', marginBottom: '0.25rem',
      lineHeight: 1.5,
    }}>
      {FIELD_HELP[field]}
    </div>
  )
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
