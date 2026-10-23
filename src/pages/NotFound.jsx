import { Link } from 'react-router-dom'

export default function NotFound({ message = 'Page not found.' }) {
  return (
    <section className="empty">
      <h1>Not found</h1>
      <p>{message}</p>
      <Link className="back" to="/">
        ← Back to search
      </Link>
    </section>
  )
}
