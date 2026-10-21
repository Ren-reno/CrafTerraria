import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemImage from '../components/ItemImage.jsx'
import { getCategories, getStats, searchItems } from '../services/dataService.js'

export default function Home() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchItems(query, { limit: 20 }), [query])
  const categories = useMemo(() => getCategories(), [])
  const stats = useMemo(() => getStats(), [])
  const hasQuery = query.trim() !== ''

  return (
    <section>
      <h1>Terraria crafting recipes</h1>
      <p className="muted">
        {stats.items + stats.orphanItems} items, {stats.recipes} recipes
      </p>

      <input
        type="search"
        aria-label="Search items"
        placeholder="Search items…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {hasQuery && results.length === 0 && <p>No items found.</p>}
      {results.length > 0 && (
        <ul className="plain" aria-label="Search results">
          {results.map((item) => (
            <li key={item.id}>
              <Link to={`/item/${item.id}`}>
                <ItemImage item={item} />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2>Categories</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link to={`/category/${category.slug}`}>{category.label}</Link>{' '}
            <span className="muted">({category.count})</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
