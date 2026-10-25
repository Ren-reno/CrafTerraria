import { Navigate, useParams } from 'react-router-dom'
import { getCategories } from '../services/dataService.js'
import NotFound from './NotFound.jsx'

// Kept so old links keep working: /category/tool -> /?category=tool (RNF04).
export default function CategoryView() {
  const { name } = useParams()
  if (!getCategories().some((entry) => entry.slug === name)) {
    return <NotFound message="That category does not exist." />
  }
  return <Navigate to={`/?category=${encodeURIComponent(name)}`} replace />
}
