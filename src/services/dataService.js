// Data access layer. Components never import the JSON files directly: they go
// through the functions below (see docs/01, section 6).
//
// Source of the data: https://github.com/Ren-reno/terraria-crafting-data-pipeline
// (see src/data/README.md for the exact commit).

import itemsData from '../data/items.json'
import recipesData from '../data/recipes.json'
import ingredientCategories from '../data/ingredient_categories.json'

// ---------------------------------------------------------------------------
// Indexes (built once, when the module is first loaded)
// ---------------------------------------------------------------------------

const itemsById = new Map(itemsData.map((item) => [item.id, item]))

const recipesByResult = new Map()
for (const recipe of recipesData) {
  const list = recipesByResult.get(recipe.resultItemId)
  if (list) list.push(recipe)
  else recipesByResult.set(recipe.resultItemId, [recipe])
}

// "Orphan" results: recipes whose result item has no row in items.json (the
// wiki has the recipe but not the item sheet). We build a minimal item from the
// recipe's own `resultName` / `resultImageUrl`, so every recipe result can be
// resolved and shown like any other item.
const orphanItems = []
for (const [id, list] of recipesByResult) {
  if (itemsById.has(id)) continue
  const named = list.find((recipe) => recipe.resultName)
  const withImage = list.find((recipe) => recipe.resultImageUrl)
  orphanItems.push({
    id,
    name: named ? named.resultName : null,
    category: null,
    subcategory: null,
    imageUrl: withImage ? withImage.resultImageUrl : null,
    rarity: null,
    isOrphan: true,
  })
}

const allItems = [...itemsData, ...orphanItems]
const allItemsById = new Map(allItems.map((item) => [item.id, item]))

// "Used in" index: item id -> [{ recipe, viaGroup }].
// `viaGroup` is null when the item is listed directly in the recipe, or the
// group name (e.g. "Any Iron Bar") when the recipe accepts it as a member of
// an interchangeable group.
const usedInIndex = new Map()
for (const recipe of recipesData) {
  const usage = new Map() // item id -> viaGroup (direct entries win over groups)
  for (const ingredient of recipe.ingredients) {
    if (ingredient.itemId != null) usage.set(ingredient.itemId, null)
  }
  for (const ingredient of recipe.ingredients) {
    if (ingredient.categoryHint == null) continue
    for (const memberId of ingredientCategories[ingredient.categoryHint] ?? []) {
      if (!usage.has(memberId)) usage.set(memberId, ingredient.categoryHint)
    }
  }
  for (const [itemId, viaGroup] of usage) {
    const list = usedInIndex.get(itemId)
    if (list) list.push({ recipe, viaGroup })
    else usedInIndex.set(itemId, [{ recipe, viaGroup }])
  }
}

// Search index: lowercase names, computed once.
const searchIndex = allItems
  .filter((item) => item.name)
  .map((item) => ({ item, lowerName: item.name.toLowerCase() }))

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

/**
 * Accepts an integer, or a canonical decimal string such as "1" (route params
 * are strings). Anything else is rejected on purpose: "01", " 1", "1e0", "0x1",
 * true, null... must not resolve to item 1.
 */
function normalizeId(id) {
  if (typeof id === 'number') return Number.isInteger(id) ? id : null
  if (typeof id === 'string' && /^(0|[1-9]\d*)$/.test(id)) return Number(id)
  return null
}

/**
 * Returns the item with that id, or null. Orphan results (see above) are
 * returned too, flagged with `isOrphan: true`.
 */
export function getItemById(id) {
  const n = normalizeId(id)
  return n === null ? null : (allItemsById.get(n) ?? null)
}

/** Item name, or null when unknown. */
export function getItemName(id) {
  return getItemById(id)?.name ?? null
}

/**
 * URL of the item icon, or null when there is none. Icons are linked directly
 * from the wiki (decision of 2026-10-20, docs/01 section 8): every image must
 * come through this function, so the origin can change in one place.
 */
