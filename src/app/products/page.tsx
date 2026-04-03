'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { ApiProduct, ApiCategory } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
  }, [])

  const fetchProducts = useCallback(() => {
    const params = new URLSearchParams({ limit: '100' })
    if (q) params.set('q', q)
    if (categoryId) params.set('category_id', String(categoryId))
    setLoading(true)
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(data => setProducts(data.products ?? []))
      .finally(() => setLoading(false))
  }, [q, categoryId])

  useEffect(() => {
    const t = setTimeout(fetchProducts, q ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchProducts, q])

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Produits</h1>
        <Link href="/products/new" style={{
          padding: '0.5rem 1rem',
          background: '#3182ce',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          + Ajouter
        </Link>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Rechercher un produit…"
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{
          width: '100%',
          padding: '0.625rem 0.75rem',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: '1rem',
          marginBottom: '0.75rem',
          boxSizing: 'border-box',
        }}
      />

      {/* Category chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setCategoryId(null)}
          style={{ ...chipStyle, ...(categoryId === null ? chipActiveStyle : {}) }}
        >
          Tous
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            style={{ ...chipStyle, ...(categoryId === cat.id ? chipActiveStyle : {}) }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product list */}
      {loading && <p style={{ color: '#999', textAlign: 'center' }}>Chargement…</p>}

      {!loading && products.length === 0 && (
        <p style={{ color: '#999', textAlign: 'center', marginTop: '2rem' }}>
          Aucun produit trouvé.
        </p>
      )}

      {products.map(p => (
        <div key={p.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 0',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {p.icon_url
              ? <img src={p.icon_url} width={32} height={32} alt="" />
              : <span style={{ color: '#ccc' }}>?</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {p.category_name} · {p.ref_quantity} {p.ref_unit}
            </div>
          </div>
          <Link href={`/products/${p.id}/edit`} style={{ fontSize: '0.85rem', color: '#3182ce', textDecoration: 'none', flexShrink: 0 }}>
            Modifier
          </Link>
        </div>
      ))}
    </main>
  )
}

const chipStyle: React.CSSProperties = {
  padding: '0.3rem 0.75rem',
  border: '1px solid #e2e8f0',
  borderRadius: 999,
  background: '#f7fafc',
  cursor: 'pointer',
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const chipActiveStyle: React.CSSProperties = {
  background: '#3182ce',
  color: '#fff',
  border: '1px solid #3182ce',
}
