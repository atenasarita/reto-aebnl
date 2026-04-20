import { useEffect, useState } from 'react'
import InventarioModalShell from '../InventarioModalShell/InventarioModalShell'
import { registrarMovimientoInventario } from '../../../../services/inventarioService'
import '../../../../pages/styles/Inventario.css'

export default function InventarioMovimientoModal({
  open,
  onClose,
  onExito,
  items,
  loading,
  loadError,
}) {
  const [idInventario, setIdInventario] = useState('')
  const [tipoMovimiento, setTipoMovimiento] = useState('entrada')
  const [cantidad, setCantidad] = useState('1')
  const [motivo, setMotivo] = useState('')
  const [fecha, setFecha] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    setIdInventario('')
    setTipoMovimiento('entrada')
    setCantidad('1')
    setMotivo('')
    setFecha('')
    setError(null)
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const id = Number(idInventario)
    const cant = Number(cantidad)
    if (!Number.isFinite(id) || id < 1) {
      setError('Selecciona un producto.')
      return
    }
    if (!Number.isFinite(cant) || cant < 1 || !Number.isInteger(cant)) {
      setError('La cantidad debe ser un entero mayor a 0.')
      return
    }
    const motivoTrim = motivo.trim()
    if (motivoTrim.length < 1 || motivoTrim.length > 20) {
      setError('El motivo es obligatorio y admite hasta 20 caracteres.')
      return
    }

    const payload = {
      id_inventario: id,
      tipo_movimiento: tipoMovimiento,
      cantidad: cant,
      motivo: motivoTrim,
    }
    if (fecha) {
      payload.fecha = new Date(fecha).toISOString()
    }

    setSubmitting(true)
    try {
      await registrarMovimientoInventario(payload)
      onExito?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <InventarioModalShell
      open={open}
      onClose={onClose}
      title="Registrar movimiento"
      subtitle="Entrada o salida de mercancía; el stock se actualiza al guardar."
    >
      {loading && (
        <p className="inventario-estado" role="status">
          Cargando productos…
        </p>
      )}
      {loadError && !loading && (
        <p className="inventario-estado inventario-estado--error" role="alert">
          {loadError}
        </p>
      )}

      {!loading && !loadError && (
        <form className="inventario-form inventario-form--modal" onSubmit={handleSubmit}>
          <div className="inventario-form__grid">
            <label className="inventario-form__field inventario-form__field--span2">
              <span>Producto</span>
              <select
                value={idInventario}
                onChange={(e) => setIdInventario(e.target.value)}
                required
                disabled={items.length === 0}
              >
                <option value="">Seleccionar…</option>
                {items.map((r) => (
                  <option key={r.ID_INVENTARIO} value={String(r.ID_INVENTARIO)}>
                    {r.CLAVE} — {r.NOMBRE} (stock: {r.CANTIDAD} {r.UNIDAD_MEDIDA ?? ''})
                  </option>
                ))}
              </select>
            </label>

            <label className="inventario-form__field">
              <span>Tipo de movimiento</span>
              <select
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value)}
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </label>

            <label className="inventario-form__field">
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                step="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
              />
            </label>

            <label className="inventario-form__field inventario-form__field--span2">
              <span>Motivo, máximo 20 caracteres</span>
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={20}
                required
                placeholder="Ej. Compra proveedor"
              />
            </label>

            <label className="inventario-form__field">
              <span>Fecha</span>
              <input
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </label>
          </div>

          {error && (
            <p className="inventario-estado inventario-estado--error" role="alert">
              {error}
            </p>
          )}

          <div className="inventario-form__acciones">
            <button type="button" className="inventario-form__btnSec" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="inventario-form__btnPri"
              disabled={submitting || items.length === 0}
            >
              {submitting ? 'Registrando…' : 'Registrar movimiento'}
            </button>
          </div>
        </form>
      )}
    </InventarioModalShell>
  )
}
