import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ItemName from '../components/ItemName.jsx'
import ItemSlot from '../components/ItemSlot.jsx'
import RarityBadge from '../components/RarityBadge.jsx'
import { formatCoins } from '../lib/format.js'
import {
  categoryLabel,
  categorySlug,
  getItemById,
  getRecipeIngredients,
  getRecipesByItem,
  getUsedIn,
} from '../services/dataService.js'
import NotFound from './NotFound.jsx'

const USED_IN_INITIAL = 12

function ItemLink({ item }) {
  return <Link to={`/item/${item.id}`}>{item.name ?? `Item #${item.id}`}</Link>
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Stats({ item }) {
  const rows = [
    ['Damage', item.damage],
    ['Damage type', item.damageType],
    ['Defense', item.defense],
    ['Sell value', formatCoins(item.sellValue)],
  ].filter(([, value]) => value != null)
  if (rows.length === 0) return null
  return (
    <dl className="panel stats" aria-label="Stats">
      {rows.map(([label, value]) => (
        <Stat key={label} label={label} value={value} />
      ))}
    </dl>
  )
}

function Ingredient({ ingredient }) {
  if (ingredient.item) {
    return (
      <li className="ingredient">
        <ItemSlot item={ingredient.item} size={28} frame={44} decorative />
        <span>
          {ingredient.quantity}× <ItemLink item={ingredient.item} />
        </span>
      </li>
    )
  }
  const count = ingredient.alternatives.length
  const label = (
    <>
      <span className="slot" style={{ '--slot-size': '44px' }} aria-hidden="true" />
      <span>
        {ingredient.quantity}× {ingredient.categoryHint}
        {count > 0 && <span className="ingredient-note"> any of {count}</span>}
      </span>
    </>
  )
  if (count === 0) return <li className="ingredient">{label}</li>
  return (
    <li>
      <details className="group">
        <summary>{label}</summary>
        <ul>
          {ingredient.alternatives.map((alternative) => (
            <li key={alternative.id}>
              <ItemLink item={alternative} />
            </li>
          ))}
        </ul>
      </details>
    </li>
  )
}

function Recipe({ recipe }) {
  const stations = recipe.station?.length ? recipe.station.join(' + ') : null
  return (
    <div className="panel recipe">
      <div className="chips">
        {stations && <span className="chip small">Crafted at: {stations}</span>}
        {recipe.requiredCondition && <span className="chip small">Requires: {recipe.requiredCondition}</span>}
        {recipe.resultQuantity > 1 && <span className="chip small">Makes {recipe.resultQuantity}</span>}
      </div>
      <ul>
        {getRecipeIngredients(recipe).map((ingredient, index) => (
          <Ingredient key={`${recipe.id}-${index}`} ingredient={ingredient} />
        ))}
      </ul>
    </div>
  )
}

function UsedIn({ entries }) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? entries : entries.slice(0, USED_IN_INITIAL)
  return (
    <>
      <ul className="used-in">
        {shown.map(({ recipe, viaGroup }) => {
          const result = getItemById(recipe.resultItemId)
          return (
            <li key={recipe.id}>
              <Link to={`/item/${result.id}`} className="card used-in-card">
                <ItemSlot item={result} size={24} frame={40} decorative />
                <span>
                  <ItemName item={result} />
                  {viaGroup && <span className="ingredient-note">as {viaGroup}</span>}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      {entries.length > USED_IN_INITIAL && !showAll && (
        <button type="button" className="link-button" onClick={() => setShowAll(true)}>
          Show all {entries.length}
        </button>
      )}
    </>
  )
}

export default function ItemDetail() {
  const { id } = useParams()
  const item = getItemById(id)
  if (!item) return <NotFound message="That item does not exist." />

  const recipes = getRecipesByItem(item.id)
  const usedIn = getUsedIn(item.id)

  return (
    <article className="detail">
      <Link className="back" to="/">
        ← Back to search
      </Link>
      <div className="detail-layout">
        <div className="detail-side">
          <header className="detail-head">
            <ItemSlot item={item} size={72} frame={120} />
            <h1>
              <ItemName item={item} />
            </h1>
            <div className="chips">
              <RarityBadge rarity={item.rarity} />
              <Link className="chip" to={`/?category=${categorySlug(item.category)}`}>
                {categoryLabel(item.category)}
              </Link>
            </div>
            {item.isOrphan && <p className="muted">Limited data: the wiki has no item sheet for this item.</p>}
          </header>
          <Stats item={item} />
        </div>

        <div className="detail-main">
          <section>
            <h2>Crafting</h2>
            {recipes.length === 0 ? (
              <p className="panel">No crafting recipe: this item is obtained another way.</p>
            ) : (
              recipes.map((recipe) => <Recipe key={recipe.id} recipe={recipe} />)
            )}
          </section>

          <section>
            <h2>Used in ({usedIn.length})</h2>
            {usedIn.length === 0 ? (
              <p className="panel">This item is not used in any recipe.</p>
            ) : (
              <UsedIn entries={usedIn} />
            )}
          </section>
        </div>
      </div>
    </article>
  )
}
