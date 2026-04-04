'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ApiRecipeDetail, ApiRecipeIngredient } from '@/types'
import { getCompatibleUnits, convertUnit, fmtQty } from '@/lib/units'

interface IngredientRow {
  product_id: number
  product_name: string
  ref_unit: string
  quantity: number       // always in ref_unit (what gets saved)
  display_unit: string   // unit chosen by user in the form
  display_qty: number    // quantity in display_unit
}

function makeRow(productId: number, productName: string, refUnit: string, qtyInRefUnit: number): IngredientRow {
  return { product_id: productId, product_name: productName, ref_unit: refUnit, quantity: qtyInRefUnit, display_unit: refUnit, display_qty: qtyInRefUnit }
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = id === 'new'

  const [recipe, setRecipe] = useState<ApiRecipeDetail | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [editing, setEditing] = useState(isNew)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState('')
  const [servings, setServings] = useState(4)
  const [ingredients, setIngredients] = useState<IngredientRow[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<any[]>([])

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
        setIngredients(data.ingredients.map((i: ApiRecipeIngredient) =>
          makeRow(i.product_id, i.product_name, i.ref_unit, i.quantity)
        ))
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

  function updateIngredient(i: number, patch: Partial<IngredientRow>) {
    setIngredients(prev => prev.map((row, j) => {
      if (j !== i) return row
      const updated = { ...row, ...patch }
      // Recompute quantity in ref_unit whenever display_qty or display_unit changes
      const converted = convertUnit(updated.display_qty, updated.display_unit, updated.ref_unit)
      updated.quantity = converted ?? updated.display_qty
      return updated
    }))
  }

  async function save() {
    setSaving(true)
    const body = {
      name,
      description: description || null,
      steps_markdown: steps || null,
      base_servings: servings,
      ingredients: ingredients.map(ing => ({ product_id: ing.product_id, quantity: ing.quantity })),
    }
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
        <Link href="/recipes" style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>← Recettes</Link>
        {!isNew && !editing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setEditing(true)} style={{ padding: '0.375rem 0.75rem', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: 'var(--bg2)', color: 'var(--fg)' }}>
              Modifier
            </button>
            <button onClick={deleteRecipe} style={{ padding: '0.375rem 0.75rem', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', background: 'var(--bg)', color: '#dc2626' }}>
              Supprimer
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--fg)' }}>Nom *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--fg)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--fg)' }}>Personnes</label>
            <input type="number" value={servings} min={1} onChange={e => setServings(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 80 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--fg)' }}>Étapes (markdown)</label>
            <textarea value={steps} onChange={e => setSteps(e.target.value)} rows={6} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--fg)' }}>Ingrédients</label>
            {ingredients.map((ing, i) => {
              const compatUnits = getCompatibleUnits(ing.ref_unit)
              const hasAltUnits = compatUnits.length > 1
              const converted = ing.display_unit !== ing.ref_unit
                ? convertUnit(ing.display_qty, ing.display_unit, ing.ref_unit)
                : null
              return (
                <div key={ing.product_id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ flex: 1, paddingTop: '0.35rem', color: 'var(--fg)', fontSize: '0.9rem' }}>{ing.product_name}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.125rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={ing.display_qty}
                        min={0.001}
                        step={0.5}
                        onChange={e => updateIngredient(i, { display_qty: parseFloat(e.target.value) || 0 })}
                        style={{ ...inputStyle, width: 70, padding: '0.25rem 0.375rem' }}
                      />
                      {hasAltUnits ? (
                        <select
                          value={ing.display_unit}
                          onChange={e => updateIngredient(i, { display_unit: e.target.value })}
                          style={{ ...inputStyle, width: 56, padding: '0.25rem 0.25rem' }}
                        >
                          {compatUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: 'var(--fg2)', fontSize: '0.875rem', minWidth: 40 }}>{ing.ref_unit}</span>
                      )}
                      <button onClick={() => setIngredients(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.25rem' }}>×</button>
                    </div>
                    {converted !== null && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--fg2)' }}>
                        = {fmtQty(converted)} {ing.ref_unit}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <input
                placeholder="Ajouter un produit…"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={inputStyle}
              />
              {productResults.length > 0 && (
                <ul style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, margin: 0, padding: 0, listStyle: 'none', maxHeight: 200, overflowY: 'auto' }}>
                  {productResults.filter(p => !ingredients.some(i => i.product_id === p.id)).map((p: any) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          setIngredients(prev => [...prev, makeRow(p.id, p.name, p.ref_unit, 1)])
                          setProductSearch('')
                          setProductResults([])
                        }}
                        style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg)' }}
                      >
                        {p.name} <span style={{ color: 'var(--fg2)', fontSize: '0.75rem' }}>{p.ref_unit}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={save} disabled={saving || !name.trim()} style={{ flex: 1, padding: '0.625rem', background: 'var(--primary)', color: 'var(--primary-fg)', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {!isNew && (
              <button onClick={() => setEditing(false)} style={{ padding: '0.625rem 1rem', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: 'var(--bg2)', color: 'var(--fg)' }}>
                Annuler
              </button>
            )}
          </div>
        </div>
      ) : recipe && (
        <>
          <h1 style={{ margin: '0 0 0.25rem', color: 'var(--fg)' }}>{recipe.name}</h1>
          <p style={{ color: 'var(--fg2)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
            {recipe.base_servings} personne{recipe.base_servings > 1 ? 's' : ''}
          </p>
          {recipe.description && <p style={{ marginBottom: '1rem', color: 'var(--fg)' }}>{recipe.description}</p>}

          {recipe.ingredients.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--fg)' }}>Ingrédients</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recipe.ingredients.map(ing => (
                  <li key={ing.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.375rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    {ing.icon_url && <img src={ing.icon_url} alt="" width={24} height={24} style={{ borderRadius: 3 }} />}
                    <span style={{ flex: 1, color: 'var(--fg)' }}>{ing.product_name}</span>
                    <span style={{ color: 'var(--fg2)' }}>{fmtQty(ing.quantity)} {ing.ref_unit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recipe.steps_markdown && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--fg)' }}>Préparation</h2>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, color: 'var(--fg)', lineHeight: 1.6 }}>
                {recipe.steps_markdown}
              </pre>
            </section>
          )}

          <section style={{ background: 'color-mix(in srgb, var(--primary) 8%, var(--bg2))', borderRadius: 8, padding: '1rem', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.75rem', color: 'var(--fg)' }}>Ajouter à la liste de courses</h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--fg)' }}>
                ×
                <input
                  type="number"
                  value={multiplier}
                  min={0.5}
                  step={0.5}
                  max={99}
                  onChange={e => setMultiplier(parseFloat(e.target.value) || 1)}
                  style={{ ...inputStyle, width: 60, padding: '0.375rem' }}
                />
                <span style={{ color: 'var(--fg2)' }}>= {Math.round(recipe.base_servings * multiplier)} pers.</span>
              </label>
              <button onClick={addToShoppingList} disabled={addingToList} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--primary-fg)', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid var(--border)',
  borderRadius: 6,
  boxSizing: 'border-box',
  background: 'var(--input-bg)',
  color: 'var(--fg)',
  outline: 'none',
}
