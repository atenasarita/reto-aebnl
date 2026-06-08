import InventarioModalShell from '../../inventario/InventarioModalShell/InventarioModalShell.jsx'



function Campo({ label, value }) {
  return (
    <label className="inventario-form__field">
      <span>{label}</span>
      <input value={value ?? '—'} readOnly tabIndex={-1} />
    </label>
  )
}

export default function ServiciosDetalleModal({ open, onClose, servicio }) {
  if (!servicio) return null

  return (
    <InventarioModalShell
      open={open}
      onClose={onClose}
      title="Detalle del servicio"
      subtitle={`ID #${servicio.id} · ${servicio.nombre}`}
    >
      <div className="inventario-form inventario-form--modal">
        <div className="inventario-form__grid">
          <Campo label="Fecha de registro"  value={servicio.fechaFormateada} />
          <Campo label="Beneficiario"      value={servicio.beneficiario} />
          <Campo label="Servicio"          value={servicio.nombre} />
          <Campo label="Categoría"         value={servicio.categoria} />
          <Campo label="Método de pago"    value={servicio.metodoPago} />
          <Campo label="Monto servicio"    value={servicio.montoServicioFormateado} />
          <Campo label="Monto inventario"  value={servicio.montoInventarioFormateado} />
          <Campo label="Descuento"         value={servicio.descuentoFormateado} />
          <Campo label="Cuota total"       value={servicio.cuotaTotalFormateado} />
          <Campo label="Monto pagado"      value={servicio.montoPagadoFormateado} />
          <Campo
            label="Ya aportó"
            value={servicio.yaAporto === 1 ? 'Sí' : servicio.yaAporto === 0 ? 'No' : '—'}
          />
        </div>

        <div className="inventario-form__acciones">
          <button className="inventario-form__btnPri" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </InventarioModalShell>
  )
}