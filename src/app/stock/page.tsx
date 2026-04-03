'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ApiStockItem } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  in_stock: 'En stock',
  low: 'Peu',
  out_of_stock: 'Épuisé',
  shopping_list: 'Courses',
}

const STATUS_COLORS: Record<string, string> = {
  in_stock: '#16a34a',
  low: '#d97706',
  out_of_stock: '#dc2626',
  shopping_list: '#2563eb',
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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQty, setEditQty] = useState(0)

  const load = useCallback(async () => {
    const url = statusFilter ? `/api/stock?status=${statusFilter}` : '/api/stock'
    const res = await fetch(url)
    if (res.ok) setItems((await res.json()).items)
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])

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
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: editQty } : i))
    }
    setEditingId(null)
  }

  async function deleteItem(id: number) {
    const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
  }

  const groups = groupByCategory(items)

  return (
    <main style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Mon stock</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[null, 'in_stock', 'low', 'out_of_stock', 'shopping_list'].map(s => (
          <button
            key={String(s)}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: 9999,
              border: '1px solid #d1d5db',
              background: statusFilter === s ? '#1f2937' : '#fff',
              color: statusFilter === s ? '#fff' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {s ? STATUS_LABELS[s] : 'Tous'}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Aucun article dans le stock.</p>
      ) : (
        Array.from(groups.entries()).map(([categoryName, group]) => (
          <section key={categoryName} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {categoryName}
            </h2>
            {group.items.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6',
              }}>
                {item.icon_url && (
                  <img src={item.icon_url} alt="" width={32} height={32} style={{ borderRadius: 4 }} />
                )}
                <span style={{ flex: 1, fontWeight: 500 }}>{item.product_name}</span>

                {editingId === item.id ? (
                  <input
                    type="number"
                    value={editQty}
                    min={0}
                    onChange={e => setEditQty(parseInt(e.target.value) || 0)}
                    onBlur={() => saveQty(item.id)}
                    onKeyDown={e => e.key === 'Enter' && saveQty(item.id)}
                    autoFocus
                    style={{ width: 60, padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                ) : (
                  <button
                    onClick={() => { setEditingId(item.id); setEditQty(item.quantity) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}
                  >
                    {item.quantity} {item.unit}
                  </button>
                )}

                <span style={{
                  fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: 9999,
                  background: STATUS_COLORS[item.status] + '22',
                  color: STATUS_COLORS[item.status],
                  fontWeight: 600,
                }}>
                  {STATUS_LABELS[item.status]}
                </span>

                <select
                  value={item.status}
                  onChange={e => updateStatus(item.id, e.target.value)}
                  style={{ fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: 4, padding: '0.125rem' }}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>

                <button
                  onClick={() => deleteItem(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem' }}
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
