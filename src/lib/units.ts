/** Conversion factors to base unit within each family */
const VOL_TO_ML: Record<string, number> = { mL: 1, cL: 10, L: 1000 }
const WEIGHT_TO_G: Record<string, number> = { g: 1, kg: 1000 }

/** Units that can be freely converted from a given ref_unit */
export const COMPATIBLE_UNITS: Record<string, string[]> = {
  mL:  ['mL', 'cL', 'L'],
  cL:  ['mL', 'cL', 'L'],
  L:   ['mL', 'cL', 'L'],
  g:   ['g', 'kg'],
  kg:  ['g', 'kg'],
}

export function getCompatibleUnits(refUnit: string): string[] {
  return COMPATIBLE_UNITS[refUnit] ?? [refUnit]
}

/** Convert a quantity from one unit to another. Returns null if incompatible. */
export function convertUnit(quantity: number, from: string, to: string): number | null {
  if (from === to) return quantity

  const fVol = VOL_TO_ML[from], tVol = VOL_TO_ML[to]
  if (fVol !== undefined && tVol !== undefined) return (quantity * fVol) / tVol

  const fW = WEIGHT_TO_G[from], tW = WEIGHT_TO_G[to]
  if (fW !== undefined && tW !== undefined) return (quantity * fW) / tW

  return null
}

/** Format a number without unnecessary trailing zeros (max 4 significant digits) */
export function fmtQty(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const s = n.toPrecision(4)
  return String(parseFloat(s))
}
