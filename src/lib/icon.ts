const ICONS_BASE = '/api/icons'

export function iconUrl(ref: string | null, iconTheme: string = 'default'): string | null {
  if (!ref) return null
  if (iconTheme && iconTheme !== 'default') {
    return `${ICONS_BASE}/${ref}?theme=${encodeURIComponent(iconTheme)}`
  }
  return `${ICONS_BASE}/${ref}`
}
