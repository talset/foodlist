'use client'

import { useEffect, useRef, useState } from 'react'

interface IconPickerProps {
  value: string | null
  onChange: (iconRef: string | null) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [tab, setTab] = useState<'default' | 'upload'>('default')
  const [defaultIcons, setDefaultIcons] = useState<string[]>([])
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

    if (file.size > 4 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 4 Mo)')
      return
    }

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

  return (
    <div>
      {/* Preview */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#666' }}>Icône sélectionnée :</span>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          background: '#f7fafc',
          marginLeft: '0.5rem',
          verticalAlign: 'middle',
        }}>
          {value
            ? <img src={`/api/icons/${value}`} width={48} height={48} alt="" style={{ borderRadius: 4 }} />
            : <span style={{ color: '#ccc', fontSize: '1.5rem' }}>?</span>
          }
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#e53e3e', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            Supprimer
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button type="button" onClick={() => setTab('default')} style={{ ...tabStyle, ...(tab === 'default' ? tabActiveStyle : {}) }}>
          Icônes par défaut
        </button>
        <button type="button" onClick={() => setTab('upload')} style={{ ...tabStyle, ...(tab === 'upload' ? tabActiveStyle : {}) }}>
          Uploader
        </button>
      </div>

      {tab === 'default' && (
        <div style={{
          maxHeight: 200,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '0.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          {loadingIcons && <span style={{ color: '#999', fontSize: '0.875rem' }}>Chargement…</span>}
          {defaultIcons.map(filename => (
            <button
              key={filename}
              type="button"
              onClick={() => onChange(filename)}
              title={filename.replace('.png', '')}
              style={{
                padding: 4,
                border: value === filename ? '2px solid #3182ce' : '2px solid transparent',
                borderRadius: 6,
                background: value === filename ? '#ebf8ff' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <img src={`/api/icons/${filename}`} width={40} height={40} alt={filename} />
            </button>
          ))}
          {!loadingIcons && defaultIcons.length === 0 && (
            <span style={{ color: '#999', fontSize: '0.875rem' }}>Aucune icône disponible</span>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
            PNG, JPG ou WebP · max 4 Mo · sera redimensionné à 128×128 px
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            style={{ fontSize: '0.9rem' }}
          />
          {uploading && <span style={{ fontSize: '0.875rem', color: '#666' }}>Upload en cours…</span>}
        </div>
      )}
    </div>
  )
}

const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.4rem 0.5rem',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  background: '#f7fafc',
  cursor: 'pointer',
  fontSize: '0.85rem',
}

const tabActiveStyle: React.CSSProperties = {
  background: '#3182ce',
  color: '#fff',
  border: '1px solid #3182ce',
}
