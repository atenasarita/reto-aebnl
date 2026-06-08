import InventarioModalShell from '../../inventario/InventarioModalShell/InventarioModalShell.jsx'
import styles from './ServiciosDetalleModal.module.css'

function Campo({ label, value, muted = false }) {
  const empty = value == null || value === ''
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={empty || muted ? styles.valueMuted : styles.value}>
        {empty ? '—' : value}
      </span>
    </div>
  )
}

export default function ServiciosDetalleModal({ open, onClose, servicio }) {
  if (!servicio) return null

  const yaAporto =
    servicio.yaAporto === 1 ? 'Sí' :
    servicio.yaAporto === 0 ? 'No' : null

  return (
    <InventarioModalShell
      open={open}
      onClose={onClose}
      title="Detalle del servicio"
      subtitle={`Folio #${servicio.id} · ${servicio.nombre}`}
    >
      <div className={styles.body}>

        <section className={styles.section}>
          <div className={styles.grid}>
            <Campo label="Fecha de registro" value={servicio.fechaFormateada} />
            <Campo label="Beneficiario"      value={servicio.beneficiario} />
            <Campo label="Servicio"          value={servicio.nombre} />
            <Campo label="Categoría"         value={servicio.categoria} />
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Información financiera</h3>
          <div className={styles.grid}>
            <Campo label="Método de pago"   value={servicio.metodoPago} />
            <Campo label="Monto servicio"   value={servicio.montoServicioFormateado} />
            <Campo label="Monto insumos" value={servicio.montoInventarioFormateado} />
            <Campo label="Descuento"        value={servicio.descuentoFormateado} />
            <Campo label="Cuota total"      value={servicio.cuotaTotalFormateado} />
            <Campo label="Monto pagado"     value={servicio.montoPagadoFormateado} />
            <div className={styles.field}>
              <span className={styles.label}>Ya aportó</span>
              {yaAporto != null ? (
                <span className={`${styles.badge} ${yaAporto === 'Sí' ? styles.badgeYes : styles.badgeNo}`}>
                  {yaAporto}
                </span>
              ) : (
                <span className={styles.valueMuted}>—</span>
              )}
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button className={styles.btnClose} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </InventarioModalShell>
  )
}
