/**
 * Formats a price stored in copper coins as Terraria shows it:
 * 100 copper = 1 silver, 100 silver = 1 gold, 100 gold = 1 platinum.
 * Returns null when there is no price (so the UI can hide the row).
 */
export function formatCoins(copper) {
  if (!Number.isFinite(copper) || copper <= 0) return null
  const parts = [
    ['platinum', Math.floor(copper / 1_000_000)],
    ['gold', Math.floor(copper / 10_000) % 100],
    ['silver', Math.floor(copper / 100) % 100],
    ['copper', copper % 100],
  ]
  return parts
    .filter(([, amount]) => amount > 0)
    .map(([unit, amount]) => `${amount} ${unit}`)
    .join(' ')
}