export function getItemImageUrl(item) {
  return item?.imageUrl ?? null
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

/** Recipes that produce the item (empty array if none: RF08). */
export function getRecipesByItem(id) {
  const n = normalizeId(id)
  return n === null ? [] : (recipesByResult.get(n) ?? [])
}

export function hasRecipe(id) {
  return getRecipesByItem(id).length > 0
}

/**
 * Resolves one recipe ingredient:
 *  - `item`: the ingredient item, or null when it is a group ("Any X").
 *  - `categoryHint`: group name, or null.
 *  - `alternatives`: items that belong to the group (empty for plain items and
 *    for groups with no known members, such as "Recorded Music Boxes").
 */
export function resolveIngredient(ingredient) {
  const categoryHint = ingredient.categoryHint ?? null
  const alternatives = categoryHint
    ? (ingredientCategories[categoryHint] ?? []).map(getItemById).filter(Boolean)
    : []
  return {
    quantity: ingredient.quantity,
    itemId: ingredient.itemId ?? null,
    item: ingredient.itemId != null ? getItemById(ingredient.itemId) : null,
    categoryHint,
    alternatives,
  }
}

export function getRecipeIngredients(recipe) {
  return recipe.ingredients.map(resolveIngredient)
}

/**
 * Recipes where the item is used as an ingredient (RF10), either directly or
 * as a member of an interchangeable group. Each entry is
 * `{ recipe, viaGroup }` (see the index above).
 */
export function getUsedIn(id) {
  const n = normalizeId(id)
  return n === null ? [] : (usedInIndex.get(n) ?? [])
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

// 0 = exact, 1 = starts with, 2 = a word starts with, 3 = contains, -1 = no match
function matchTier(lowerName, query) {
  if (lowerName === query) return 0
  if (lowerName.startsWith(query)) return 1
  if (lowerName.split(/[\s\-'()]+/).some((word) => word.startsWith(query))) return 2
  if (lowerName.includes(query)) return 3
  return -1
}

/**
 * Case-insensitive search by name. Best matches first (exact, prefix, word
 * prefix, substring), then shorter names, then lower ids.
 */
export function searchItems(query, { limit = 50 } = {}) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return []
  const matches = []
  for (const entry of searchIndex) {
    const tier = matchTier(entry.lowerName, q)
    if (tier >= 0) matches.push({ item: entry.item, tier, length: entry.lowerName.length })
  }
  matches.sort((a, b) => a.tier - b.tier || a.length - b.length || a.item.id - b.item.id)
  return matches.slice(0, limit).map((match) => match.item)
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/** URL-safe identifier of a category. Items without category go to "other". */
export function categorySlug(category) {
  return category == null ? 'other' : category.trim().toLowerCase().replace(/\s+/g, '-')
}

/** Display label. Items without category are shown as "Other". */
export function categoryLabel(category) {
  return category == null ? 'Other' : category.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** All categories with their item count, alphabetical, "Other" last. */
export function getCategories() {
  const bySlug = new Map()
  for (const item of allItems) {
    const slug = categorySlug(item.category)
    const entry = bySlug.get(slug)
    if (entry) entry.count += 1
    else bySlug.set(slug, { slug, label: categoryLabel(item.category), count: 1 })
  }
  return [...bySlug.values()].sort((a, b) => {
    if (a.slug === 'other') return 1
    if (b.slug === 'other') return -1
    return a.label.localeCompare(b.label)
  })
}

/** Items of a category (by slug), sorted by name. Unknown slug -> []. */
export function getItemsByCategory(slug) {
  return allItems
    .filter((item) => categorySlug(item.category) === slug)
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '') || a.id - b.id)
}

export function getStats() {
  return {
    items: itemsData.length,
    orphanItems: orphanItems.length,
    recipes: recipesData.length,
    categories: getCategories().length,
  }
}

// ---------------------------------------------------------------------------
// Listing: filter + sort (RF05, RF06, RF11, RF12)
// ---------------------------------------------------------------------------

// Rarity values that are not part of the normal -1..11 ladder. Items with these
// (or with no rarity at all) are always listed last when sorting by rarity.
function hasSpecialRarity(item) {
  return item.rarity == null || item.rarity === 'quest' || item.rarity === -12 || item.rarity === -13
}

const byNameThenId = (a, b) => (a.name ?? '\uffff').localeCompare(b.name ?? '\uffff') || a.id - b.id

/**
 * Returns a sorted copy of `list`. Sorts:
 *  - "relevance": keeps the given order (search results are already ranked).
 *  - "name": A-Z; items without a name go last.
 *  - "rarity-desc" / "rarity-asc": by tier; special rarities (Quest, Rainbow, Fiery Red)
 *    and items without rarity go last in BOTH directions.
 *  - "damage-desc" / "damage-asc": items without damage go last in both directions.
 * Ties are broken by name, then id, so the order is deterministic.
 */
export function sortItems(list, sort) {
  const copy = [...list]
  switch (sort) {
    case 'relevance':
      return copy
    case 'rarity-desc':
    case 'rarity-asc': {
      const sign = sort === 'rarity-desc' ? -1 : 1
      return copy.sort((a, b) => {
        const aSpecial = hasSpecialRarity(a)
        const bSpecial = hasSpecialRarity(b)
        if (aSpecial !== bSpecial) return aSpecial ? 1 : -1
        return (aSpecial ? 0 : sign * (a.rarity - b.rarity)) || byNameThenId(a, b)
      })
    }
    case 'damage-desc':
    case 'damage-asc': {
      const sign = sort === 'damage-desc' ? -1 : 1
      return copy.sort((a, b) => {
        const aHas = a.damage != null
        const bHas = b.damage != null
        if (aHas !== bHas) return aHas ? -1 : 1
        return (aHas ? sign * (a.damage - b.damage) : 0) || byNameThenId(a, b)
      })
    }
    default:
      return copy.sort(byNameThenId)
  }
}

/** True when at least one item of the category (slug) has damage (RF12). */
export function categoryHasDamage(slug) {
  return allItems.some((item) => categorySlug(item.category) === slug && item.damage != null)
}

export function defaultSort(hasQuery) {
  return hasQuery ? 'relevance' : 'name'
}

/** Sort values available for the current view. Damage only where it applies (RF12). */
export function getSortOptions({ hasQuery = false, category = null } = {}) {
  const options = ['name', 'rarity-desc', 'rarity-asc']
  if (category && categoryHasDamage(category)) options.push('damage-desc', 'damage-asc')
  return hasQuery ? ['relevance', ...options] : options
}

/**
 * Items for the listing: optional text query, optional category (slug) and a sort.
 * Without a sort it uses the default (best match when searching, otherwise A-Z).
 */
export function listItems({ query = '', category = null, sort = null } = {}) {
  const text = String(query ?? '').trim()
  let list = text ? searchItems(text, { limit: Infinity }) : allItems
  if (category) list = list.filter((item) => categorySlug(item.category) === category)
  return sortItems(list, sort ?? defaultSort(Boolean(text)))
}
