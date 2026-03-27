import { useState } from 'react'
import './styles/Dropdown.css'

function Dropdown({ options = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' }
], value, onChange, className = '' }) {
  // local fallback state in case parent doesn't control it
  const [localValue, setLocalValue] = useState(value ?? '')

  const handleChange = (e) => {
    const val = e.target.value
    if (onChange) onChange(val)
    else setLocalValue(val)
  }

  const selected = value ?? localValue

  return (
    <div className={`dropdown-wrapper ${className}`}>
      <select className="dropdown-select" value={selected} onChange={handleChange}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export default Dropdown