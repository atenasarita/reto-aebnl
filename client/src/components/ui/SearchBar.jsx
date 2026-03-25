import { useState } from 'react'

function SearchBar({ placeholder = "Buscar por nombre, folio o CURP...", onSearch }) {
  const [search, setSearch] = useState('')

  const handleChange = (e) => {
    setSearch(e.target.value)
    if (onSearch) onSearch(e.target.value)
  }

  return (
    <input
      type="text"
      value={search}
      onChange={handleChange}
      placeholder={placeholder}
    />
  )
}

export default SearchBar