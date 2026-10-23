// Rarity tiers (RF03, RF11). The data stores a number, or "quest" for the Angler's
// quest fish and Strange Plants. `key` is the CSS class suffix (see styles/tokens.css).
const TIERS = {
  '-13': ['fiery-red', 'Fiery Red'],
  '-12': ['rainbow', 'Rainbow'],
  '-1': ['gray', 'Gray'],
  0: ['white', 'White'],
  1: ['blue', 'Blue'],
  2: ['green', 'Green'],
  3: ['orange', 'Orange'],
  4: ['light-red', 'Light Red'],
  5: ['pink', 'Pink'],
  6: ['light-purple', 'Light Purple'],
  7: ['lime', 'Lime'],
  8: ['yellow', 'Yellow'],
  9: ['cyan', 'Cyan'],
  10: ['red', 'Red'],
  11: ['purple', 'Purple'],
}

/** { key, name } for a rarity value, or null when the item has no rarity. */
export function getRarity(value) {
  if (value == null) return null
  if (value === 'quest') return { key: 'amber', name: 'Quest' }
  const tier = TIERS[value]
  return tier ? { key: tier[0], name: tier[1] } : { key: 'unknown', name: `Level ${value}` }
}
