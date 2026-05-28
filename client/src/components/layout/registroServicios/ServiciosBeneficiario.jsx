import { useState, useMemo } from 'react'
import styles from './ServiciosBeneficiario.module.css'
import '../../../pages/styles/Servicios.css'

import SearchBar from '../../ui/SearchBar'
import { FiSearch } from 'react-icons/fi'


function fmt(num) {
  if (num == null) return '—'
  return `$${Number(num).toFixed(2)}`
}

export default function ServiciosBeneficiario({ historial = [], onVerDetalle }) {
  const [query, setQuery] = useState('')
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

  const handleChange = (val) => {
    setQuery(val)
    setSeleccionado(null)
  }

  return (
    <section>
      <div className={styles.buscadorWrap}>
        <div className={styles.inputWrap}>
          <SearchBar
              icon={<FiSearch />}
              className={styles.input}
              placeholder="Buscar beneficiario…"
              value={query}
              onChange={handleChange}
              autoComplete="off"
            />
          {query && (
            <button
              className={styles.limpiar}
              onClick={() => { setQuery(''); setSeleccionado(null) }}
              aria-label="Limpiar"
            >
              ✕
            </button>
          )}
        </div>

        {sugerencias.length > 0 && !seleccionado && (
          <ul className='lista'>
            {sugerencias.map((s) => (
              <li key={s.beneficiario}>
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

      {seleccionado && serviciosBeneficiario.length > 0 && (
        <div className='beneficiario-card'>
          <div>
            <div>
              <p>{seleccionado}</p>
              <p>
                {serviciosBeneficiario.length} servicio{serviciosBeneficiario.length !== 1 ? 's' : ''} registrado{serviciosBeneficiario.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <div>
                <span>Total acumulado</span>
                <span>
                  {fmt(serviciosBeneficiario.reduce((acc, s) => acc + (s.cuotaTotal ?? 0), 0))}
                </span>
              </div>
              <div>
                <span>Total pagado</span>
                <span className={styles.statValor}>
                  {fmt(serviciosBeneficiario.reduce((acc, s) => acc + (s.montoPagado ?? 0), 0))}
                </span>
              </div>
            </div>
          </div>

          <ul className='lista'>
            {serviciosBeneficiario.map((s) => (
              <li key={s.id} className='listaItem'>
                <div className='listaLeft'>
                  <span className='listaFolio'>#{s.id}</span>
                  <div>
                    <p className='listaNombre'>{s.nombre}</p>
                    <p className='listaCat'>{s.categoria}</p>
                  </div>
                </div>
                <div className='listaRight'>
                  <span className='listaMonto'>{fmt(s.cuotaTotal)}</span>
                  <span className={`listaEstado ${s.yaAporto ? 'pagado' : 'pendiente'}`}>
                    {s.yaAporto ? 'Pagado' : 'Pendiente'}
                  </span>
                  <button
                    className="inventario-form__btnSec"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                    onClick={() => onVerDetalle?.(s)}
                  >
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