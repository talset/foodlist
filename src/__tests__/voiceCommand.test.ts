import { findStockItem } from '@/lib/voiceCommand'
import type { ApiStockItem } from '@/types'

function mk(id: number, product_name: string): ApiStockItem {
  return { id, product_name, status: 'in_stock' } as ApiStockItem
}

describe('findStockItem', () => {
  const stock = [
    mk(1, 'Beurre de cacahuète'),
    mk(2, 'Cacahuètes'),
    mk(3, 'Jambon'),
    mk(4, 'Jambon blanc'),
  ]

  test('singular "cacahuète" matches "Cacahuètes", not "Beurre de cacahuète"', () => {
    const item = findStockItem('cacahuète', stock)
    expect(item?.product_name).toBe('Cacahuètes')
  })

  test('plural "cacahuètes" matches "Cacahuètes"', () => {
    const item = findStockItem('cacahuètes', stock)
    expect(item?.product_name).toBe('Cacahuètes')
  })

  test('"beurre de cacahuète" still matches "Beurre de cacahuète"', () => {
    const item = findStockItem('beurre de cacahuète', stock)
    expect(item?.product_name).toBe('Beurre de cacahuète')
  })

  test('exact match wins ("jambon" → "Jambon")', () => {
    const item = findStockItem('jambon', stock)
    expect(item?.product_name).toBe('Jambon')
  })
})
