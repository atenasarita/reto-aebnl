import { useState, useEffect, useRef } from 'react'
import BeneficiarioCard from '../BeneficiarioCard/BeneficiarioCard'
import styles from './BeneficiarioGrid.module.css'
import Pagination from '../../../ui/Pagination'
import BeneficiarioModal from '../BeneficiarioDetalle/BeneficiarioModal'
import { downloadBeneficiarioPdf } from '../../../../utils/pdfFormatMembresia'
import { API_URL } from '../../../../utils/config'

const ITEMS_PER_PAGE = 8

function BeneficiarioGrid({
  data,
  loading,
  onRefresh,
  beneficiarioEditId = null,
  clearEditQuery,
  beneficiarioCreadoId,
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const openedCreatedBeneficiario = useRef(false)
  const animatedIds = useRef(new Set())

  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  useEffect(() => {
    if (!beneficiarioCreadoId || openedCreatedBeneficiario.current || loading) return

    const existenEnData = data.some(
      b => b.id_beneficiario === beneficiarioCreadoId
    )

    if (!existenEnData) return

    openedCreatedBeneficiario.current = true
    handleView(beneficiarioCreadoId)
  }, [beneficiarioCreadoId, data, loading])

  async function fetchBeneficiarioById(id) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/beneficiarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      throw new Error('No se pudo obtener la información del beneficiario.')
    }

    return await res.json()
  }

  async function handleView(id) {
    try {
      const beneficiario = await fetchBeneficiarioById(id)
      setSelected(beneficiario)
      setOpenInEditMode(false)
    } catch (error) {
      console.error('Error al abrir detalle:', error)
      alert('No se pudo abrir el detalle del beneficiario.')
    }
  }

  async function handleEdit(id) {
    try {
      const beneficiario = await fetchBeneficiarioById(id)
      setSelected(beneficiario)
      setOpenInEditMode(true)
    } catch (error) {
      console.error('Error al abrir edición:', error)
      alert('No se pudo abrir la edición del beneficiario.')
    }
  }

  useEffect(() => {
    if (!beneficiarioEditId || loading) return

    handleEdit(beneficiarioEditId)

    if (clearEditQuery) {
      clearEditQuery()
    }
  }, [beneficiarioEditId, loading])

  async function handleDownloadPdf(id) {
    try {
      const token = localStorage.getItem('token')

      const res = await fetch(`${API_URL}/api/beneficiarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('No se pudo obtener la información del beneficiario.')
      }

      const beneficiario = await res.json()

      const resPadres = await fetch(`${API_URL}/api/beneficiarios/${id}/padres`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (resPadres.ok) {
        beneficiario.padres = await resPadres.json()
      }

      downloadBeneficiarioPdf(beneficiario, id)
    } catch (error) {
      console.error('Error al descargar el PDF:', error)
      alert('Error al descargar el archivo PDF.')
    }
  }

  const normalized = data.map((b) => {
    const primerDiagnostico = b.tipo_espina && b.tipo_espina.length > 0
      ? b.tipo_espina[0]
      : null

    const diagnosticoTexto =
      primerDiagnostico?.id_espina === 9 && b.datos_medicos?.diagnostico_otro
        ? b.datos_medicos.diagnostico_otro
        : b.tipo_espina && b.tipo_espina.length > 0
          ? b.tipo_espina.map((tipo) => tipo.nombre).join(', ')
          : 'Sin diagnóstico'

    return {
      id_beneficiario: b.id_beneficiario,
      folio: b.folio,
      nombre: `${b.identificadores.nombres} ${b.identificadores.apellido_paterno} ${b.identificadores.apellido_materno ?? ''}`.trim(),
      diagnostico: diagnosticoTexto,
      diagnostico_otro: b.datos_medicos?.diagnostico_otro || '',
      estatus: b.estado === 'activo' ? 'Activo' : 'Inactivo',
      dias_para_vencer: b.dias_para_vencer,
    }
  })

  const paginated = normalized.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <div className={styles.state}>
        <span className={styles.stateText}>Cargando...</span>
      </div>
    )
  }

  if (!loading && data.length === 0) {
    return (
      <div className={styles.state}>
        <span className={styles.stateText}>No se encontraron beneficiarios.</span>
      </div>
    )
  }

  return (
    <>
      <div className={styles.grid}>
        {paginated.map((b, index) => {
          const isNew = !animatedIds.current.has(b.id_beneficiario)

          if (isNew) {
            animatedIds.current.add(b.id_beneficiario)
          }

          return (
            <div
              key={b.id_beneficiario}
              className={styles.cardEntrance}
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <BeneficiarioCard
                beneficiario={b}
                onView={() => handleView(b.id_beneficiario)}
                onEdit={() => handleEdit(b.id_beneficiario)}
                onCard={() => console.log('credencial', b.id_beneficiario)}
                onDownloadPdf={() => handleDownloadPdf(b.id_beneficiario)}
              />
            </div>
          )
        })}
      </div>

      <div className={styles.paginationEntrance}>
        <Pagination
          currentPage={currentPage}
          totalItems={normalized.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {selected && (
        <BeneficiarioModal
          beneficiario={selected}
          onClose={() => {
            setSelected(null)
            setOpenInEditMode(false)
          }}
          startInEditMode={openInEditMode}
          onUpdated={onRefresh}
        />
      )}
    </>
  )
}

export default BeneficiarioGrid