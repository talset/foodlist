'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ApiRecipeDetail, ApiRecipeIngredient } from '@/types'

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = id === 'new'

  const [recipe, setRecipe] = useState<ApiRecipeDetail | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [editing, setEditing] = useState(isNew)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState('')
  const [servings, setServings] = useState(4)
  const [ingredients, setIngredients] = useState<{ product_id: number; product_name: string; ref_unit: string; quantity: number }[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<any[]>([])

  // Shopping state
  const [multiplier, setMultiplier] = useState(1)
  const [addingToList, setAddingToList] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState('')

  useEffect(() => {
    if (isNew) return
    fetch(`/api/recipes/${id}`)
      .then(r => r.json())
      .then(data => {
        setRecipe(data)
        setName(data.name)
        setDescription(data.description ?? '')
        setSteps(data.steps_markdown ?? '')
        setServings(data.base_servings)
        setIngredients(data.ingredients.map((i: ApiRecipeIngredient) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          ref_unit: i.ref_unit,
          quantity: i.quantity,
        })))
        setLoading(false)
      })
  }, [id, isNew])

  useEffect(() => {
    if (!productSearch.trim()) { setProductResults([]); return }
    const t = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(productSearch)}&limit=8`)
        .then(r => r.json())
        .then(d => setProductResults(d.products ?? []))
    }, 250)
    return () => clearTimeout(t)
  }, [productSearch])

  async function save() {
    setSaving(true)
    const body = { name, description: description || null, steps_markdown: steps || null, base_servings: servings, ingredients }
    const res = isNew
      ? await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch(`/api/recipes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      const data = await res.json()
      if (isNew) { router.push(`/recipes/${data.id}`); return }
      setRecipe(data)
      setEditing(false)
    }
    setSaving(false)
  }

  async function deleteRecipe() {
    if (!confirm('Supprimer cette recette ?')) return
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
    router.push('/recipes')
  }

  async function addToShoppingList() {
    setAddingToList(true)
    setAddedFeedback('')
    const res = await fetch('/api/shopping/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: Number(id), multiplier }),
    })
    if (res.ok) {
      const data = await res.json()
      setAddedFeedback(`✅ ${data.ingredients_added} ingrédient${data.ingredients_added > 1 ? 's' : ''} ajouté${data.ingredients_added > 1 ? 's' : ''} à la liste`)
    }
    setAddingToList(false)
  }

  if (loading) return <main style={{ padding: '1rem' }}><p>Chargement…</p></main>

  return (
    <main style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link href="/recipes" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Recettes</Link>
        {!isNew && !editing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setEditing(true)} style={{ padding: '0.375rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>
              Modifier
            </button>
            <button onClick={deleteRecipe} style={{ padding: '0.375rem 0.75rem', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', background: '#fff', color: '#dc2626' }}>
              Supprimer
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Nom *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Personnes</label>
            <input type="number" value={servings} min={1} onChange={e => setServings(parseInt(e.target.value) || 1)} style={{ width: 80, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Étapes (markdown)</label>
            <textarea value={steps} onChange={e => setSteps(e.target.value)} rows={6} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontFamily: 'monospace', fontSize: '0.875rem', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Ingrédients</label>
            {ingredients.map((ing, i) => (
              <div key={ing.product_id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                <span style={{ flex: 1 }}>{ing.product_name}</span>
                <input
                  type="number"
                  value={ing.quantity}
                  min={0.001}
                  step={0.5}
                  onChange={e => setIngredients(prev => prev.map((x, j) => j === i ? { ...x, quantity: parseFloat(e.target.value) || 0 } : x))}
                  style={{ width: 70, padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                />
                <span style={{ color: '#6b7280', fontSize: '0.875rem', minWidth: 40 }}>{ing.ref_unit}</span>
                <button onClick={() => setIngredients(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>×</button>
              </div>
            ))}
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <input
                placeholder="Ajouter un produit…"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, boxSizing: 'border-box' }}
              />
              {productResults.length > 0 && (
                <ul style={{ position: 'absolute', zIndex: 10, width: '100%', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, margin: 0, padding: 0, listStyle: 'none', maxHeight: 200, overflowY: 'auto' }}>
                  {productResults.filter(p => !ingredients.some(i => i.product_id === p.id)).map((p: any) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          setIngredients(prev => [...prev, { product_id: p.id, product_name: p.name, ref_unit: p.ref_unit, quantity: 1 }])
                          setProductSearch('')
                          setProductResults([])
                        }}
                        style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {p.name} <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.ref_unit}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={save} disabled={saving || !name.trim()} style={{ flex: 1, padding: '0.625rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {!isNew && (
              <button onClick={() => setEditing(false)} style={{ padding: '0.625rem 1rem', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>
                Annuler
              </button>
            )}
          </div>
        </div>
      ) : recipe && (
        <>
          <h1 style={{ margin: '0 0 0.25rem' }}>{recipe.name}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 1rem' }}>
            {recipe.base_servings} personne{recipe.base_servings > 1 ? 's' : ''}
          </p>
          {recipe.description && <p style={{ marginBottom: '1rem' }}>{recipe.description}</p>}

          {recipe.ingredients.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ingrédients</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recipe.ingredients.map(ing => (
                  <li key={ing.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.375rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    {ing.icon_url && <img src={ing.icon_url} alt="" width={24} height={24} style={{ borderRadius: 3 }} />}
                    <span style={{ flex: 1 }}>{ing.product_name}</span>
                    <span style={{ color: '#6b7280' }}>{ing.quantity} {ing.ref_unit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recipe.steps_markdown && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Préparation</h2>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, color: '#374151', lineHeight: 1.6 }}>
                {recipe.steps_markdown}
              </pre>
            </section>
          )}

          <section style={{ background: '#f0f9ff', borderRadius: 8, padding: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.75rem' }}>Ajouter à la liste de courses</h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                ×
                <input
                  type="number"
                  value={multiplier}
                  min={0.5}
                  step={0.5}
                  max={99}
                  onChange={e => setMultiplier(parseFloat(e.target.value) || 1)}
                  style={{ width: 60, padding: '0.375rem', border: '1px solid #bae6fd', borderRadius: 6 }}
                />
                <span style={{ color: '#6b7280' }}>= {Math.round(recipe.base_servings * multiplier)} pers.</span>
              </label>
              <button onClick={addToShoppingList} disabled={addingToList} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                {addingToList ? '…' : '+ Ajouter'}
              </button>
            </div>
            {addedFeedback && <p style={{ margin: '0.5rem 0 0', color: '#16a34a', fontSize: '0.875rem' }}>{addedFeedback}</p>}
          </section>
        </>
      )}
    </main>
  )
}
