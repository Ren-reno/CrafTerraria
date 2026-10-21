import { Link } from 'react-router-dom'

export default function NotFound({ message = 'Page not found.' }) {
  return (
    <section>
      <h1>Not found</h1>
      <p>{message}</p>
      <Link to="/">Back to the home page</Link>
    </section>
  )
}
