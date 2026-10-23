import { Link } from 'react-router-dom'
import { categoryLabel } from '../services/dataService.js'
import ItemName from './ItemName.jsx'
import ItemSlot from './ItemSlot.jsx'

export default function ItemCard({ item }) {
  return (
    <Link to={`/item/${item.id}`} className="card item-card">
      <ItemSlot item={item} size={40} frame={64} decorative />
      <ItemName item={item} className="item-card-name" />
      <span className="item-card-cat">{categoryLabel(item.category)}</span>
    </Link>
  )
}
