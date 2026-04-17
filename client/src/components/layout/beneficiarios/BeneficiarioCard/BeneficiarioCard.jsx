import styles from './BeneficiarioCard.module.css'
import { BsCardText } from "react-icons/bs";
import { FiEdit, FiEye } from "react-icons/fi";


function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function BeneficiarioCard({ beneficiario, onView, onEdit, onCard }) {
  const { nombre, folio, diagnostico, estatus, dias_para_vencer } = beneficiario

  const showVenceBadge = dias_para_vencer !== undefined && dias_para_vencer !== null && dias_para_vencer >= 0 && dias_para_vencer <= 7;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>{getInitials(nombre)}</div>
        <div className={styles.info}>
          <span className={styles.nombre}>{nombre}</span>
          <span className={styles.folio}>{folio}</span>
        </div>
        <span className={`${styles.badge} ${estatus === 'Activo' ? styles.activo : styles.inactivo}`}>
          {estatus}
        </span>
      </div>

      {/* Diagnostico */}
      <div className={styles.diagnostico}>
        <span className={styles.diagnosticoLabel}>DIAGNÓSTICO</span>
        <span className={styles.diagnosticoValue}>{diagnostico}</span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {showVenceBadge && (
          <span className={styles.venceBadge}>
            {dias_para_vencer === 0 ? 'Vence hoy' : `Vence en ${dias_para_vencer} día${dias_para_vencer === 1 ? '' : 's'}`}
          </span>
        )}
        <button className={styles.actionBtn} onClick={onCard} title="Ver credencial">
          <BsCardText />
        </button>
        <button className={styles.actionBtn} onClick={onEdit} title="Editar">
          <FiEdit />
        </button>
        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} onClick={onView} title="Ver detalle">
          <FiEye />
        </button>
      </div>
    </div>
  )
}

export default BeneficiarioCard