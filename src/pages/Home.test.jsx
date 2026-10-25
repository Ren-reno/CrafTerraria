import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App.jsx'
import { PAGE_SIZE } from '../lib/paginate.js'
import { listItems } from '../services/dataService.js'

function Probe() {
  return <output aria-label="location">{useLocation().search}</output>
}

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <Probe />
    </MemoryRouter>,
  )
}

const cards = () => within(screen.getByRole('list', { name: 'Items' })).getAllByRole('listitem')
const firstCardName = () => cards()[0].querySelector('.item-card-name').textContent
const count = () => document.querySelector('.toolbar p').textContent
const search = () => screen.getByLabelText('location').textContent
const sortSelect = () => screen.getByRole('combobox')
const chip = (name) => within(screen.getByRole('navigation', { name: 'Categories' })).getByRole('link', { name })

describe('Home listing (RF05, RF06)', () => {
  it('lists the first page of the whole catalog, A-Z', () => {
    renderApp()
    const all = listItems()
    expect(cards()).toHaveLength(PAGE_SIZE)
    expect(firstCardName()).toBe(all[0].name)
    expect(count()).toContain(`${all.length.toLocaleString('en-US')} items`)
    expect(count()).toContain(`showing 1–${PAGE_SIZE}`)
    expect(chip('All').getAttribute('aria-current')).toBe('true')
    expect(sortSelect().value).toBe('name')
  })

  it('filters by category when a chip is clicked, and goes back with "All"', () => {
    renderApp()
    fireEvent.click(chip('Weapon'))
    expect(count()).toContain(`${listItems({ category: 'weapon' }).length.toLocaleString('en-US')} items`)
    expect(search()).toBe('?category=weapon')
    expect(chip('Weapon').getAttribute('aria-current')).toBe('true')
    fireEvent.click(chip('All'))
    expect(search()).toBe('')
  })

  it('ignores an unknown category in the URL', () => {
    renderApp('/?category=nope')
    expect(count()).toContain(`${listItems().length.toLocaleString('en-US')} items`)
    expect(chip('All').getAttribute('aria-current')).toBe('true')
  })

  it('shows the empty state when nothing matches, and the text search sits in the URL', () => {
    renderApp()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzzzzzzz-no-such-item' } })
    expect(screen.getByText('No items found')).toBeTruthy()
    expect(search()).toBe('?q=zzzzzzzzzz-no-such-item')
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(search()).toBe('')
    expect(cards()).toHaveLength(PAGE_SIZE)
  })
})

describe('Home sorting (RF11, RF12)', () => {
  it('sorts by rarity and keeps the choice in the URL', () => {
    renderApp()
    fireEvent.change(sortSelect(), { target: { value: 'rarity-desc' } })
    expect(search()).toBe('?sort=rarity-desc')
    expect(firstCardName()).toBe(listItems({ sort: 'rarity-desc' })[0].name)
    fireEvent.change(sortSelect(), { target: { value: 'name' } })
    expect(search()).toBe('') // the default sort is not written to the URL
  })

  it('offers damage sorts only inside categories where damage applies', () => {
    renderApp()
    expect(screen.queryByRole('option', { name: /Damage/ })).toBeNull()
    fireEvent.click(chip('Weapon'))
    fireEvent.change(sortSelect(), { target: { value: 'damage-desc' } })
    expect(screen.getAllByRole('option', { name: /Damage/ })).toHaveLength(2)
    expect(firstCardName()).toBe(listItems({ category: 'weapon', sort: 'damage-desc' })[0].name)
  })

  it('ignores a damage sort that does not apply, and unknown sorts', () => {
    renderApp('/?sort=damage-desc')
    expect(sortSelect().value).toBe('name')
    renderApp('/?sort=nope')
    expect(screen.getAllByRole('combobox').every((select) => select.value === 'name')).toBe(true)
  })

  it('ranks by best match while searching, with that option available', () => {
    renderApp('/?q=iron')
    expect(sortSelect().value).toBe('relevance')
    expect(firstCardName()).toBe(listItems({ query: 'iron' })[0].name)
    expect(screen.getByRole('option', { name: 'Best match' })).toBeTruthy()
  })
})

describe('Home pagination (RF06)', () => {
  it('shows the requested page and links to the neighbours', () => {
    renderApp('/?page=2')
    expect(firstCardName()).toBe(listItems()[PAGE_SIZE].name)
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByRole('link', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page')
    expect(within(nav).getByRole('link', { name: 'Previous page' }).getAttribute('href')).not.toContain('page=')
    expect(within(nav).getByRole('link', { name: 'Next page' }).getAttribute('href')).toContain('page=3')
  })

  it('moves between pages through the links', () => {
    renderApp()
    fireEvent.click(screen.getByRole('link', { name: 'Next page' }))
    expect(search()).toBe('?page=2')
    expect(count()).toContain(`showing ${PAGE_SIZE + 1}–`)
  })

  it('clamps out-of-range pages and ignores malformed ones', () => {
    renderApp('/?page=99999')
    const last = Math.ceil(listItems().length / PAGE_SIZE)
    expect(
      within(screen.getByRole('navigation', { name: 'Pagination' })).getByRole('link', { name: `Page ${last}` }).getAttribute('aria-current'),
    ).toBe('page')
    renderApp('/?page=abc')
    expect(screen.getAllByRole('navigation', { name: 'Pagination' }).length).toBe(2)
  })

  it('goes back to page 1 when the search changes', () => {
    renderApp('/?page=3')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'iron' } })
    expect(search()).toBe('?q=iron')
  })

  it('goes back to page 1 when the category changes', () => {
    renderApp('/?page=3')
    fireEvent.click(chip('Tool'))
    expect(search()).toBe('?category=tool')
  })

  it('goes back to page 1 when the sort changes', () => {
    renderApp('/?page=3')
    fireEvent.change(sortSelect(), { target: { value: 'rarity-asc' } })
    expect(search()).toBe('?sort=rarity-asc')
  })

  it('keeps the other filters when one of them changes', () => {
    renderApp('/?q=iron&sort=rarity-desc')
    fireEvent.click(chip('Tool'))
    expect(search()).toBe('?q=iron&sort=rarity-desc&category=tool')
  })

  it('shows no pager when everything fits in one page', () => {
    renderApp('/?q=iron+pickaxe&category=tool')
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
  })
})
