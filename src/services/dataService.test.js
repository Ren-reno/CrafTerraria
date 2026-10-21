import { describe, expect, it } from 'vitest'
import items from '../data/items.json'
import recipes from '../data/recipes.json'
import ingredientCategories from '../data/ingredient_categories.json'
import {
  categoryLabel,
  categorySlug,
  getCategories,
  getItemById,
  getItemImageUrl,
  getItemName,
  getItemsByCategory,
  getRecipeIngredients,
  getRecipesByItem,
  getStats,
  getUsedIn,
  hasRecipe,
  resolveIngredient,
  searchItems,
} from './dataService.js'

const itemIds = new Set(items.map((item) => item.id))
const resultIds = new Set(recipes.map((recipe) => recipe.resultItemId))
const orphanRecipe = recipes.find((recipe) => !itemIds.has(recipe.resultItemId))
const itemWithoutRecipe = items.find((item) => !resultIds.has(item.id))

describe('data contract (the copied JSON files are consistent)', () => {
  it('every recipe result can be resolved to an item', () => {
    const unresolved = recipes.filter((recipe) => !getItemById(recipe.resultItemId))
    expect(unresolved).toEqual([])
  })

  it('every ingredient item id exists in items.json', () => {
    const missing = recipes.flatMap((recipe) =>
      recipe.ingredients.filter((ing) => ing.itemId != null && !itemIds.has(ing.itemId)),
    )
    expect(missing).toEqual([])
  })

  it('every categoryHint has an entry in ingredient_categories.json', () => {
    const hints = new Set(
      recipes.flatMap((recipe) => recipe.ingredients.map((ing) => ing.categoryHint).filter(Boolean)),
    )
    const missing = [...hints].filter((hint) => !(hint in ingredientCategories))
    expect(missing).toEqual([])
  })

  it('recipe ids are unique', () => {
    expect(new Set(recipes.map((recipe) => recipe.id)).size).toBe(recipes.length)
  })

  it('category slugs are unique and "other" is only used for items without category', () => {
    const slugToCategory = new Map()
    for (const item of items) {
      const slug = categorySlug(item.category)
      if (slugToCategory.has(slug)) expect(slugToCategory.get(slug)).toBe(item.category)
      slugToCategory.set(slug, item.category)
    }
    expect(slugToCategory.get('other')).toBeNull()
  })
})

describe('getItemById / getItemName', () => {
  it('finds an item by number or by numeric string (route params are strings)', () => {
    expect(getItemById(1).name).toBe('Iron Pickaxe')
    expect(getItemById('1').name).toBe('Iron Pickaxe')
    expect(getItemName(1)).toBe('Iron Pickaxe')
  })

  it('returns null for unknown or malformed ids', () => {
    for (const bad of [999999999, '999999999', 'abc', '', null, undefined, 1.5, NaN]) {
      expect(getItemById(bad)).toBeNull()
    }
  })

  it('does not let loosely numeric values resolve to a real item', () => {
    // Number() would turn all of these into 1, so "/item/1e0" or "/item/ 1" would
    // silently show item 1 under a non-canonical URL.
    for (const loose of ['01', ' 1', '1 ', '1e0', '0x1', '+1', '1.0', true, [1], { valueOf: () => 1 }]) {
      expect(getItemById(loose)).toBeNull()
    }
    expect(getItemName('abc')).toBeNull()
  })

  it.skipIf(!orphanRecipe)('builds a minimal item for orphan recipe results', () => {
    const item = getItemById(orphanRecipe.resultItemId)
    expect(item.isOrphan).toBe(true)
    expect(item.name).toBe(orphanRecipe.resultName)
    expect(item.category).toBeNull()
    expect(getRecipesByItem(item.id).length).toBeGreaterThan(0)
  })
})

describe('getItemImageUrl', () => {
  it('returns the wiki URL stored in the data', () => {
    expect(getItemImageUrl(getItemById(1))).toMatch(/^https:\/\/terraria\.wiki\.gg\/images\//)
  })

  it('returns null when there is no item or no image', () => {
    expect(getItemImageUrl(null)).toBeNull()
    expect(getItemImageUrl({ id: 1, name: 'x', imageUrl: null })).toBeNull()
  })
})

describe('recipes', () => {
  it('returns the recipes that produce an item', () => {
    const list = getRecipesByItem(1)
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((recipe) => recipe.resultItemId === 1)).toBe(true)
  })

  it('returns an empty array for items nobody crafts (RF08)', () => {
    expect(itemWithoutRecipe).toBeDefined()
    expect(getRecipesByItem(itemWithoutRecipe.id)).toEqual([])
    expect(hasRecipe(itemWithoutRecipe.id)).toBe(false)
    expect(hasRecipe(1)).toBe(true)
    expect(getRecipesByItem('abc')).toEqual([])
  })

  it('resolves plain ingredients to items', () => {
    const plain = recipes
      .flatMap((recipe) => recipe.ingredients)
      .find((ing) => ing.itemId != null)
    const resolved = resolveIngredient(plain)
    expect(resolved.item.id).toBe(plain.itemId)
    expect(resolved.categoryHint).toBeNull()
    expect(resolved.alternatives).toEqual([])
    expect(resolved.quantity).toBe(plain.quantity)
  })

  it('resolves group ingredients ("Any X") to their member items', () => {
    const group = recipes
      .flatMap((recipe) => recipe.ingredients)
      .find((ing) => ing.categoryHint === 'Any Iron Bar')
    const resolved = resolveIngredient(group)
    expect(resolved.item).toBeNull()
    expect(resolved.categoryHint).toBe('Any Iron Bar')
    expect(resolved.alternatives.map((item) => item.id)).toEqual(ingredientCategories['Any Iron Bar'])
  })

  it('keeps groups without known members as a name with no alternatives', () => {
    const emptyGroup = Object.keys(ingredientCategories).find((name) => ingredientCategories[name].length === 0)
    if (!emptyGroup) return
    const resolved = resolveIngredient({ itemId: null, quantity: 1, categoryHint: emptyGroup })
    expect(resolved.alternatives).toEqual([])
    expect(resolved.categoryHint).toBe(emptyGroup)
  })

  it('resolves every ingredient of every recipe without throwing', () => {
    for (const recipe of recipes) {
      for (const ing of getRecipeIngredients(recipe)) {
        expect(ing.item !== null || ing.categoryHint !== null).toBe(true)
      }
    }
  })
})

