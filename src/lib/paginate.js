export const PAGE_SIZE = 30 // divisible by 2, 3 and 5: no half-empty rows in any grid width

/** Page number from a URL parameter: only positive integers, anything else is page 1. */
export function parsePage(value) {
  return /^[1-9]\d*$/.test(value ?? '') ? Number(value) : 1
}

/** One page of `list`. The page is clamped to the valid range. */
export function paginate(list, page, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize))
  const current = Math.min(Math.max(1, Number.isInteger(page) ? page : 1), pageCount)
  const start = (current - 1) * pageSize
  const items = list.slice(start, start + pageSize)
  return {
    items,
    page: current,
    pageCount,
    total: list.length,
    from: items.length ? start + 1 : 0,
    to: start + items.length,
  }
}

/** Page numbers to show, with '…' for gaps: 1 … 127 128 129 … 256. */
export function pageWindow(page, pageCount) {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1])
  const pages = [...wanted].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const out = []
  pages.forEach((p, index) => {
    if (index > 0) {
      const gap = p - pages[index - 1]
      if (gap === 2) out.push(p - 1) // a single missing page is shown instead of '…'
      else if (gap > 2) out.push('…')
    }
    out.push(p)
  })
  return out
}
