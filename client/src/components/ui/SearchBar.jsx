import { useState, useEffect, useRef } from 'react'
import './styles/SearchBar.css'

function SearchBar({ placeholder = "Buscar por nombre, folio o CURP...", onSearch, className = '', debounceMs = 300, icon }) {
  const [search, setSearch] = useState('')
  const timerRef = useRef(null)
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  const handleChange = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (debounceMs > 0) {
      timerRef.current = setTimeout(() => {
        const fn = onSearchRef.current
        if (fn) fn(search)
      }, debounceMs)

      return () => clearTimeout(timerRef.current)
    }

    const fn = onSearchRef.current
    if (fn) fn(search)
  }, [search, debounceMs])

  return (
    <div className={`searchbar-wrapper ${className}`}>
      {icon && <span className="search-icon">{icon}</span>}
      <input
        type="text"
        value={search}
        onChange={handleChange}
        placeholder={placeholder}
        className={`search-input ${icon ? 'search-input--with-icon' : ''}`}
      />
    </div>
  )
}

export default SearchBar