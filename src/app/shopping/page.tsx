'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import type { ApiStockItem } from '@/types'
import { useSSE } from '@/hooks/useSSE'

interface ActiveRecipe {
  id: number
  recipe_name: string
  multiplier: number
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ApiStockItem[]>([])
  const [activeRecipes, setActiveRecipes] = useState<ActiveRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState<Set<number>>(new Set())
  const [restocking, setRestocking] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [recipeFilter, setRecipeFilter] = useState<number | null>(null)

  const load = useCallback(() => {
    fetch('/api/shopping')
      .then(r => r.json())
      .then(d => {
        setItems(d.items ?? [])
        setActiveRecipes(d.activeRecipes ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => { load() }, [load])
  useSSE(['stock_updated', 'shopping_updated'], load)

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
      if (recipeFilter !== null && !item.recipe_ids?.includes(recipeFilter)) return false
      return true
    })
  }, [items, search, categoryFilter, recipeFilter])

  async function restockAll() {
    if (!confirm(`Marquer les ${items.length} articles comme "en stock" ?`)) return
    setRestocking(true)
    const res = await fetch('/api/shopping/restock', { method: 'POST' })
    if (res.ok) {
      setItems([])
      setActiveRecipes([])
    }
    setRestocking(false)
  }

  async function checkOff(item: ApiStockItem) {
    setChecking(prev => new Set(prev).add(item.id))
    setItems(prev => prev.filter(i => i.id !== item.id))

    const res = await fetch(`/api/stock/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_stock' }),
    })
    if (!res.ok) {
      setItems(prev => [...prev, item].sort((a, b) => a.product_name.localeCompare(b.product_name)))
    }
    setChecking(prev => { const s = new Set(prev); s.delete(item.id); return s })
  }

  return (
    <main style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Liste de courses</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {items.length > 0 && (
            <button
              onClick={restockAll}
              disabled={restocking}
              style={{
                padding: '0.375rem 0.75rem',
                background: 'var(--primary)', color: 'var(--primary-fg)',
                border: 'none', borderRadius: 8,
                fontSize: '0.8125rem', fontWeight: 600,
                cursor: restocking ? 'not-allowed' : 'pointer',
                opacity: restocking ? 0.7 : 1,
              }}
            >
              {restocking ? '…' : 'Tout restockér'}
            </button>
          )}
          <span style={{
            background: 'var(--primary)', color: 'var(--primary-fg)',
            borderRadius: 9999, padding: '0.125rem 0.5rem',
            fontSize: '0.875rem', fontWeight: 600,
          }}>
            {items.length}
          </span>
        </div>
      </div>

      {/* Recherche */}
      <input
        type="search"
        placeholder="Rechercher…"
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

      {/* Strip catégories */}
      {categories.length > 1 && (
        <div style={{
          display: 'flex', gap: '0.375rem', overflowX: 'auto',
          paddingBottom: '0.5rem', marginBottom: '0.5rem',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setCategoryFilter(null)}
            style={chipStyle(categoryFilter === null)}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              style={chipStyle(categoryFilter === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Strip recettes actives */}
      {activeRecipes.length > 0 && (
        <div style={{
          display: 'flex', gap: '0.375rem', overflowX: 'auto',
          paddingBottom: '0.75rem', marginBottom: '0.25rem',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setRecipeFilter(null)}
            style={chipStyle(recipeFilter === null, true)}
          >
            Toutes recettes
          </button>
          {activeRecipes.map(r => (
            <button
              key={r.id}
              onClick={() => setRecipeFilter(r.id === recipeFilter ? null : r.id)}
              style={chipStyle(recipeFilter === r.id, true)}
            >
              {r.recipe_name}{r.multiplier !== 1 ? ` ×${r.multiplier}` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <p style={{ color: 'var(--fg2)' }}>Chargement…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '3rem' }}>
          Liste vide — tout est en stock !
        </p>
      ) : filteredItems.length === 0 ? (
        <p style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '2rem' }}>Aucun résultat.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredItems.map(item => (
            <li key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 0', borderBottom: '1px solid var(--border)',
            }}>
              <button
                onClick={() => checkOff(item)}
                disabled={checking.has(item.id)}
                style={{
                  width: 24, height: 24, borderRadius: 4, flexShrink: 0,
                  border: '2px solid var(--border)', background: 'var(--bg)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Marquer comme acheté"
              >
                {checking.has(item.id) ? '…' : ''}
              </button>

              {item.icon_url && (
                <img src={item.icon_url} alt="" width={28} height={28} style={{ borderRadius: 4, flexShrink: 0 }} />
              )}

              <span style={{ flex: 1, fontWeight: 500, color: 'var(--fg)' }}>
                {item.product_name}
              </span>

              {item.recipe_quantity != null && item.recipe_quantity > 0 && (
                <span style={{
                  background: 'var(--primary)', color: 'var(--primary-fg)',
                  borderRadius: 9999, padding: '0.125rem 0.5rem',
                  fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {item.recipe_quantity % 1 === 0
                    ? item.recipe_quantity
                    : item.recipe_quantity.toFixed(1)} {item.ref_unit}
                </span>
              )}

              {item.quantity > 0 && (
                <span style={{ color: 'var(--fg2)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  ×{item.quantity}
                </span>
              )}

              <span style={{ fontSize: '0.75rem', color: 'var(--fg2)', whiteSpace: 'nowrap' }}>
                {item.category_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function chipStyle(active: boolean, small = false): React.CSSProperties {
  return {
    padding: small ? '0.2rem 0.6rem' : '0.25rem 0.75rem',
    borderRadius: 9999,
    border: '1px solid var(--border)',
    flexShrink: 0,
    background: active ? 'var(--primary)' : 'var(--bg2)',
    color: active ? 'var(--primary-fg)' : 'var(--fg2)',
    cursor: 'pointer',
    fontSize: small ? '0.75rem' : '0.8125rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  }
}
