import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemCard from '../components/ItemCard.jsx'
import SearchBox from '../components/SearchBox.jsx'
import { getCategories, getStats, searchItems } from '../services/dataService.js'

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

export default function Home() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchItems(query, { limit: 20 }), [query])
  const categories = useMemo(() => getCategories(), [])
  const stats = useMemo(() => getStats(), [])
  const hasQuery = query.trim() !== ''

  return (
    <section className="home">
      <h1 className="sr-only">Terraria crafting recipes</h1>
      <SearchBox value={query} onChange={setQuery} />

      {!hasQuery && (
        <>
          <p className="muted">
            {stats.items + stats.orphanItems} items · {stats.recipes} recipes
          </p>
          <nav aria-label="Categories">
            <h2>Categories</h2>
            <div className="chips">
              {categories.map((category) => (
                <Link key={category.slug} className="chip" to={`/category/${category.slug}`}>
                  {category.label}&nbsp;<span className="muted">({category.count})</span>
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}

      {hasQuery && results.length === 0 && <EmptyState />}
      {results.length > 0 && (
        <ul className="grid" aria-label="Search results">
          {results.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
