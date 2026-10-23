import ItemImage from './ItemImage.jsx'

/** Item icon inside an inventory-style frame. */
export default function ItemSlot({ item, size = 40, frame = size + 24, decorative = false }) {
  return (
    <span className="slot" style={{ '--slot-size': `${frame}px` }}>
      <ItemImage item={item} size={size} decorative={decorative} />
    </span>
  )
}
