import { useState, useMemo } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import styles from './ServiciosBeneficiario.module.css'

function fmt(num) {
  if (num == null) return '—'
  return `$${Number(num).toFixed(2)}`
}

export default function ServiciosBeneficiario({ historial = [], onVerDetalle }) {
  const [query, setQuery]               = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  const sugerencias = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase()
    const vistos = new Set()
    return historial
      .filter((s) => s.beneficiario.toLowerCase().includes(q))
      .filter((s) => {
        if (vistos.has(s.beneficiario)) return false
        vistos.add(s.beneficiario)
        return true
      })
      .slice(0, 5)
  }, [query, historial])

  const serviciosBeneficiario = useMemo(() => {
    if (!seleccionado) return []
    return historial.filter((s) => s.beneficiario === seleccionado)
  }, [seleccionado, historial])

  const handleSeleccionar = (nombre) => {
    setSeleccionado(nombre)
    setQuery(nombre)
  }

  const handleLimpiar = () => {
    setQuery('')
    setSeleccionado(null)
  }

  const mostrarDropdown = sugerencias.length > 0 && !seleccionado

  return (
    <section className={styles.seccion}>

      <div className={styles.buscadorWrap}>
        {/* Input */}
        <div className={`${styles.inputRow} ${mostrarDropdown ? styles.inputRowOpen : ''}`}>
          <span className={styles.icono}><FiSearch /></span>
          <input
            className={styles.input}
            type="text"
            placeholder="Buscar beneficiario…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSeleccionado(null) }}
            autoComplete="off"
          />
          {query && (
            <button className={styles.limpiar} onClick={handleLimpiar} aria-label="Limpiar búsqueda">
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Dropdown en flujo normal — no sale del contenedor */}
        {mostrarDropdown && (
          <ul className={styles.dropdown} role="listbox">
            {sugerencias.map((s) => (
              <li key={s.beneficiario} role="option">
                <button
                  className={styles.dropdownItem}
                  onClick={() => handleSeleccionar(s.beneficiario)}
                >
                  {s.beneficiario}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tarjeta resultado */}
      {seleccionado && serviciosBeneficiario.length > 0 && (
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaHeader}>
            <div>
              <p className={styles.tarjetaNombre}>{seleccionado}</p>
              <p className={styles.tarjetaSub}>
                {serviciosBeneficiario.length} servicio{serviciosBeneficiario.length !== 1 ? 's' : ''} registrado{serviciosBeneficiario.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className={styles.tarjetaStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total acumulado</span>
                <span className={styles.statValor}>
                  {fmt(serviciosBeneficiario.reduce((acc, s) => acc + (s.cuotaTotal ?? 0), 0))}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total pagado</span>
                <span className={styles.statValor}>
                  {fmt(serviciosBeneficiario.reduce((acc, s) => acc + (s.montoPagado ?? 0), 0))}
                </span>
              </div>
            </div>
          </div>

          <ul className={styles.lista}>
            {serviciosBeneficiario.map((s) => (
              <li key={s.id} className={styles.listaItem}>
                <div className={styles.listaLeft}>
                  <span className={styles.listaFolio}>#{s.id}</span>
                  <div>
                    <p className={styles.listaNombre}>{s.nombre}</p>
                    <p className={styles.listaCat}>{s.categoria}</p>
                  </div>
                </div>
                <div className={styles.listaRight}>
                  <span className={styles.listaMonto}>{fmt(s.cuotaTotal)}</span>
                  <span className={`${styles.listaEstado} ${s.yaAporto ? styles.pagado : styles.pendiente}`}>
                    {s.yaAporto ? 'Pagado' : 'Pendiente'}
                  </span>
                  <button className="btn-ver" onClick={() => onVerDetalle?.(s)}>
                    Ver detalle
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}