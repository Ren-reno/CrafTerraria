export default function SearchBox({ value, onChange }) {
  return (
    <div className="search">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bfae94" strokeWidth="2" aria-hidden="true">
        <circle cx="10" cy="10" r="6" />
        <path d="M15 15l6 6" />
      </svg>
      <input
        type="search"
        aria-label="Search items"
        placeholder="Search items"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')}>
          ×
        </button>
      )}
    </div>
  )
}
