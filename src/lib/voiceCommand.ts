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

/** True if `sub` appears in `text` at a word boundary (space or start/end). */
function atWordBoundary(text: string, sub: string): boolean {
  const idx = text.indexOf(sub)
  if (idx === -1) return false
  const before = idx === 0 || text[idx - 1] === ' '
  const after = idx + sub.length >= text.length || text[idx + sub.length] === ' '
  return before && after
}

/**
 * Find the best-matching stock item for a spoken name.
 * Priority:
 *   1. Exact match              ("jambon" → "jambon")
 *   2. Product contains query   ("jambon" → "jambon blanc")
 *   3. Query contains product   ("jambon blanc" → "jambon")  — longest product wins
 */
export function findStockItem(name: string, items: ApiStockItem[]): ApiStockItem | undefined {
  const q = norm(name)
  if (!q) return undefined

  // 1. Exact
  const exact = items.find(i => norm(i.product_name) === q)
  if (exact) return exact

  // 2. Product name contains the query at a word boundary
  //    ("jambon" matches "jambon blanc" but not "jambonneau")
  const pContainsQ = items.find(i => atWordBoundary(norm(i.product_name), q))
  if (pContainsQ) return pContainsQ

  // 3. Query contains the product name at a word boundary
  //    ("jambon blanc" matches "jambon" — take the longest product for specificity)
  const candidates = items
    .filter(i => { const p = norm(i.product_name); return p.length >= 3 && atWordBoundary(q, p) })
    .sort((a, b) => b.product_name.length - a.product_name.length)
  return candidates[0]
}
