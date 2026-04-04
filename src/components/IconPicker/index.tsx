'use client'

import { useEffect, useRef, useState } from 'react'

interface IconPickerProps {
  value: string | null
  onChange: (iconRef: string | null) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [tab, setTab] = useState<'default' | 'upload'>('default')
  const [defaultIcons, setDefaultIcons] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loadingIcons, setLoadingIcons] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tab === 'default' && defaultIcons.length === 0) {
      setLoadingIcons(true)
      fetch('/api/icons')
        .then(r => r.json())
        .then(data => setDefaultIcons(data.icons ?? []))
        .finally(() => setLoadingIcons(false))
    }
  }, [tab, defaultIcons.length])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) { alert('Fichier trop volumineux (max 4 Mo)'); return }
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/icons/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const data = await res.json()
      onChange(data.icon_ref)
      setTab('default')
    } else {
      alert('Erreur lors de l\'upload')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const filteredIcons = search.trim()
    ? defaultIcons.filter(f => f.toLowerCase().includes(search.trim().toLowerCase()))
    : defaultIcons

  return (
    <div>
      {/* Preview */}
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 8,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          {value
            ? <img src={`/api/icons/${value}`} width={44} height={44} alt="" />
            : <span style={{ color: 'var(--fg2)', fontSize: '1.5rem' }}>?</span>
          }
        </div>
        <div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--fg2)' }}>
            {value ? value.replace(/\.[^.]+$/, '') : 'Aucune icône sélectionnée'}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{ fontSize: '0.75rem', color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}
            >
              Retirer
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.625rem' }}>
        {(['default', 'upload'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '0.375rem 0.5rem',
              border: tab === t ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: 6,
              background: tab === t ? 'var(--primary)' : 'var(--bg2)',
              color: tab === t ? 'var(--primary-fg)' : 'var(--fg2)',
              cursor: 'pointer', fontSize: '0.8125rem', fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'default' ? 'Icônes du thème' : 'Uploader'}
          </button>
        ))}
      </div>

      {tab === 'default' && (
        <>
          {/* Search */}
          <input
            type="search"
            placeholder="Rechercher une icône…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.375rem 0.625rem', marginBottom: '0.5rem',
              border: '1px solid var(--border)', borderRadius: 6,
              background: 'var(--input-bg)', color: 'var(--fg)',
              fontSize: '0.875rem', outline: 'none',
            }}
          />
          <div style={{
            maxHeight: 200, overflowY: 'auto',
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem',
            background: 'var(--bg2)',
          }}>
            {loadingIcons && <span style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>Chargement…</span>}
            {filteredIcons.map(filename => (
              <button
                key={filename}
                type="button"
                onClick={() => onChange(filename)}
                title={filename.replace(/\.[^.]+$/, '')}
                style={{
                  padding: 3,
                  border: value === filename ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: 6,
                  background: value === filename ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <img src={`/api/icons/${filename}`} width={36} height={36} alt={filename} />
              </button>
            ))}
            {!loadingIcons && filteredIcons.length === 0 && (
              <span style={{ color: 'var(--fg2)', fontSize: '0.875rem' }}>
                {search ? 'Aucune icône correspondante' : 'Aucune icône disponible'}
              </span>
            )}
          </div>
          {search && (
            <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginTop: '0.25rem' }}>
              {filteredIcons.length} résultat{filteredIcons.length !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}

      {tab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', margin: 0 }}>
            PNG, JPG ou WebP · max 4 Mo · sera redimensionné à 128×128 px avec fond transparent
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            style={{ fontSize: '0.875rem', color: 'var(--fg)' }}
          />
          {uploading && <span style={{ fontSize: '0.875rem', color: 'var(--fg2)' }}>Upload en cours…</span>}
        </div>
      )}
    </div>
  )
}
