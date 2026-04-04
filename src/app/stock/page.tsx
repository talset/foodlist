'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { ApiStockItem } from '@/types'
import { useSSE } from '@/hooks/useSSE'

const STATUS_LABELS: Record<string, string> = {
  in_stock: 'En stock',
  low: 'Peu',
  out_of_stock: 'Épuisé',
}

const STATUS_COLORS: Record<string, string> = {
  in_stock: '#16a34a',
  low: '#d97706',
  out_of_stock: '#dc2626',
}

function groupByCategory(items: ApiStockItem[]) {
  const map = new Map<string, { category_id: number; items: ApiStockItem[] }>()
  for (const item of items) {
    if (!map.has(item.category_name)) {
      map.set(item.category_name, { category_id: item.category_id, items: [] })
    }
    map.get(item.category_name)!.items.push(item)
  }
  return map
}

export default function StockPage() {
  const [items, setItems] = useState<ApiStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQty, setEditQty] = useState(0)

  const load = useCallback(async () => {
    const url = statusFilter ? `/api/stock?status=${statusFilter}` : '/api/stock'
    const res = await fetch(url)
    if (res.ok) setItems((await res.json()).items)
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setCategoryFilter(null) }, [statusFilter])
  useSSE(['stock_updated'], load)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const item of items) {
      if (!seen.has(item.category_name)) {
        seen.add(item.category_name)
        result.push(item.category_name)
      }
    }
    return result
  }, [items])

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter(item => {
      if (q && !item.product_name.toLowerCase().includes(q)) return false
      if (categoryFilter && item.category_name !== categoryFilter) return false
      return true
    })
  }, [items, search, categoryFilter])

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i))
  }

  async function saveQty(id: number) {
    const res = await fetch(`/api/stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: editQty }),
    })
    if (res.ok) {
      const newStatus = editQty === 0 ? 'out_of_stock' : 'in_stock'
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: editQty, status: newStatus as any } : i))
    }
    setEditingId(null)
  }

  async function deleteItem(id: number) {
    const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
  }

  const groups = groupByCategory(filteredItems)

  return (
    <main style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 1rem' }}>Mon stock</h1>

      {/* Recherche */}
      <input
        type="search"
        placeholder="Rechercher un produit…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
          border: '1px solid var(--border)', borderRadius: 8,
          background: 'var(--input-bg)', color: 'var(--fg)',
          fontSize: '0.9375rem', outline: 'none',
        }}
      />

      {/* Filtre statut */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        {([null, 'in_stock', 'low', 'out_of_stock'] as const).map(s => (
          <button
            key={String(s)}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '0.25rem 0.75rem', borderRadius: 9999,
              border: '1px solid var(--border)',
              background: statusFilter === s ? 'var(--primary)' : 'var(--bg2)',
              color: statusFilter === s ? 'var(--primary-fg)' : 'var(--fg2)',
              cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {s ? STATUS_LABELS[s] : 'Tous'}
          </button>
        ))}
      </div>

      {/* Strip catégories */}
      {categories.length > 1 && (
        <div style={{
          display: 'flex', gap: '0.375rem', overflowX: 'auto',
          paddingBottom: '0.5rem', marginBottom: '0.75rem',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setCategoryFilter(null)}
            style={{
              padding: '0.25rem 0.75rem', borderRadius: 9999,
              border: '1px solid var(--border)', flexShrink: 0,
              background: categoryFilter === null ? 'var(--primary)' : 'var(--bg2)',
              color: categoryFilter === null ? 'var(--primary-fg)' : 'var(--fg2)',
              cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
            }}
          >
            Toutes
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              style={{
                padding: '0.25rem 0.75rem', borderRadius: 9999,
                border: '1px solid var(--border)', flexShrink: 0,
                background: categoryFilter === cat ? 'var(--primary)' : 'var(--bg2)',
                color: categoryFilter === cat ? 'var(--primary-fg)' : 'var(--fg2)',
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--fg2)' }}>Chargement…</p>
      ) : filteredItems.length === 0 ? (
        <div style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '2rem' }}>
          {items.length === 0 ? (
            <>
              <p style={{ marginBottom: '0.5rem' }}>Aucun article dans le stock.</p>
              <p style={{ fontSize: '0.875rem' }}>Cette vue affiche les produits que vous souhaitez suivre dans votre foyer. Rendez-vous sur la page <strong>Produits</strong> pour sélectionner ceux que vous voulez mettre en stock.</p>
            </>
          ) : (
            <p>Aucun résultat.</p>
          )}
        </div>
      ) : (
        Array.from(groups.entries()).map(([categoryName, group]) => (
          <section key={categoryName} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg2)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: '0.25rem',
            }}>
              {categoryName}
            </h2>
            {group.items.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
              }}>
                {item.icon_url
                  ? <img src={item.icon_url} alt="" width={32} height={32} style={{ borderRadius: 4, flexShrink: 0 }} />
                  : <div style={{ width: 32, height: 32, flexShrink: 0 }} />
                }

                <span style={{ flex: 1, fontWeight: 500, color: 'var(--fg)' }}>{item.product_name}</span>

                {editingId === item.id ? (
                  <input
                    type="number"
                    value={editQty}
                    min={0}
                    onChange={e => setEditQty(parseInt(e.target.value) || 0)}
                    onBlur={() => saveQty(item.id)}
                    onKeyDown={e => e.key === 'Enter' && saveQty(item.id)}
                    autoFocus
                    style={{
                      width: 60, padding: '0.25rem',
                      border: '1px solid var(--border)', borderRadius: 4,
                      background: 'var(--input-bg)', color: 'var(--fg)',
                    }}
                  />
                ) : (
                  <button
                    onClick={() => { setEditingId(item.id); setEditQty(item.quantity) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg2)', fontSize: '0.875rem' }}
                  >
                    {item.quantity} {item.ref_unit}
                  </button>
                )}

                <span style={{
                  fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: 9999,
                  background: STATUS_COLORS[item.status] + '22',
                  color: STATUS_COLORS[item.status], fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {STATUS_LABELS[item.status]}
                </span>

                <select
                  value={item.status}
                  onChange={e => updateStatus(item.id, e.target.value)}
                  style={{
                    fontSize: '0.75rem', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '0.125rem',
                    background: 'var(--input-bg)', color: 'var(--fg)',
                  }}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>

                <button
                  onClick={() => deleteItem(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.125rem', lineHeight: 1 }}
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </section>
        ))
      )}
    </main>
  )
}