describe('getUsedIn (RF10)', () => {
  it('lists the recipes where an item is a direct ingredient', () => {
    const direct = getUsedIn(22).filter((entry) => entry.viaGroup === null)
    expect(direct.length).toBeGreaterThan(0)
    expect(direct.every((entry) => entry.recipe.ingredients.some((ing) => ing.itemId === 22))).toBe(true)
  })

  it('also lists recipes that accept the item through a group, and says which group', () => {
    const viaGroup = getUsedIn(22).filter((entry) => entry.viaGroup === 'Any Iron Bar')
    expect(viaGroup.length).toBeGreaterThan(0)
    expect(ingredientCategories['Any Iron Bar']).toContain(22)
    expect(
      viaGroup.every((entry) => entry.recipe.ingredients.some((ing) => ing.categoryHint === 'Any Iron Bar')),
    ).toBe(true)
  })

  it('never repeats a recipe for the same item', () => {
    const ids = getUsedIn(22).map((entry) => entry.recipe.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('returns [] for items that are not ingredients and for bad ids', () => {
    expect(getUsedIn('abc')).toEqual([])
    expect(getUsedIn(999999999)).toEqual([])
  })
})

describe('searchItems (RF01)', () => {
  it('finds items case-insensitively, best match first', () => {
    expect(searchItems('iron pickaxe')[0].id).toBe(1)
    expect(searchItems('IRON PICKAXE')[0].id).toBe(1)
    expect(searchItems('  iron pickaxe  ')[0].id).toBe(1)
  })

  it('returns nothing for empty, blank or missing queries', () => {
    expect(searchItems('')).toEqual([])
    expect(searchItems('   ')).toEqual([])
    expect(searchItems(null)).toEqual([])
    expect(searchItems(undefined)).toEqual([])
    expect(searchItems('zzzzzzzzzz-no-such-item')).toEqual([])
  })

  it('respects the limit', () => {
    expect(searchItems('a', { limit: 5 })).toHaveLength(5)
    expect(searchItems('a').length).toBeLessThanOrEqual(50)
  })

  it('orders results by match quality: exact, then prefix, then the rest', () => {
    const results = searchItems('iron', { limit: 500 })
    const rank = (name) => {
      const n = name.toLowerCase()
      if (n === 'iron') return 0
      if (n.startsWith('iron')) return 1
      return 2
    }
    const ranks = results.map((item) => rank(item.name))
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
    expect(ranks[0]).toBeLessThanOrEqual(1)
  })

  it.skipIf(!orphanRecipe)('also finds orphan items by name', () => {
    expect(searchItems(orphanRecipe.resultName).map((item) => item.id)).toContain(orphanRecipe.resultItemId)
  })
})

describe('categories (RF05, RF06)', () => {
  it('formats slugs and labels; items without category are "Other"', () => {
    expect(categorySlug('crafting material')).toBe('crafting-material')
    expect(categoryLabel('crafting material')).toBe('Crafting Material')
    expect(categorySlug(null)).toBe('other')
    expect(categoryLabel(null)).toBe('Other')
  })

  it('counts every item exactly once and puts "Other" last', () => {
    const categories = getCategories()
    const total = categories.reduce((sum, category) => sum + category.count, 0)
    expect(total).toBe(getStats().items + getStats().orphanItems)
    expect(categories.at(-1).slug).toBe('other')
    expect(new Set(categories.map((category) => category.slug)).size).toBe(categories.length)
  })

  it('lists the items of a category, sorted by name', () => {
    const [first] = getCategories()
    const list = getItemsByCategory(first.slug)
    expect(list).toHaveLength(first.count)
    const names = list.map((item) => item.name ?? '')
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
    expect(getItemsByCategory('no-such-category')).toEqual([])
  })

  it('"other" contains the items whose category is null', () => {
    const nullCategory = items.filter((item) => item.category === null)
    expect(getItemsByCategory('other').length).toBeGreaterThanOrEqual(nullCategory.length)
  })
})
