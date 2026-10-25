import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import items from './data/items.json'
import recipes from './data/recipes.json'
import App from './App.jsx'
import ItemImage from './components/ItemImage.jsx'
import { getItemById } from './services/dataService.js'

const itemIds = new Set(items.map((item) => item.id))
const resultIds = new Set(recipes.map((recipe) => recipe.resultItemId))
const itemWithoutRecipe = items.find((item) => !resultIds.has(item.id))
const orphanRecipe = recipes.find((recipe) => !itemIds.has(recipe.resultItemId))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('item page (RF03, RF04, RF09, RF10)', () => {
  it('shows the item, its crafting recipe and where it is used', () => {
    renderAt('/item/1')
    expect(screen.getByRole('heading', { level: 1, name: 'Iron Pickaxe' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Crafting' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: /^Used in/ })).toBeTruthy()
  })

  it('links every ingredient to its own item page (RF09)', () => {
    renderAt('/item/1')
    const crafting = screen.getByRole('heading', { level: 2, name: 'Crafting' }).nextElementSibling
    const link = within(crafting).getAllByRole('link')[0]
    expect(link.getAttribute('href')).toMatch(/^\/item\/\d+$/)
  })

  it('explains that an item has no recipe (RF08)', () => {
    renderAt(`/item/${itemWithoutRecipe.id}`)
    expect(screen.getByText(/No crafting recipe/)).toBeTruthy()
  })

  it('renders orphan results from the recipe data', () => {
    if (!orphanRecipe) return
    renderAt(`/item/${orphanRecipe.resultItemId}`)
    expect(screen.getByRole('heading', { level: 1, name: orphanRecipe.resultName })).toBeTruthy()
    expect(screen.getByText(/Limited data/)).toBeTruthy()
  })

  it('shows "not found" for unknown ids and unknown pages', () => {
    renderAt('/item/999999999')
    expect(screen.getByRole('heading', { name: 'Not found' })).toBeTruthy()
  })
})

describe('home and categories', () => {
  it('searches items by name (RF01)', () => {
    renderAt('/')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'iron pickaxe' } })
    const results = screen.getByRole('list', { name: 'Items' })
    expect(within(results).getAllByRole('link')[0].getAttribute('href')).toBe('/item/1')
  })

  it('says so when a search has no results', () => {
    renderAt('/')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzzzzzzz-no-such-item' } })
    expect(screen.getByText('No items found')).toBeTruthy()
    expect(screen.getByText('Try a different search term')).toBeTruthy()
  })

  it('keeps old category links working: /category/x opens the Home filtered by x (RF05)', () => {
    renderAt('/category/other')
    const nav = screen.getByRole('navigation', { name: 'Categories' })
    expect(within(nav).getByRole('link', { name: 'Other' }).getAttribute('aria-current')).toBe('true')
  })

  it('shows "not found" for an unknown category', () => {
    renderAt('/category/no-such-category')
    expect(screen.getByRole('heading', { name: 'Not found' })).toBeTruthy()
  })

  it('always shows the data attribution in the footer', () => {
    renderAt('/')
    expect(screen.getByText(/Item icons are loaded from the wiki and belong to Re-Logic/)).toBeTruthy()
  })
})

describe('search box', () => {
  it('clears the search with the × button', () => {
    renderAt('/')
    const box = screen.getByRole('searchbox')
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
    fireEvent.change(box, { target: { value: 'iron' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(box.value).toBe('')
    expect(within(screen.getByRole('list', { name: 'Items' })).getAllByRole('listitem')).toHaveLength(30)
  })
})

describe('item detail content', () => {
  it('shows rarity, category and stats (RF03, RF07)', () => {
    renderAt('/item/1')
    expect(screen.getByText('Rarity:', { exact: false }).textContent).toContain('White')
    const stats = screen.getByLabelText('Stats')
    expect(within(stats).getByText('Damage')).toBeTruthy()
    expect(within(stats).getByText('4 silver')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Tool' }).getAttribute('href')).toBe('/?category=tool')
  })

  it('shows the crafting station and ingredient quantities (RF04)', () => {
    renderAt('/item/1')
    expect(screen.getByText('Crafted at: Iron Anvil')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Iron Bar' }).getAttribute('href')).toBe('/item/22')
    expect(screen.getByText(/^10×/)).toBeTruthy()
  })

  it('lets you expand group ingredients ("Any Wood") to see the accepted items', () => {
    renderAt('/item/1')
    const summary = screen.getByText(/Any Wood/).closest('summary')
    expect(summary.textContent).toMatch(/3×.*Any Wood.*any of \d+/)
    const group = summary.closest('details')
    expect(within(group).getAllByRole('link').length).toBeGreaterThan(1)
  })

  it('shows 12 "used in" entries first and reveals the rest on demand (RF10)', () => {
    renderAt('/item/22')
    const section = screen.getByRole('heading', { level: 2, name: /^Used in/ }).closest('section')
    const total = Number(/\((\d+)\)/.exec(section.querySelector('h2').textContent)[1])
    expect(total).toBeGreaterThan(12)
    expect(within(section).getAllByRole('link')).toHaveLength(12)
    fireEvent.click(within(section).getByRole('button', { name: `Show all ${total}` }))
    expect(within(section).getAllByRole('link')).toHaveLength(total)
    expect(within(section).queryByRole('button')).toBeNull()
  })

  it('notes when an item is used through a group, naming the group', () => {
    renderAt('/item/22')
    expect(screen.getAllByText('as Any Iron Bar').length).toBeGreaterThan(0)
  })

  it('colors the item name by rarity', () => {
    renderAt('/item/3870') // Betsy\'s Wrath, rarity 8 (Yellow)
    expect(screen.getByRole('heading', { level: 1 }).querySelector('.rarity-yellow')).toBeTruthy()
    expect(screen.getByText('No crafting recipe: this item is obtained another way.')).toBeTruthy()
  })
})

describe('ItemImage', () => {
  it('links the wiki image, lazy-loaded', () => {
    render(<ItemImage item={getItemById(1)} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toMatch(/^https:\/\/terraria\.wiki\.gg\/images\//)
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('uses the generic placeholder when the item has no image', () => {
    render(<ItemImage item={{ id: 1, name: 'No image', imageUrl: null }} />)
    expect(screen.getByRole('img').getAttribute('src')).toMatch(/^data:image\/svg\+xml/)
  })

  it('falls back to the placeholder when the image fails to load', () => {
    render(<ItemImage item={getItemById(1)} />)
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(img.getAttribute('src')).toMatch(/^data:image\/svg\+xml/)
  })
})
