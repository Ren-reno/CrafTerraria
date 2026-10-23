import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import items from '../data/items.json'
import { getRarity } from './rarity.js'

describe('getRarity', () => {
  it('maps numeric tiers to a name and a CSS key', () => {
    expect(getRarity(0)).toEqual({ key: 'white', name: 'White' })
    expect(getRarity(8)).toEqual({ key: 'yellow', name: 'Yellow' })
    expect(getRarity(4)).toEqual({ key: 'light-red', name: 'Light Red' })
  })

  it('handles negative tiers, quest and missing values', () => {
    expect(getRarity(-1).name).toBe('Gray')
    expect(getRarity(-12).name).toBe('Rainbow')
    expect(getRarity(-13).name).toBe('Fiery Red')
    expect(getRarity('quest')).toEqual({ key: 'amber', name: 'Quest' })
    expect(getRarity(null)).toBeNull()
    expect(getRarity(undefined)).toBeNull()
  })

  it('does not hide unknown tiers: they get a neutral key and their level', () => {
    expect(getRarity(99)).toEqual({ key: 'unknown', name: 'Level 99' })
  })

  it('knows every rarity that appears in the data (no "unknown" tiers)', () => {
    const values = new Set(items.map((item) => item.rarity).filter((value) => value != null))
    const unknown = [...values].filter((value) => getRarity(value).key === 'unknown')
    expect(unknown).toEqual([])
  })

  it('every rarity key has its color class in styles/tokens.css', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
    const values = [-13, -12, -1, ...Array.from({ length: 12 }, (_, i) => i), 'quest', 99]
    const missing = values.map((value) => getRarity(value).key).filter((key) => !css.includes(`.rarity-${key}`))
    expect(missing).toEqual([])
  })
})
