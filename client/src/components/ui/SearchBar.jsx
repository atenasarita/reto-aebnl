import { useState, useEffect, useRef } from 'react'
import './styles/SearchBar.css'

function SearchBar({ 
  placeholder = " ", 
  onSearch, 
  onChange, 
  value = '', 
  className = '', 
  debounceMs = 300, 
  icon,
  prefix,
  ...props }) {
  const [search, setSearch] = useState(value ?? '')
  const timerRef = useRef(null)
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  useEffect(() => {
    if (value !== undefined && value !== search) {
      setSearch(value ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (e) => {
    const val = e.target.value
    setSearch(val)
    if (onChange) onChange(val)
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

  const { className: inputClassFromProps, style: inputStyle, ...inputProps } = props

  const hasLeadingAffix = Boolean(icon || prefix)

  const inputClassName = [
    'search-input',
    icon ? 'search-input--with-icon' : '',
    prefix ? 'search-input--with-prefix' : '',
    inputClassFromProps,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`searchbar-wrapper ${className}`.trim()}>
      {icon && <span className="search-icon" aria-hidden="true">{icon}</span>}
      {prefix && !icon && (
        <span className="search-prefix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={search}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClassName}
        style={hasLeadingAffix ? { paddingLeft: '42px', ...inputStyle } : inputStyle}
        {...inputProps}
      />
    </div>
  )
}

export default SearchBar