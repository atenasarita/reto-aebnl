import { useEffect, useState } from 'react'
import InventarioModalShell from '../InventarioModalShell/InventarioModalShell'
import {
  createProductoInventario,
  getCategoriasInventario,
} from '../../../../services/inventarioService'
import '../../../../pages/styles/Inventario.css'

const initialForm = {
  clave: '',
  nombre: '',
  id_categoria: '',
  unidad_medida: '',
  precio: '',
  cantidad: '0',
}

export default function InventarioNuevoProductoModal({ open, onClose, onExito }) {
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loadingCats, setLoadingCats] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    setForm(initialForm)
    setError(null)
    let cancelled = false
    setLoadingCats(true)
    ;(async () => {
      try {
        const rows = await getCategoriasInventario()
        if (!cancelled) setCategorias(rows)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías')
        }
      } finally {
        if (!cancelled) setLoadingCats(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const idCat = Number(form.id_categoria)
    if (!Number.isFinite(idCat) || idCat < 1) {
      setError('Selecciona una categoría válida.')
      return
    }
    const precio = Number(form.precio)
    const cantidad = Number(form.cantidad)
    if (!Number.isFinite(precio) || precio < 0) {
      setError('Indica un precio válido (número mayor o igual a 0).')
      return
    }
    if (!Number.isFinite(cantidad) || cantidad < 0 || !Number.isInteger(cantidad)) {
      setError('La cantidad inicial debe ser un entero mayor o igual a 0.')
      return
    }

    setSubmitting(true)
    try {
      await createProductoInventario({
        clave: form.clave.trim(),
        nombre: form.nombre.trim(),
        id_categoria: idCat,
        unidad_medida: form.unidad_medida.trim(),
        precio,
        cantidad,
        activo: cantidad > 0 ? '1' : '0',
      })
      onExito?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <InventarioModalShell
      open={open}
      onClose={onClose}
      title="Nuevo producto"
      subtitle="Alta en Inventario: clave única, categoría, unidad, precio y existencias."
    >
      <form className="inventario-form inventario-form--modal" onSubmit={handleSubmit}>
        <div className="inventario-form__grid">
          <label className="inventario-form__field">
            <span>Clave única</span>
            <input
              name="clave"
              value={form.clave}
              onChange={handleChange}
              maxLength={10}
              required
              autoComplete="off"
            />
          </label>
          <label className="inventario-form__field">
            <span>Nombre</span>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              maxLength={20}
              required
            />
          </label>
          <label className="inventario-form__field inventario-form__field--span2">
            <span>Categoría</span>
            <select
              name="id_categoria"
              value={form.id_categoria}
              onChange={handleChange}
              required
              disabled={loadingCats || categorias.length === 0}
            >
              <option value="">Seleccionar…</option>
              {categorias.map((c) => (
                <option key={c.ID_CATEGORIA} value={String(c.ID_CATEGORIA)}>
                  {(c.DESCRIPCION ?? '').trim() || `Categoría ${c.ID_CATEGORIA}`}
                </option>
              ))}
            </select>
          </label>
          <label className="inventario-form__field">
            <span>Unidad de medida</span>
            <input
              name="unidad_medida"
              value={form.unidad_medida}
              onChange={handleChange}
              maxLength={20}
              placeholder="p. ej. pieza, caja, ml"
              required
            />
          </label>
          <label className="inventario-form__field">
            <span>Precio</span>
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </label>
          <label className="inventario-form__field">
            <span>Cantidad inicial</span>
            <input
              name="cantidad"
              type="number"
              min="0"
              step="1"
              value={form.cantidad}
              onChange={handleChange}
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
            disabled={submitting || loadingCats || categorias.length === 0}
          >
            {submitting ? 'Guardando…' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </InventarioModalShell>
  )
}
