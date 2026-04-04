'use client'

import { useEffect, useState } from 'react'
import type { ApiStockItem } from '@/types'

export default function ShoppingPage() {
  const [items, setItems] = useState<ApiStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState<Set<number>>(new Set())
  const [restocking, setRestocking] = useState(false)

  useEffect(() => {
    fetch('/api/shopping')
      .then(r => r.json())
      .then(d => { setItems(d.items); setLoading(false) })
  }, [])

  async function restockAll() {
    if (!confirm(`Marquer les ${items.length} articles comme "en stock" ?`)) return
    setRestocking(true)
    const res = await fetch('/api/shopping/restock', { method: 'POST' })
    if (res.ok) {
      setItems([])
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Liste de courses</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {items.length > 0 && (
            <button
              onClick={restockAll}
              disabled={restocking}
              title="Tout restockér — marquer tous les articles comme en stock"
              style={{
                padding: '0.375rem 0.75rem',
                background: 'var(--primary)',
                color: 'var(--primary-fg)',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.8125rem',
                fontWeight: 600,
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

      {loading ? (
        <p>Chargement…</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '3rem' }}>
          Liste vide — tout est en stock ! 🎉
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(item => (
            <li key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6',
            }}>
              <button
                onClick={() => checkOff(item)}
                disabled={checking.has(item.id)}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  border: '2px solid #d1d5db', background: '#fff',
                  cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Marquer comme acheté"
              >
                {checking.has(item.id) ? '…' : ''}
              </button>

              {item.icon_url && (
                <img src={item.icon_url} alt="" width={28} height={28} style={{ borderRadius: 4 }} />
              )}

              <span style={{ flex: 1, fontWeight: 500 }}>{item.product_name}</span>

              {item.quantity > 0 && (
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {item.quantity} {item.ref_unit}
                </span>
              )}

              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {item.category_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
