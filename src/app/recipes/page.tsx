'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ApiRecipe } from '@/types'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<ApiRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recipes')
      .then(r => r.json())
      .then(d => { setRecipes(d.recipes); setLoading(false) })
  }, [])

  return (
    <main style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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

      {loading ? (
        <p>Chargement…</p>
      ) : recipes.length === 0 ? (
        <div style={{ color: 'var(--fg2)', textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>Aucune recette pour l&apos;instant.</p>
          <p style={{ fontSize: '0.875rem' }}>Créez vos recettes pour calculer automatiquement les ingrédients nécessaires et les ajouter à votre liste de courses.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recipes.map(recipe => (
            <li key={recipe.id}>
              <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '0.875rem 1rem', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--fg)' }}>{recipe.name}</div>
                  {recipe.description && (
                    <div style={{ color: 'var(--fg2)', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                      {recipe.description.length > 80
                        ? recipe.description.slice(0, 80) + '…'
                        : recipe.description}
                    </div>
                  )}
                  <div style={{ color: 'var(--fg2)', fontSize: '0.75rem' }}>
                    {recipe.base_servings} personne{recipe.base_servings > 1 ? 's' : ''} · {recipe.ingredient_count} ingrédient{recipe.ingredient_count > 1 ? 's' : ''}
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
