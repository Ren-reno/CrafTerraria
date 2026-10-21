import { useState } from 'react'
import { getItemImageUrl } from '../services/dataService.js'

// Generic icon shown when an item has no image or its URL fails (e.g. 404).
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" fill="#d9d9d9"/>' +
      '<rect x="8" y="8" width="16" height="16" fill="none" stroke="#8a8a8a" stroke-width="2"/>' +
      '<path d="M8 24l6-7 4 4 3-3 3 6" fill="none" stroke="#8a8a8a" stroke-width="2"/>' +
      '</svg>',
  )

/**
 * Item icon, linked directly from the wiki (docs/01, section 8). Lazy-loaded,
 * with a generic fallback when there is no URL or the request fails.
 */
export default function ItemImage({ item, size = 32 }) {
  const src = getItemImageUrl(item)
  const [failedSrc, setFailedSrc] = useState(null)
  const usePlaceholder = !src || failedSrc === src

  return (
    <img
      className="item-icon"
      src={usePlaceholder ? PLACEHOLDER : src}
      alt={item?.name ?? 'Item icon'}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  )
}
