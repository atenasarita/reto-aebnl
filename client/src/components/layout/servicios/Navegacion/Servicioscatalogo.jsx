import { useState, useMemo } from 'react'
import { FiSearch } from 'react-icons/fi'
import styles from './Servicioscatalogo.module.css'

function fmt(num) {
  if (num == null) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
}

function CategoriaChip({ categoria }) {
  return <span className={`${styles.chip} ${styles[`chip-${categoria?.toLowerCase().replace(/[^a-z]/g, '')}`] ?? ''}`}>{categoria}</span>
}

export default function ServiciosCatalogo({ tipos = [], loading, onNuevoServicio }) {
  const [busqueda, setBusqueda]           = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  const categorias = useMemo(() => [...new Set(tipos.map(t => t.categoria).filter(Boolean))], [tipos])

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return tipos.filter(t => {
      const matchCat  = !categoriaFiltro || t.categoria === categoriaFiltro
      const matchText = !q || t.nombre.toLowerCase().includes(q) || t.categoria?.toLowerCase().includes(q)
      return matchCat && matchText
    })
  }, [tipos, busqueda, categoriaFiltro])

  if (loading) {
    return (
      <div className="skeleton-wrap" role="status" aria-label="Cargando catálogo">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.07}s` }} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      {/* Barra */}
      <div className={styles.barra}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar servicio…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filtrosCats}>
          <button
            className={`${styles.catFiltroBtn} ${categoriaFiltro === '' ? styles.catFiltroBtnActive : ''}`}
            onClick={() => setCategoriaFiltro('')}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              className={`${styles.catFiltroBtn} ${categoriaFiltro === cat ? styles.catFiltroBtnActive : ''}`}
              onClick={() => setCategoriaFiltro(cat === categoriaFiltro ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button className="inventario-form__btnPri" onClick={onNuevoServicio}>
          + Nuevo servicio
        </button>
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <p className="estado-msg">No hay servicios que coincidan.</p>
      ) : (
        <div className="table-wrap">
          <table className="servicios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th className="text-right">Precio</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(t => (
                <tr key={t.id} className="recibo-row">
                  <td>{t.nombre}</td>
                  <td><CategoriaChip categoria={t.categoria} /></td>
                  <td className="text-right">{fmt(t.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="tabla-footer">
        {filtrados.length} de {tipos.length} servicios
      </p>
    </div>
  )
}