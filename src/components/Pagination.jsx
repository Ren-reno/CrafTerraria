import { Link } from 'react-router-dom'
import { pageWindow } from '../lib/paginate.js'

/** Classic numbered pagination: ‹ 1 2 3 … 15 ›. `hrefFor(page)` returns a router location. */
export default function Pagination({ page, pageCount, hrefFor }) {
  if (pageCount <= 1) return null
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link className="chip" to={hrefFor(page - 1)} rel="prev" aria-label="Previous page">
          ‹
        </Link>
      ) : (
        <span className="chip disabled" aria-hidden="true">
          ‹
        </span>
      )}
      {pageWindow(page, pageCount).map((entry, index) =>
        entry === '…' ? (
          <span key={`gap-${index}`} className="chip gap" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={entry}
            className={`chip${entry === page ? ' on' : ''}`}
            to={hrefFor(entry)}
            aria-current={entry === page ? 'page' : undefined}
            aria-label={`Page ${entry}`}
          >
            {entry}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link className="chip" to={hrefFor(page + 1)} rel="next" aria-label="Next page">
          ›
        </Link>
      ) : (
        <span className="chip disabled" aria-hidden="true">
          ›
        </span>
      )}
    </nav>
  )
}
