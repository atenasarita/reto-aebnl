import styles from './styles/Pagination.module.css'

function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  const getPages = () => {
    if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 2) return [1, 2, '...', totalPages]
    if (currentPage >= totalPages - 1) return [1, '...', totalPages - 1, totalPages]
    return [1, '...', currentPage, '...', totalPages]
  }

  return (
    <div className={styles.footer}>
      <span className={styles.summary}>
        Mostrando {start} a {end} de {totalItems} resultados
      </span>
      <div className={styles.pages}>
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className={styles.dots}>...</span>
          ) : (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Pagination