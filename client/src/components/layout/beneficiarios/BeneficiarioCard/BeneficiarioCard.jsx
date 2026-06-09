import PropTypes from 'prop-types'
import styles from './BeneficiarioCard.module.css'
import { FiEdit, FiEye, FiDownload } from "react-icons/fi";

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function BeneficiarioCard({ beneficiario, onView, onEdit, onDownloadPdf }) {
  const { nombre, folio, diagnostico, estatus, dias_para_vencer } = beneficiario

  const showVenceBadge =
    dias_para_vencer !== undefined &&
    dias_para_vencer !== null &&
    dias_para_vencer >= 0 &&
    dias_para_vencer <= 7;

  return (
    <div className={styles.card}>
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

      <div className={styles.diagnostico}>
        <span className={styles.diagnosticoLabel}>DIAGNÓSTICO</span>
        <span className={styles.diagnosticoValue}>{diagnostico}</span>
      </div>

      <div className={styles.actions}>
        {showVenceBadge && (
          <span className={styles.venceBadge}>
            {dias_para_vencer === 0
              ? 'Vence hoy'
              : `Vence en ${dias_para_vencer} día${dias_para_vencer === 1 ? '' : 's'}`}
          </span>
        )}

        <button className={styles.actionBtn} onClick={onDownloadPdf} title="Descargar PDF">
          <FiDownload />
        </button>

        <button
          className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
          onClick={onEdit}
          title="Editar perfil"
        >
          <FiEdit />
        </button>

        <button
          className={`${styles.actionBtn} ${styles.actionBtnView}`}
          onClick={onView}
          title="Ver detalle"
        >
          <FiEye />
        </button>
      </div>
    </div>
  )
}

BeneficiarioCard.propTypes = {
  beneficiario: PropTypes.shape({
    nombre: PropTypes.string.isRequired,
    folio: PropTypes.string,
    diagnostico: PropTypes.string,
    estatus: PropTypes.string,
    dias_para_vencer: PropTypes.number,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDownloadPdf: PropTypes.func.isRequired,
}

export default BeneficiarioCard