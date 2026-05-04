import { useState, useEffect } from 'react'
import BeneficiarioCard from '../BeneficiarioCard/BeneficiarioCard'
import styles from './BeneficiarioGrid.module.css'
import Pagination from '../../../ui/Pagination'
// import BeneficiarioDetalle from '../BeneficiarioDetalle/BeneficiarioDetalle'
import BeneficiarioModal from '../BeneficiarioDetalle/BeneficiarioModal'
import { espinaBifidaOptions } from '../../../../utils/espinaBifidaTypes'
import { downloadBeneficiarioPdf } from '../../../../utils/pdfFormatMembresia'

const ITEMS_PER_PAGE = 8

function BeneficiarioGrid({ data, loading }) {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  const [selected, setSelected] = useState(null)

  async function handleView(id) {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:3000/api/beneficiarios/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setSelected(data)
  }

  async function handleDownloadPdf(id) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/beneficiarios/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('No se pudo obtener la información del beneficiario.');
      }
      
      const data = await res.json();
      
      downloadBeneficiarioPdf(data, id);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('Error al descargar el archivo PDF.');
    }
  }

  const normalized = data.map((b) => {
    const diagnosticoTexto =
      b.tipo_espina && b.tipo_espina.length > 0
        ? b.tipo_espina.map(tipo => tipo.nombre).join(', ')
        : 'Sin diagnóstico'

    return {
      id_beneficiario: b.id_beneficiario,
      folio: b.folio,
      nombre: `${b.identificadores.nombres} ${b.identificadores.apellido_paterno} ${b.identificadores.apellido_materno ?? ''}`.trim(),
      diagnostico: diagnosticoTexto,
      estatus: b.estado === 'activo' ? 'Activo' : 'Inactivo',
      dias_para_vencer: b.dias_para_vencer,
    }
  })

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
            onView={() => handleView(b.id_beneficiario)} // ← fixed
            onEdit={() => console.log('editar', b.id_beneficiario)}
            onCard={() => console.log('credencial', b.id_beneficiario)}
            onDownloadPdf={() => handleDownloadPdf(b.id_beneficiario)}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={normalized.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {selected && (
        <BeneficiarioModal
          beneficiario={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

export default BeneficiarioGrid