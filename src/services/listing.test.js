import { describe, expect, it } from 'vitest'
import {
  categoryHasDamage,
  defaultSort,
  getCategories,
  getSortOptions,
  getStats,
  listItems,
  searchItems,
  sortItems,
} from './dataService.js'

const ids = (list) => list.map((item) => item.id)

describe('sortItems: rarity (RF11)', () => {
  const list = [
    { id: 1, name: 'B', rarity: 2 },
    { id: 2, name: 'A', rarity: 2 },
    { id: 3, name: 'C', rarity: 5 },
    { id: 4, name: 'D', rarity: 'quest' },
    { id: 5, name: 'E', rarity: null },
    { id: 6, name: 'F', rarity: -12 },
    { id: 7, name: 'G', rarity: -1 },
    { id: 8, name: 'H', rarity: 0 },
  ]

  it('orders high to low, breaking ties by name', () => {
    expect(ids(sortItems(list, 'rarity-desc')).slice(0, 5)).toEqual([3, 2, 1, 8, 7])
  })

  it('orders low to high, breaking ties by name', () => {
    expect(ids(sortItems(list, 'rarity-asc')).slice(0, 5)).toEqual([7, 8, 2, 1, 3])
  })

  it('puts Quest, Rainbow and items without rarity last in BOTH directions', () => {
    for (const sort of ['rarity-desc', 'rarity-asc']) {
      expect(ids(sortItems(list, sort)).slice(5)).toEqual([4, 5, 6])
    }
  })
})

describe('sortItems: damage (RF12), name and relevance', () => {
  const list = [
    { id: 1, name: 'B', damage: 10 },
    { id: 2, name: 'A', damage: 10 },
    { id: 3, name: 'C', damage: 50 },
    { id: 4, name: 'D' },
    { id: 5, name: 'E', damage: 0 },
  ]

  it('orders by damage and keeps items without damage last in both directions', () => {
    expect(ids(sortItems(list, 'damage-desc'))).toEqual([3, 2, 1, 5, 4])
    expect(ids(sortItems(list, 'damage-asc'))).toEqual([5, 2, 1, 3, 4])
  })

  it('orders by name with unnamed items last', () => {
    const named = [{ id: 1, name: 'b' }, { id: 2, name: null }, { id: 3, name: 'A' }]
    expect(ids(sortItems(named, 'name'))).toEqual([3, 1, 2])
  })

  it('keeps the given order for "relevance" and never mutates its input', () => {
    const before = ids(list)
    expect(ids(sortItems(list, 'relevance'))).toEqual(before)
    sortItems(list, 'damage-desc')
    expect(ids(list)).toEqual(before)
  })

  it('falls back to name order for an unknown sort', () => {
    expect(ids(sortItems(list, 'nope'))).toEqual(ids(sortItems(list, 'name')))
  })
})

describe('listItems (RF05, RF06)', () => {
  const total = getStats().items + getStats().orphanItems

  it('lists every item, A-Z, when there is no filter', () => {
    const list = listItems()
    expect(list).toHaveLength(total)
    expect(list.find((item) => item.name)?.name.localeCompare(list.at(-2).name)).toBeLessThanOrEqual(0)
  })

  it('filters by category and by text, and combines both', () => {
    const weapons = listItems({ category: 'weapon' })
    expect(weapons.length).toBeGreaterThan(0)
    expect(weapons.every((item) => item.category === 'weapon')).toBe(true)
    expect(listItems({ query: 'iron pickaxe' })[0].id).toBe(1)
    const ironTools = listItems({ query: 'iron', category: 'tool' })
    expect(ironTools.length).toBeGreaterThan(0)
    expect(ironTools.every((item) => item.category === 'tool' && /iron/i.test(item.name))).toBe(true)
  })

  it('ranks by relevance when searching and A-Z otherwise', () => {
    expect(ids(listItems({ query: 'iron' }))).toEqual(ids(searchItems('iron', { limit: Infinity })))
    expect(defaultSort(true)).toBe('relevance')
    expect(defaultSort(false)).toBe('name')
  })

  it('puts items without category in "other" and returns [] for unknown categories', () => {
    expect(listItems({ category: 'other' }).length).toBeGreaterThan(0)
    expect(listItems({ category: 'no-such-category' })).toEqual([])
  })

  it('sorts the whole catalog by rarity with special rarities at the end', () => {
    const list = listItems({ sort: 'rarity-desc' })
    const special = (item) => item.rarity == null || item.rarity === 'quest' || item.rarity === -12 || item.rarity === -13
    const firstSpecial = list.findIndex(special)
    expect(firstSpecial).toBeGreaterThan(0)
    expect(list.slice(firstSpecial).every(special)).toBe(true)
    const normal = list.slice(0, firstSpecial)
    expect(normal.every((item, i) => i === 0 || normal[i - 1].rarity >= item.rarity)).toBe(true)
  })
})

describe('getSortOptions (RF12: damage only where it applies)', () => {
  it('offers name and rarity everywhere, and "relevance" only when searching', () => {
    expect(getSortOptions()).toEqual(['name', 'rarity-desc', 'rarity-asc'])
    expect(getSortOptions({ hasQuery: true })[0]).toBe('relevance')
  })

  it('adds damage sorts only for categories that have items with damage', () => {
    expect(categoryHasDamage('weapon')).toBe(true)
    expect(getSortOptions({ category: 'weapon' })).toContain('damage-desc')
    const noDamage = getCategories().find((category) => !categoryHasDamage(category.slug))
    expect(noDamage).toBeDefined()
    expect(getSortOptions({ category: noDamage.slug })).not.toContain('damage-desc')
    expect(getSortOptions({ category: 'no-such-category' })).not.toContain('damage-asc')
  })
})
