import styles from './BeneficiarioCard.module.css'

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function BeneficiarioCard({ beneficiario, onView, onEdit, onCard }) {
  const { nombre, folio, diagnostico, estatus } = beneficiario

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
        <button className={styles.actionBtn} onClick={onCard} title="Ver credencial">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M16 10h2M16 14h2M6 10h6M6 14h4" />
          </svg>
        </button>
        <button className={styles.actionBtn} onClick={onEdit} title="Editar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} onClick={onView} title="Ver detalle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default BeneficiarioCard