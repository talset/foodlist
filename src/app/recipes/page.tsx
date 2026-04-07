'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import type { ApiRecipe, ApiRecipeCategory, RecipeFeasibility } from '@/types'
import { useSSE } from '@/hooks/useSSE'
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll'
import { norm } from '@/lib/search'

function FeasibilityBadge({ f }: { f: RecipeFeasibility }) {
  if (!f) return null
  const config = {
    ok:      { label: 'Réalisable',  bg: '#dcfce7', color: '#166534' },
    partial: { label: 'Presque',     bg: '#ffedd5', color: '#9a3412' },
    missing: { label: 'Incomplet',   bg: '#fee2e2', color: '#991b1b' },
  }[f]
  return (
    <span style={{
      fontSize: '0.6875rem', fontWeight: 600,
      padding: '0.125rem 0.5rem', borderRadius: 9999,
      background: config.bg, color: config.color,
      flexShrink: 0,
    }}>
      {config.label}
    </span>
  )
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<ApiRecipe[]>([])
  const [categories, setCategories] = useState<ApiRecipeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null)
  const [feasibilityFilter, setFeasibilityFilter] = useState<RecipeFeasibility>(null)
  const [favOnly, setFavOnly] = useState(false)
  const [togglingFav, setTogglingFav] = useState<Set<number>>(new Set())
  const categoryStripRef = useHorizontalScroll<HTMLDivElement>()

  const load = useCallback(() => {
    fetch('/api/recipes')
      .then(r => r.json())
      .then(d => { setRecipes(d.recipes ?? []); setLoading(false) })
  }, [])

  useEffect(() => {
    load()
    fetch('/api/recipe-categories').then(r => r.json()).then(setCategories)
  }, [load])
  useSSE(['stock_updated'], load)

  async function toggleFavorite(e: React.MouseEvent, recipe: ApiRecipe) {
    e.preventDefault()
    e.stopPropagation()
    setTogglingFav(prev => new Set(prev).add(recipe.id))
    const method = recipe.is_favorite ? 'DELETE' : 'POST'
    const res = await fetch(`/api/recipes/${recipe.id}/favorite`, { method })
    if (res.ok) {
      setRecipes(prev => prev.map(r =>
        r.id === recipe.id ? { ...r, is_favorite: !r.is_favorite } : r
      ))
    }
    setTogglingFav(prev => { const s = new Set(prev); s.delete(recipe.id); return s })
  }

  const filtered = useMemo(() => {
    const q = norm(search)
    return recipes.filter(r => {
      if (q && !norm(r.name).includes(q) && !norm(r.description ?? '').includes(q)) return false
      if (categoryFilter !== null && r.recipe_category_id !== categoryFilter) return false
      if (feasibilityFilter !== null && (r.feasibility ?? null) !== feasibilityFilter) return false
      if (favOnly && !r.is_favorite) return false
      return true
    })
  }, [recipes, search, categoryFilter, feasibilityFilter, favOnly])

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1
      return a.name.localeCompare(b.name)
    }),
  [filtered])

  const usedCategories = useMemo(() => {
    const ids = new Set(recipes.map(r => r.recipe_category_id).filter(Boolean))
    return categories.filter(c => ids.has(c.id))
  }, [recipes, categories])

  const favCount = useMemo(() => recipes.filter(r => r.is_favorite).length, [recipes])

  return (
    <main style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Recettes</h1>
        <Link href="/recipes/new" style={{
          background: 'var(--primary)', color: 'var(--primary-fg)',
          padding: '0.5rem 1rem', borderRadius: 8,
          textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          + Nouvelle recette
        </Link>
      </div>

      {/* Recherche */}
      <input
        type="search"
        placeholder="Rechercher une recette…"
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

      {/* Filtre faisabilité + favoris */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        {([null, 'ok', 'partial', 'missing'] as const).map(f => (
          <button
            key={String(f)}
            onClick={() => setFeasibilityFilter(f === feasibilityFilter ? null : f)}
            style={chipStyle(feasibilityFilter === f)}
          >
            {f === null ? 'Tous' : f === 'ok' ? '🟢 Réalisable' : f === 'partial' ? '🟠 Presque' : '🔴 Incomplet'}
          </button>
        ))}
        {favCount > 0 && (
          <button
            onClick={() => setFavOnly(prev => !prev)}
            style={chipStyle(favOnly)}
          >
            ★ Favoris
          </button>
        )}
      </div>

      {/* Filtre catégories */}
      {usedCategories.length > 0 && (
        <div ref={categoryStripRef} style={{
          display: 'flex', gap: '0.375rem', overflowX: 'auto',
          paddingBottom: '0.5rem', marginBottom: '0.75rem',
          scrollbarWidth: 'thin', cursor: 'grab',
        }}>
          <button onClick={() => setCategoryFilter(null)} style={chipStyle(categoryFilter === null)}>
            Toutes
          </button>
          {usedCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id === categoryFilter ? null : cat.id)}
              style={chipStyle(categoryFilter === cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p>Chargement…</p>
      ) : recipes.length === 0 ? (
        <div style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>Aucune recette pour l&apos;instant.</p>
          <p style={{ fontSize: '0.875rem' }}>Créez vos recettes pour calculer automatiquement les ingrédients nécessaires et les ajouter à votre liste de courses.</p>
        </div>
      ) : sorted.length === 0 ? (
        <p style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '2rem' }}>Aucun résultat.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sorted.map(recipe => (
            <li key={recipe.id}>
              <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '0.875rem 1rem', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                }}>
                  {recipe.photo_url && (
                    <img src={recipe.photo_url} alt="" width={80} height={80} style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <button
                      onClick={e => toggleFavorite(e, recipe)}
                      disabled={togglingFav.has(recipe.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 0, fontSize: '1.125rem', lineHeight: 1, flexShrink: 0,
                        color: recipe.is_favorite ? '#f59e0b' : 'var(--border)',
                        opacity: togglingFav.has(recipe.id) ? 0.5 : 1,
                      }}
                      title={recipe.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {recipe.is_favorite ? '★' : '☆'}
                    </button>
                    <span style={{ fontWeight: 600, color: 'var(--fg)', flex: 1 }}>{recipe.name}</span>
                    {recipe.recipe_category_name && (
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 500,
                        padding: '0.125rem 0.5rem', borderRadius: 9999,
                        background: 'var(--bg2)', color: 'var(--fg2)',
                        border: '1px solid var(--border)', flexShrink: 0,
                      }}>
                        {recipe.recipe_category_name}
                      </span>
                    )}
                  </div>
                  {recipe.description && (
                    <div style={{ color: 'var(--fg2)', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                      {recipe.description.length > 80
                        ? recipe.description.slice(0, 80) + '…'
                        : recipe.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--fg2)', fontSize: '0.75rem' }}>
                      {recipe.base_servings} personne{recipe.base_servings > 1 ? 's' : ''} · {recipe.ingredient_count} ingrédient{recipe.ingredient_count > 1 ? 's' : ''}
                    </span>
                    <FeasibilityBadge f={recipe.feasibility ?? null} />
                  </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '0.25rem 0.75rem',
    borderRadius: 9999,
    border: '1px solid var(--border)',
    flexShrink: 0,
    background: active ? 'var(--primary)' : 'var(--bg2)',
    color: active ? 'var(--primary-fg)' : 'var(--fg2)',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  }
}
