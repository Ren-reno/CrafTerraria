import { getRarity } from '../lib/rarity.js'

/** Item name painted with its rarity color (items without rarity use the text color). */
export default function ItemName({ item, className = '' }) {
  const rarity = getRarity(item.rarity)
  const classes = [rarity ? `rarity-${rarity.key}` : '', className].filter(Boolean).join(' ')
  return <span className={classes}>{item.name ?? `Item #${item.id}`}</span>
}
