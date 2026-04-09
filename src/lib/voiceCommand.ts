import { norm } from './search'
import type { ApiStockItem } from '@/types'

/**
 * Extract item names from a French voice command.
 * Supports: ajoute/ajouter, il manque, il faut, j'ai besoin, rajoute, mets, on manque de…
 * Also supports bare names: "sel", "sel, lait", "sel et lait"
 * Returns an array of cleaned item names (empty array = nothing recognised).
 */
export function parseVoiceCommand(transcript: string): string[] {
  // Normalise apostrophes and lowercase
  const t = transcript.toLowerCase().replace(/['\u2019]/g, "'").trim()

  // Strip common trailing filler: "dans ma liste", "sur la liste", "à la liste de courses"…
  const clean = t.replace(/\s+(?:dans|sur|à|a)\s+.+$/, '').trim()

  const patterns: RegExp[] = [
    /^(?:ajoute[rz]?|rajoute[rz]?|achète[rz]?|achete[rz]?)\s+(.+)/,
    /^(?:mets?|mettre)\s+(.+)/,
    /^il\s+(?:manque|faut)\s+(.+)/,
    /^(?:manque|faut)\s+(.+)/,
    /^j'ai\s+(?:besoin\s+(?:de\s+|d')?|plus\s+(?:de\s+|d')?)(.+)/,
    /^on\s+(?:manque\s+de\s+|a\s+plus\s+(?:de\s+|d')|n'a\s+plus\s+(?:de\s+|d')|a\s+besoin\s+de\s+)(.+)/,
  ]

  let raw = clean
  for (const p of patterns) {
    const m = clean.match(p)
    if (m) { raw = m[1].trim(); break }
  }

  // Split on "," or " et " then strip articles from each part
  return raw
    .split(/\s*,\s*|\s+et\s+/)
    .map(part => stripArticles(part))
    .filter(part => part.length > 0)
}

/** Strip leading French articles/partitives from an item phrase */
function stripArticles(text: string): string {
  // Longest prefixes first to avoid partial matches
  const prefixes: RegExp[] = [
    /^un peu de\s+/,
    /^un peu d'/,
    /^de la\s+/,
    /^de l'/,
    /^du\s+/,
    /^des\s+/,
    /^de\s+/,
    /^d'/,
    /^une?\s+/,
    /^les\s+/,
    /^la\s+/,
    /^l'/,
    /^le\s+/,
  ]
  for (const p of prefixes) {
    const r = text.replace(p, '')
    if (r !== text) return r.trim()
  }
  return text.trim()
}

/**
 * Find the best-matching stock item for a spoken name.
 * Priority: exact → item name contains query → query contains item name.
 */
export function findStockItem(name: string, items: ApiStockItem[]): ApiStockItem | undefined {
  const q = norm(name)
  if (!q) return undefined
  return (
    items.find(i => norm(i.product_name) === q) ||
    items.find(i => norm(i.product_name).includes(q))
  )
}
