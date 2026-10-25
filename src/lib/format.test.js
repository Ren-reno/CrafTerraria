// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { formatCoins } from './format.js'

describe('formatCoins', () => {
  it('formats prices in copper as Terraria coins', () => {
    expect(formatCoins(400)).toBe('4 silver')
    expect(formatCoins(5)).toBe('5 copper')
    expect(formatCoins(15000)).toBe('1 gold 50 silver')
    expect(formatCoins(1_000_000)).toBe('1 platinum')
    expect(formatCoins(12_345_678)).toBe('12 platinum 34 gold 56 silver 78 copper')
  })

  it('returns null when there is no price, so the row can be hidden', () => {
    for (const none of [0, -5, null, undefined, NaN, '400']) expect(formatCoins(none)).toBeNull()
  })
})
