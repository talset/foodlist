'use client'

interface Props {
  src: string | null
  size?: number
}

export default function ProductIcon({ src, size = 32 }: Props) {
  if (!src) return <div style={{ width: size, height: size, flexShrink: 0 }} />
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ borderRadius: 4, flexShrink: 0 }}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}
