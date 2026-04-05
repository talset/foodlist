'use client'

import { useState, useEffect, useCallback } from 'react'

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number
  onChange: (v: number) => void
  fallback?: number
  integer?: boolean
}

export default function NumberInput({ value, onChange, fallback = 0, integer, onBlur, ...rest }: NumberInputProps) {
  const [raw, setRaw] = useState(String(value))

  useEffect(() => { setRaw(String(value)) }, [value])

  const commit = useCallback((e?: React.FocusEvent<HTMLInputElement>) => {
    const parsed = integer ? parseInt(raw) : parseFloat(raw)
    const final = isNaN(parsed) ? fallback : parsed
    onChange(final)
    setRaw(String(final))
    onBlur?.(e as any)
  }, [raw, integer, fallback, onChange, onBlur])

  return (
    <input
      {...rest}
      type="number"
      value={raw}
      onChange={e => setRaw(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); rest.onKeyDown?.(e) }}
    />
  )
}
