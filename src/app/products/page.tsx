'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import type { ApiProduct, ApiCategory } from '@/types'
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll'

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [stockIds, setStockIds] = useState<Set<number>>(new Set())
  const [adding, setAdding] = useState<Set<number>>(new Set())

  const categoryStripRef = useHorizontalScroll<HTMLDivElement>()

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
    fetch('/api/stock')
      .then(r => r.json())
      .then(d => setStockIds(new Set((d.items ?? []).map((i: any) => i.product_id as number))))
  }, [])

  const fetchProducts = useCallback(() => {
    const params = new URLSearchParams({ limit: '1000' })
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

  async function addToStock(productId: number) {
    setAdding(prev => new Set(prev).add(productId))
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: 0, status: 'in_stock' }),
    })
    if (res.ok) {
      setStockIds(prev => new Set(prev).add(productId))
    }
    setAdding(prev => { const s = new Set(prev); s.delete(productId); return s })
  }

  const toAddCount = useMemo(
    () => products.filter(p => !stockIds.has(p.id)).length,
    [products, stockIds]
  )

  async function addAllToStock() {
    const toAdd = products.filter(p => !stockIds.has(p.id))
    for (const p of toAdd) {
      await addToStock(p.id)
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Produits</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {toAddCount > 0 && (
            <button
              onClick={addAllToStock}
              style={{
                padding: '0.5rem 0.875rem',
                background: 'var(--bg2)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Tout ajouter au stock ({toAddCount})
            </button>
          )}
          <Link href="/products/new" style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'var(--primary-fg)',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            + Nouveau
          </Link>
        </div>
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
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: '1rem',
          marginBottom: '0.75rem',
          boxSizing: 'border-box',
          background: 'var(--input-bg)',
          color: 'var(--fg)',
          outline: 'none',
        }}
      />

      {/* Category chips */}
      <div ref={categoryStripRef} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem', scrollbarWidth: 'none', cursor: 'grab' }}>
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
      {loading && <p style={{ color: 'var(--fg2)', textAlign: 'center' }}>Chargement…</p>}

      {!loading && products.length === 0 && (
        <div style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '2rem' }}>
          {q || categoryId ? (
            <p>Aucun produit trouvé.</p>
          ) : (
            <>
              <p style={{ marginBottom: '0.5rem' }}>Aucun produit dans le catalogue.</p>
              <p style={{ fontSize: '0.875rem' }}>Ajoutez des produits ici pour les retrouver dans votre stock et vos recettes.</p>
            </>
          )}
        </div>
      )}

      {!loading && products.length > 0 && (() => {
        const groups = new Map<string, ApiProduct[]>()
        for (const p of products) {
          if (!groups.has(p.category_name)) groups.set(p.category_name, [])
          groups.get(p.category_name)!.push(p)
        }
        return Array.from(groups.entries()).map(([catName, items]) => (
          <section key={catName} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg2)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: '0.25rem',
            }}>
              {catName}
            </h2>
            {items.map(p => {
              const inStock = stockIds.has(p.id)
              const isAdding = adding.has(p.id)
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.icon_url
                      ? <img src={p.icon_url} width={32} height={32} alt="" style={{ borderRadius: 4 }} />
                      : <span style={{ color: 'var(--border)', fontSize: '1.25rem' }}>·</span>
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--fg2)' }}>
                      {p.ref_quantity} {p.ref_unit}
                    </div>
                  </div>

                  {inStock ? (
                    <span style={{
                      fontSize: '0.75rem', color: '#16a34a', fontWeight: 600,
                      padding: '0.25rem 0.625rem', borderRadius: 9999,
                      background: '#16a34a18', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      En stock
                    </span>
                  ) : (
                    <button
                      onClick={() => addToStock(p.id)}
                      disabled={isAdding}
                      style={{
                        padding: '0.25rem 0.625rem',
                        background: 'var(--primary)', color: 'var(--primary-fg)',
                        border: 'none', borderRadius: 6,
                        fontSize: '0.8125rem', fontWeight: 600,
                        cursor: isAdding ? 'not-allowed' : 'pointer',
                        opacity: isAdding ? 0.6 : 1,
                        flexShrink: 0, whiteSpace: 'nowrap',
                      }}
                    >
                      {isAdding ? '…' : '+ Stock'}
                    </button>
                  )}

                  <Link
                    href={`/products/${p.id}/edit`}
                    style={{ fontSize: '0.8125rem', color: 'var(--fg2)', textDecoration: 'none', flexShrink: 0 }}
                  >
                    ✎
                  </Link>
                </div>
              )
            })}
          </section>
        ))
      })()}
    </main>
  )
}

const chipStyle: React.CSSProperties = {
  padding: '0.3rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 999,
  background: 'var(--bg2)',
  color: 'var(--fg2)',
  cursor: 'pointer',
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const chipActiveStyle: React.CSSProperties = {
  background: 'var(--primary)',
  color: 'var(--primary-fg)',
  border: '1px solid var(--primary)',
}
