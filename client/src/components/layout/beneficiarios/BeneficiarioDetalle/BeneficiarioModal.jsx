import { useEffect, useState } from 'react'
import styles from './BeneficiarioDetalle.module.css'
import TabsNavegacion from './TabsNavegacion'
import BeneficiarioDetalle from './BeneficiarioDetalle'
import HistorialAsociado from './HistorialAsociado'
import HistorialPadres from './HistorialPadres'
import MembresiaTab from './MembresiaTab'

function BeneficiarioModal({
  beneficiario,
  onClose,
  startInEditMode = false,
  onUpdated
}) {
  const [activeTab, setActiveTab] = useState('datos_generales')

  useEffect(() => {
    setActiveTab('datos_generales')
  }, [beneficiario])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Cerrar ventana"
        onClick={onClose}
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de beneficiario"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <TabsNavegacion
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {activeTab === 'datos_generales' && (
          <BeneficiarioDetalle
            beneficiario={beneficiario}
            startInEditMode={startInEditMode}
            onUpdated={onUpdated}
            onClose={onClose}
          />
        )}

        {activeTab === 'historial_asociado' && (
          <HistorialAsociado beneficiario={beneficiario} />
        )}

        {activeTab === 'historial_padres' && (
          <HistorialPadres
            beneficiario={beneficiario}
            onUpdated={onUpdated}
          />
        )}

        {activeTab === 'membresia' && (
          <MembresiaTab
            beneficiario={beneficiario}
            onUpdated={onUpdated}
          />
        )}
      </div>
    </div>
  )
}

export default BeneficiarioModal