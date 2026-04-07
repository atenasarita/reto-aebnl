// BeneficiarioGrid.jsx
import { useState, useEffect } from 'react'
import BeneficiarioCard from '../BeneficiarioCard/BeneficiarioCard'
import styles from './BeneficiarioGrid.module.css'
import Pagination from '../../../ui/Pagination'

const ITEMS_PER_PAGE = 8

function BeneficiarioGrid({ data, loading }) {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  // normalizar API
  const normalized = data.map((b) => ({
    id_beneficiario: b.id_beneficiario,
    folio:           b.folio,
    nombre:          `${b.identificadores.nombres} ${b.identificadores.apellido_paterno} ${b.identificadores.apellido_materno ?? ''}`.trim(),
    diagnostico:     b.tipo_espina?.[0]?.tipo ?? 'Sin diagnóstico',
    estatus:         b.estado === 'activo' ? 'Activo' : 'Inactivo',
  }))

  const paginated = normalized.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) return (
    <div className={styles.state}>
      <span className={styles.stateText}>Cargando...</span>
    </div>
  )

  if (!loading && data.length === 0) return (
    <div className={styles.state}>
      <span className={styles.stateText}>No se encontraron beneficiarios.</span>
    </div>
  )

  return (
    <>
      <div className={styles.grid}>
        {paginated.map((b) => (
          <BeneficiarioCard
            key={b.id_beneficiario}
            beneficiario={b}
            onView={() => console.log('ver', b.id_beneficiario)}
            onEdit={() => console.log('editar', b.id_beneficiario)}
            onCard={() => console.log('credencial', b.id_beneficiario)}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={normalized.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </>
  )
}

export default BeneficiarioGrid