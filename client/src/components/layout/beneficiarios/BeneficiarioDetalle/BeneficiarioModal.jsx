import { useState } from 'react';
import styles from './BeneficiarioDetalle.module.css';
import TabsNavegacion from './TabsNavegacion';
import BeneficiarioDetalle from './BeneficiarioDetalle';
import HistorialAsociado from './HistorialAsociado';
// import HistorialPadres from './HistorialPadres';

function BeneficiarioModal({ beneficiario, onClose }) {
  const [activeTab, setActiveTab] = useState('datos_generales');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <TabsNavegacion 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} />
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {activeTab === 'datos_generales' && (
          <BeneficiarioDetalle beneficiario={beneficiario} />
        )}

        {activeTab === 'historial_asociado' && (
          <HistorialAsociado beneficiario={beneficiario} />
        )}

        {/* {activeTab === 'historial_padres' && (
          <HistorialPadres beneficiario={beneficiario} />
        )} */}
      </div>
    </div>
  );
}

export default BeneficiarioModal;