import { useEffect, useState } from 'react'
import InventarioModalShell from '../InventarioModalShell/InventarioModalShell'
import {
  getCategoriasInventario,
  updateProductoInventario,
} from '../../../../services/inventarioService'
import '../../../../pages/styles/Inventario.css'

function formDesdeProducto(producto) {
  if (!producto) {
    return {
      clave: '',
      nombre: '',
      id_categoria: '',
      unidad_medida: '',
      precio: '',
    }
  }
  return {
    clave: producto.CLAVE ?? '',
    nombre: producto.NOMBRE ?? '',
    id_categoria: producto.ID_CATEGORIA != null ? String(producto.ID_CATEGORIA) : '',
    unidad_medida: producto.UNIDAD_MEDIDA ?? '',
    precio: producto.PRECIO != null ? String(producto.PRECIO) : '',
  }
}

export default function InventarioEditarProductoModal({
  open,
  producto,
  onClose,
  onExito,
}) {
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(formDesdeProducto(null))
  const [loadingCats, setLoadingCats] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !producto) return
    setForm(formDesdeProducto(producto))
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
  }, [open, producto])

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
    const idInventario = Number(producto?.ID_INVENTARIO)
    if (!Number.isFinite(idInventario) || idInventario < 1) {
      setError('Producto no válido.')
      return
    }
    const idCat = Number(form.id_categoria)
    if (!Number.isFinite(idCat) || idCat < 1) {
      setError('Selecciona una categoría válida.')
      return
    }
    const precio = Number(form.precio)
    if (!Number.isFinite(precio) || precio < 0) {
      setError('Indica un precio válido (número mayor o igual a 0).')
      return
    }

    setSubmitting(true)
    try {
      await updateProductoInventario(idInventario, {
        clave: form.clave.trim(),
        nombre: form.nombre.trim(),
        id_categoria: idCat,
        unidad_medida: form.unidad_medida.trim(),
        precio,
      })
      onExito?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  if (!producto) return null

  const existencia =
    producto.CANTIDAD != null && producto.UNIDAD_MEDIDA
      ? `${producto.CANTIDAD} ${producto.UNIDAD_MEDIDA}`.trim()
      : String(producto.CANTIDAD ?? '—')

  return (
    <InventarioModalShell
      open={open}
      onClose={onClose}
      title="Editar producto"
      subtitle="Actualiza los datos del producto. La existencia se modifica con «Registrar movimiento»."
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
            <span>Existencia actual</span>
            <input value={existencia} readOnly disabled aria-readonly />
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
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </InventarioModalShell>
  )
}
