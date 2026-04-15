/** Strip accents, ligatures, and lowercase for accent-insensitive search */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Turn a product name into a default icon filename: "Crème fraîche" → "creme-fraiche.png" */
export function defaultIconRef(name: string): string {
  return norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png'
}
