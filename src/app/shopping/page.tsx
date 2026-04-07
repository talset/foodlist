'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import type { ApiStockItem } from '@/types'
import { useSSE } from '@/hooks/useSSE'
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll'
import { norm } from '@/lib/search'

function groupByCategory(items: ApiStockItem[]) {
  const map = new Map<string, ApiStockItem[]>()
  for (const item of items) {
    if (!map.has(item.category_name)) map.set(item.category_name, [])
    map.get(item.category_name)!.push(item)
  }
  return map
}

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
  const categoryStripRef = useHorizontalScroll<HTMLDivElement>()
  const recipeStripRef = useHorizontalScroll<HTMLDivElement>()

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
    const q = norm(search)
    return items.filter(item => {
      if (q && !norm(item.product_name).includes(q)) return false
      if (categoryFilter && item.category_name !== categoryFilter) return false
      if (recipeFilter !== null && !item.recipe_ids?.includes(recipeFilter)) return false
      return true
    })
  }, [items, search, categoryFilter, recipeFilter])

  function buildShareText(): string {
    const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    const lines: string[] = [`🛒 Liste de courses — ${items.length} article${items.length > 1 ? 's' : ''}`]
    lines.push(date)
    if (activeRecipes.length > 0) {
      lines.push(`\nRecettes : ${activeRecipes.map(r => r.recipe_name + (r.multiplier !== 1 ? ` ×${r.multiplier}` : '')).join(', ')}`)
    }
    let lastCat = ''
    for (const item of items) {
      if (item.category_name !== lastCat) {
        lines.push(`\n${item.category_name}`)
        lastCat = item.category_name
      }
      const rq = item.recipe_quantity ?? 0
      const qty = rq > 0
        ? `  (${rq % 1 === 0 ? rq : rq.toFixed(1)} ${item.ref_unit})`
        : ''
      lines.push(`• ${item.product_name}${qty}`)
    }
    return lines.join('\n')
  }

  async function shareList() {
    const text = buildShareText()
    if (navigator.share) {
      try { await navigator.share({ title: 'Liste de courses', text }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      alert('Liste copiée dans le presse-papier !')
    }
  }

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

    // Compute remaining items and stale recipes before state update
    const remaining = items.filter(i => i.id !== item.id)
    const remainingRecipeIds = new Set(remaining.flatMap(i => i.recipe_ids ?? []))
    const staleRecipes = activeRecipes.filter(r => !remainingRecipeIds.has(r.id))

    setItems(remaining)
    setActiveRecipes(prev => prev.filter(r => remainingRecipeIds.has(r.id)))
    setRecipeFilter(rf => rf !== null && !remainingRecipeIds.has(rf) ? null : rf)

    let ok: boolean
    if (item.id < 0) {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: item.product_id, quantity: 0, status: 'in_stock' }),
      })
      ok = res.ok
    } else {
      const res = await fetch(`/api/stock/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_stock' }),
      })
      ok = res.ok
    }
    if (!ok) {
      setItems(prev => [...prev, item].sort((a, b) => a.product_name.localeCompare(b.product_name)))
    } else {
      // Delete shopping_recipes that no longer have items in the list
      for (const r of staleRecipes) {
        await fetch('/api/shopping/recipes/by-recipe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe_id: r.id }),
        })
      }
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
            <>
              <button
                onClick={shareList}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'var(--bg2)', color: 'var(--fg)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  fontSize: '0.8125rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Partager la liste"
              >
                Partager
              </button>
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
                {restocking ? '…' : 'Tout restocker'}
              </button>
            </>
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
        <div ref={categoryStripRef} style={{
          display: 'flex', gap: '0.375rem', overflowX: 'auto',
          paddingBottom: '0.5rem', marginBottom: '0.5rem',
          scrollbarWidth: 'thin', cursor: 'grab',
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
        <div ref={recipeStripRef} style={{
          display: 'flex', gap: '0.375rem', overflowX: 'auto',
          paddingBottom: '0.75rem', marginBottom: '0.25rem',
          scrollbarWidth: 'thin', cursor: 'grab',
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
        <div style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>Liste vide — tout est en stock !</p>
          <p style={{ fontSize: '0.875rem' }}>Cette liste se remplit automatiquement avec les produits épuisés ou en faible quantité dans votre stock, ainsi que les ingrédients manquants de vos recettes.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <p style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '2rem' }}>Aucun résultat.</p>
      ) : (
        Array.from(groupByCategory(filteredItems).entries()).map(([categoryName, groupItems]) => (
          <section key={categoryName} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg2)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: '0.25rem',
            }}>
              {categoryName}
            </h2>
            {groupItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
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

                {item.recipe_quantity != null && item.recipe_quantity > 0 ? (
                  <span style={{
                    background: 'var(--primary)', color: 'var(--primary-fg)',
                    borderRadius: 9999, padding: '0.125rem 0.5rem',
                    fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {item.recipe_quantity % 1 === 0
                      ? item.recipe_quantity
                      : item.recipe_quantity.toFixed(1)} {item.ref_unit}
                  </span>
                ) : (
                  <span style={{
                    background: 'var(--bg2)', color: 'var(--fg2)',
                    borderRadius: 9999, padding: '0.125rem 0.5rem',
                    fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                    border: '1px solid var(--border)',
                  }}>
                    × 1
                  </span>
                )}
              </div>
            ))}
          </section>
        ))
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
