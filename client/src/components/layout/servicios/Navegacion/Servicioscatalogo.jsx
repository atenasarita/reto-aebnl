import { useState, useMemo } from 'react'
import { FiSearch } from 'react-icons/fi'
import SearchBar from '../../../ui/SearchBar'
import Dropdown from '../../../ui/Dropdown'
import styles from './Servicioscatalogo.module.css'
import PropTypes from 'prop-types'

function fmt(num) {
  if (num == null) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
}
function CategoriaChip({ categoria }) {
  return <span className={`${styles.chip} ${styles[`chip-${categoria?.toLowerCase().replace(/[^a-z]/g, '')}`] ?? ''}`}>{categoria}</span>
}

CategoriaChip.propTypes = {
  categoria: PropTypes.string,
}

function ServiciosCatalogo({ tipos = [], loading, onNuevoServicio }) {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  const categorias = useMemo(
    () =>
      [...new Set(tipos.map((t) => t.categoria).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'es')
      ),
    [tipos]
  )

  const categoriaOptions = useMemo(
    () => [
      { label: 'Todas las categorías', value: '' },
      ...categorias.map((c) => ({ label: c, value: c })),
    ],
    [categorias]
  )

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return tipos.filter((t) => {
      const matchCat = !categoriaFiltro || t.categoria === categoriaFiltro
      const matchText =
        !q ||
        t.nombre.toLowerCase().includes(q) ||
        t.categoria?.toLowerCase().includes(q)
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
      <div className={`${styles.barra} servicios-barra-acciones servicios-catalogo-barra`}>
        <SearchBar
          icon={<FiSearch />}
          className="search-gestion servicios-catalogo-busqueda"
          placeholder="Buscar servicio…"
          value={busqueda}
          onChange={setBusqueda}
        />
        <Dropdown
          className="dropdown-gestion servicios-catalogo-categoria"
          value={categoriaFiltro}
          onChange={setCategoriaFiltro}
          options={categoriaOptions}
        />
        <button
          type="button"
          className="btnPrimary servicios-catalogo-nuevo"
          onClick={onNuevoServicio}
        >
          + Nuevo servicio
        </button>
      </div>

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
              {filtrados.map((t) => (
                <tr key={t.id} className="recibo-row">
                  <td>{t.nombre}</td>
                  <td>
                    <CategoriaChip categoria={t.categoria} />
                  </td>
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

ServiciosCatalogo.propTypes = {
  tipos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    categoria: PropTypes.string,
    precio: PropTypes.number,
  })),
  loading: PropTypes.bool,
  onNuevoServicio: PropTypes.func,
}

export default ServiciosCatalogo
