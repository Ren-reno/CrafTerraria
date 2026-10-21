import { Link, useParams } from 'react-router-dom'
import ItemImage from '../components/ItemImage.jsx'
import {
  categoryLabel,
  categorySlug,
  getItemById,
  getRecipeIngredients,
  getRecipesByItem,
  getUsedIn,
} from '../services/dataService.js'
import NotFound from './NotFound.jsx'

const USED_IN_LIMIT = 25
const ALTERNATIVES_LIMIT = 8

function ItemLink({ item }) {
  return <Link to={`/item/${item.id}`}>{item.name ?? `Item #${item.id}`}</Link>
}

function formatRarity(rarity) {
  if (rarity === 'quest') return 'Quest'
  return rarity == null ? '—' : String(rarity)
}

function Ingredient({ ingredient }) {
  if (ingredient.item) {
    return (
      <>
        {ingredient.quantity}× <ItemLink item={ingredient.item} />
      </>
    )
  }
  const shown = ingredient.alternatives.slice(0, ALTERNATIVES_LIMIT)
  const hidden = ingredient.alternatives.length - shown.length
  return (
    <>
      {ingredient.quantity}× {ingredient.categoryHint}
      {shown.length > 0 && (
        <span className="muted">
          {' '}
          (
          {shown.map((alternative, index) => (
            <span key={alternative.id}>
              {index > 0 && ', '}
              <ItemLink item={alternative} />
            </span>
          ))}
          {hidden > 0 && `, +${hidden} more`})
        </span>
      )}
    </>
  )
}

function Recipe({ recipe }) {
  const station = recipe.station?.length ? recipe.station.join(', ') : null
  return (
    <li>
      <p>
        Makes {recipe.resultQuantity}
        {station && <> at <strong>{station}</strong></>}
        {recipe.requiredCondition && <span className="muted"> — requires {recipe.requiredCondition}</span>}
      </p>
      <ul>
        {getRecipeIngredients(recipe).map((ingredient, index) => (
          <li key={`${recipe.id}-${index}`}>
            <Ingredient ingredient={ingredient} />
          </li>
        ))}
      </ul>
    </li>
  )
}

export default function ItemDetail() {
  const { id } = useParams()
  const item = getItemById(id)
  if (!item) return <NotFound message="That item does not exist." />

  const recipes = getRecipesByItem(item.id)
  const usedIn = getUsedIn(item.id)

  return (
    <section>
      <h1>{item.name ?? `Item #${item.id}`}</h1>
      <ItemImage item={item} size={48} />
      <p className="muted">
        <Link to={`/category/${categorySlug(item.category)}`}>{categoryLabel(item.category)}</Link>
        {' · '}Rarity: {formatRarity(item.rarity)}
        {item.isOrphan && ' · Limited data: the wiki has no item sheet for this item'}
      </p>

      <h2>Crafting</h2>
      {recipes.length === 0 ? (
        <p>No crafting recipe: this item is obtained another way.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <Recipe key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      )}

      <h2>Used in ({usedIn.length})</h2>
      {usedIn.length === 0 ? (
        <p>This item is not used in any recipe.</p>
      ) : (
        <>
          <ul>
            {usedIn.slice(0, USED_IN_LIMIT).map(({ recipe, viaGroup }) => (
              <li key={recipe.id}>
                <ItemLink item={getItemById(recipe.resultItemId)} />
                {viaGroup && <span className="muted"> (as {viaGroup})</span>}
              </li>
            ))}
          </ul>
          {usedIn.length > USED_IN_LIMIT && (
            <p className="muted">Showing the first {USED_IN_LIMIT} of {usedIn.length}.</p>
          )}
        </>
      )}
    </section>
  )
}
