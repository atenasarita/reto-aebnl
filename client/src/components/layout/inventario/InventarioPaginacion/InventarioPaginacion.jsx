import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import styles from './InventarioPaginacion.module.css'

function InventarioPaginacion({
  paginaActual,
  totalItems,
  itemsPorPagina,
  onCambiarPagina,
}) {
  const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina))
  const inicio = totalItems === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1
  const fin = Math.min(paginaActual * itemsPorPagina, totalItems)

  const obtenerPaginas = () => {
    if (totalPaginas <= 4) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    }
    if (paginaActual <= 2) {
      return [1, 2, '...', totalPaginas]
    }
    if (paginaActual >= totalPaginas - 1) {
      return [1, '...', totalPaginas - 1, totalPaginas]
    }
    return [1, '...', paginaActual, '...', totalPaginas]
  }

  return (
    <footer className={styles.pie}>
      <p className={styles.resumen}>
        Mostrando {inicio} a {fin} de {totalItems} resultados
      </p>
      <div className={styles.controles}>
        <button
          type="button"
          className={styles.btnNav}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual <= 1}
          aria-label="Página anterior"
        >
          <FiChevronLeft size={22} />
        </button>
        {obtenerPaginas().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>
              ..
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${styles.btnPagina} ${paginaActual === p ? styles.btnPaginaActiva : ''}`}
              onClick={() => onCambiarPagina(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className={styles.btnNav}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          aria-label="Página siguiente"
        >
          <FiChevronRight size={22} />
        </button>
      </div>
    </footer>
  )
}

export default InventarioPaginacion
