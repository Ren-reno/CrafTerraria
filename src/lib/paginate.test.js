import { describe, expect, it } from 'vitest'
import { PAGE_SIZE, paginate, pageWindow, parsePage } from './paginate.js'

const range = (n) => Array.from({ length: n }, (_, i) => i + 1)

describe('parsePage', () => {
  it('accepts positive integers and falls back to 1 for anything else', () => {
    expect(parsePage('3')).toBe(3)
    for (const bad of ['0', '-2', '1.5', 'abc', '', ' 2', '2 ', '1e1', '०१', null, undefined]) expect(parsePage(bad)).toBe(1)
  })
})

describe('paginate', () => {
  it('slices a page and reports the range', () => {
    const result = paginate(range(70), 2)
    expect(result.items).toEqual(range(70).slice(PAGE_SIZE, PAGE_SIZE * 2))
    expect(result).toMatchObject({ page: 2, pageCount: 3, total: 70, from: PAGE_SIZE + 1, to: PAGE_SIZE * 2 })
  })

  it('clamps out-of-range pages', () => {
    expect(paginate(range(70), 999).page).toBe(3)
    expect(paginate(range(70), 0).page).toBe(1)
    expect(paginate(range(70), NaN).page).toBe(1)
    expect(paginate(range(70), 999).items).toHaveLength(10)
  })

  it('handles empty and exact-multiple lists', () => {
    expect(paginate([], 1)).toMatchObject({ items: [], page: 1, pageCount: 1, total: 0, from: 0, to: 0 })
    expect(paginate(range(PAGE_SIZE * 2), 1).pageCount).toBe(2)
    expect(paginate(range(PAGE_SIZE * 2 + 1), 1).pageCount).toBe(3)
  })
})

describe('pageWindow', () => {
  it('shows every page when there are few', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(2, 3)).toEqual([1, 2, 3])
  })

  it('collapses long ranges with ellipses around the current page', () => {
    expect(pageWindow(1, 256)).toEqual([1, 2, '…', 256])
    expect(pageWindow(128, 256)).toEqual([1, '…', 127, 128, 129, '…', 256])
    expect(pageWindow(256, 256)).toEqual([1, '…', 255, 256])
  })

  it('shows a single missing page instead of an ellipsis', () => {
    expect(pageWindow(4, 10)).toEqual([1, 2, 3, 4, 5, '…', 10])
  })

  it('always includes first, current and last page, in order, without repeats', () => {
    for (const [page, count] of [[1, 9], [5, 9], [9, 9], [30, 60], [2, 4]]) {
      const pages = pageWindow(page, count).filter((entry) => entry !== '…')
      expect(pages).toEqual([...new Set(pages)].sort((a, b) => a - b))
      expect(pages[0]).toBe(1)
      expect(pages).toContain(page)
      expect(pages.at(-1)).toBe(count)
    }
  })
})
