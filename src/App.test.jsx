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
    const results = screen.getByRole('list', { name: 'Search results' })
    expect(within(results).getAllByRole('link')[0].getAttribute('href')).toBe('/item/1')
  })

  it('says so when a search has no results', () => {
    renderAt('/')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzzzzzzz-no-such-item' } })
    expect(screen.getByText('No items found.')).toBeTruthy()
  })

  it('lists categories and opens one (RF05)', () => {
    renderAt('/category/other')
    expect(screen.getByRole('heading', { level: 1, name: 'Other' })).toBeTruthy()
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
