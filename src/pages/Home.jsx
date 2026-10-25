import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ItemCard from '../components/ItemCard.jsx'
import Pagination from '../components/Pagination.jsx'
import SearchBox from '../components/SearchBox.jsx'
import { paginate, parsePage } from '../lib/paginate.js'
import { defaultSort, getCategories, getSortOptions, listItems } from '../services/dataService.js'

const SORT_LABELS = {
  relevance: 'Best match',
  name: 'Name (A–Z)',
  'rarity-desc': 'Rarity: high to low',
  'rarity-asc': 'Rarity: low to high',
  'damage-desc': 'Damage: high to low',
  'damage-asc': 'Damage: low to high',
}

// Returns a copy of the URL params with some of them changed (null or '' removes one).
function withParams(params, changes) {
  const next = new URLSearchParams(params)
  for (const [key, value] of Object.entries(changes)) {
    if (value == null || value === '') next.delete(key)
    else next.set(key, String(value))
  }
  return next
}

function EmptyState() {
  return (
    <div className="empty" role="status">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#bfae94" strokeWidth="1.5" aria-hidden="true">
        <circle cx="10" cy="10" r="6" />
        <path d="M15 15l6 6M8.5 8.5a1.7 1.7 0 113 .8c-.5.7-1.5 1-1.5 2M10 13h.01" />
      </svg>
      <p className="empty-title">No items found</p>
      <p className="muted">Try a different search term</p>
    </div>
  )
}

/**
 * Item listing. All the state lives in the URL, so every view can be shared and the
 * back button works: ?q=iron&category=tool&sort=rarity-desc&page=2
 */
export default function Home() {
  const [params, setParams] = useSearchParams()
  const categories = useMemo(() => getCategories(), [])

  const query = params.get('q') ?? ''
  const hasQuery = query.trim() !== ''
  const requestedCategory = params.get('category')
  const category = categories.some((entry) => entry.slug === requestedCategory) ? requestedCategory : null
  const sortOptions = getSortOptions({ hasQuery, category })
  const sort = sortOptions.includes(params.get('sort')) ? params.get('sort') : defaultSort(hasQuery)

  const list = useMemo(() => listItems({ query, category, sort }), [query, category, sort])
  const view = paginate(list, parsePage(params.get('page')))

  const hrefFor = (changes) => ({ search: `?${withParams(params, changes)}` })

  return (
    <section className="home">
      <h1 className="sr-only">Terraria crafting recipes</h1>
      <SearchBox value={query} onChange={(value) => setParams(withParams(params, { q: value, page: null }), { replace: true })} />

      <nav aria-label="Categories" className="chips scroll">
        <Link className={`chip${category === null ? ' on' : ''}`} to={hrefFor({ category: null, page: null })} aria-current={category === null ? 'true' : undefined}>
          All
        </Link>
        {categories.map((entry) => (
          <Link
            key={entry.slug}
            className={`chip${category === entry.slug ? ' on' : ''}`}
            to={hrefFor({ category: entry.slug, page: null })}
            aria-current={category === entry.slug ? 'true' : undefined}
          >
            {entry.label}
          </Link>
        ))}
      </nav>

      <div className="toolbar">
        <p className="muted" aria-live="polite">
          {view.total.toLocaleString('en-US')} items
          {view.pageCount > 1 && ` · showing ${view.from.toLocaleString('en-US')}–${view.to.toLocaleString('en-US')}`}
        </p>
        <label className="sort">
          <span className="sr-only">Sort by</span>
          <select
            className="select"
            value={sort}
            onChange={(event) =>
              setParams(withParams(params, { sort: event.target.value === defaultSort(hasQuery) ? null : event.target.value, page: null }))
            }
          >
            {sortOptions.map((value) => (
              <option key={value} value={value}>
                {SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {view.total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ul className="grid" aria-label="Items">
            {view.items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
          <Pagination page={view.page} pageCount={view.pageCount} hrefFor={(page) => hrefFor({ page: page === 1 ? null : page })} />
        </>
      )}
    </section>
  )
}
