'use client'

import type { CSSProperties } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  style?: CSSProperties
}

export default function SearchInput({ value, onChange, placeholder, style }: Props) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <input
        type="text"
        placeholder={placeholder ?? 'Rechercher…'}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '0.5rem 2rem 0.5rem 0.75rem',
          border: '1px solid var(--border)', borderRadius: 8,
          background: 'var(--input-bg)', color: 'var(--fg)',
          fontSize: '0.9375rem', outline: 'none',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Effacer"
          style={{
            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--fg2)', color: 'var(--bg)',
            border: 'none', borderRadius: 9999,
            width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
            lineHeight: 1, padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
