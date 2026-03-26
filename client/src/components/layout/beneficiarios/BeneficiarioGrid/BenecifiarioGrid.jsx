import { useState, useEffect } from 'react'
import BeneficiarioCard from '../BeneficiarioCard/BeneficiarioCard'
import styles from './BeneficiarioGrid.module.css'

import Pagination from '../../../ui/Pagination'

const MOCK_DATA = [
  { id: 1, nombre: 'Manuel Perez', folio: 'ASEB-2026-001', diagnostico: 'Espina Bifida Oculta', estatus: 'Activo' },
  { id: 2, nombre: 'Ignacio Osuna', folio: 'ASEB-2026-002', diagnostico: 'Meningocele', estatus: 'Inactivo' },
  { id: 3, nombre: 'Ana Ruiz', folio: 'ASEB-2026-003', diagnostico: 'Hidrocefalia, asociada con otros síntomas neurológicos', estatus: 'Activo' },
  { id: 4, nombre: 'Carlos Gomez', folio: 'ASEB-2026-004', diagnostico: 'Lipomeningocele', estatus: 'Inactivo' },
  { id: 5, nombre: 'Laura Mendez', folio: 'ASEB-2026-005', diagnostico: 'Espina Bifida Abierta', estatus: 'Activo' },
  { id: 6, nombre: 'Juan Perez', folio: 'ASEB-2026-006', diagnostico: 'Mielomeningocele', estatus: 'Activo' },
]

const ITEMS_PER_PAGE = 8;

function BeneficiarioGrid() {
  const [beneficiarios, setBeneficiarios] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)

  // slice mock data (later your API will handle this)
  const paginated = MOCK_DATA.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    // TODO: conectar backend
    // const response = await fetch('/api/beneficiarios')
    setBeneficiarios(MOCK_DATA)
    setLoading(false)
  }, [])

  if (loading) return <div className={styles.state}><span className={styles.stateText}>Cargando...</span></div>

  return (
    <>
    <div className={styles.grid}>
        {beneficiarios.map((b) => (
            <BeneficiarioCard
            key={b.id}
            beneficiario={b}
            onView={() => console.log('ver', b.id)}
            onEdit={() => console.log('editar', b.id)}
            onCard={() => console.log('credencial', b.id)}
            />
        ))}
    </div>

    <Pagination
        currentPage={currentPage}
        totalItems={MOCK_DATA.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
    />
    </>
    
  )
}

export default BeneficiarioGrid