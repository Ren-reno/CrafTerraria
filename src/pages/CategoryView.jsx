import { useParams } from 'react-router-dom'
import ItemCard from '../components/ItemCard.jsx'
import { getCategories, getItemsByCategory } from '../services/dataService.js'
import NotFound from './NotFound.jsx'

// Temporary cap until real pagination exists (RF06).
const LIMIT = 200

export default function CategoryView() {
  const { name } = useParams()
  const category = getCategories().find((entry) => entry.slug === name)
  if (!category) return <NotFound message="That category does not exist." />

  const items = getItemsByCategory(name)
  return (
    <section>
      <h1>{category.label}</h1>
      <p className="muted">
        {items.length} items{items.length > LIMIT ? ` (showing the first ${LIMIT})` : ''}
      </p>
      <ul className="grid">
        {items.slice(0, LIMIT).map((item) => (
          <li key={item.id}>
            <ItemCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}
