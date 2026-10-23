import { getRarity } from '../lib/rarity.js'

export default function RarityBadge({ rarity }) {
  const tier = getRarity(rarity)
  if (!tier) return null
  return (
    <span className="chip">
      Rarity:&nbsp;<span className={`rarity-${tier.key}`}>{tier.name}</span>
    </span>
  )
}
