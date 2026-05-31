import { useEffect, useState, useRef } from 'react'
import InventarioModalShell from '../../components/layout/inventario/InventarioModalShell/InventarioModalShell'

const CATEGORIAS_DEFAULT = [
  'Consultas',
  'Estudios',
  'Laboratorio',
  'Procedimiento',
  'Rehabilitación',
  'Terapia',
  'Material',
]

const initialForm = {
  nombre: '',
  precio: '',
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (j === 0 ? i : 0))
  )
  for (let j = 1; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function esSimilar(a, b) {
  const al = a.toLowerCase().trim()
  const bl = b.toLowerCase().trim()
  if (al === bl) return true
  if (al.includes(bl) || bl.includes(al)) return true
  return levenshtein(al, bl) <= 2
}

export default function ServiciosNuevoServicioModal({
  open,
  onClose,
  onExito,
  serviciosExistentes = [],
  categoriasExtras = [],
  onNuevaCategoria,
}) {
  const [form, setForm] = useState(initialForm)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [categoriasCustom, setCategoriasCustom] = useState([])
  const [mostrarNuevaCat, setMostrarNuevaCat] = useState(false)
  const [nuevaCatInput, setNuevaCatInput] = useState('')
  const [sugerenciaNombre, setSugerenciaNombre] = useState(null)
  const [sugerenciaCategoria, setSugerenciaCategoria] = useState(null)
  const [sugerenciaNuevaCat, setSugerenciaNuevaCat] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const nuevaCatRef = useRef(null)

  const todasCategorias = [
    ...CATEGORIAS_DEFAULT,
    ...categoriasExtras,
    ...categoriasCustom,
  ]

  useEffect(() => {
    if (!open) return
    setForm(initialForm)
    setCategoriaSeleccionada('')
    setCategoriasCustom([])
    setMostrarNuevaCat(false)
    setNuevaCatInput('')
    setSugerenciaNombre(null)
    setSugerenciaCategoria(null)
    setSugerenciaNuevaCat(null)
    setError(null)
  }, [open])

  useEffect(() => {
    if (mostrarNuevaCat && nuevaCatRef.current) {
      nuevaCatRef.current.focus()
    }
  }, [mostrarNuevaCat])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'nombre') {
      if (value.trim().length >= 3) {
        const similar = serviciosExistentes.find(
          (s) =>
            esSimilar(s.nombre, value) &&
            s.nombre.toLowerCase() !== value.toLowerCase()
        )
        setSugerenciaNombre(similar ? similar.nombre : null)
      } else {
        setSugerenciaNombre(null)
      }
    }
  }

  const handleSeleccionarCategoria = (cat) => {
    setCategoriaSeleccionada(cat)
    setSugerenciaCategoria(null)
    setMostrarNuevaCat(false)
    setNuevaCatInput('')
    setSugerenciaNuevaCat(null)
  }

  const handleNuevaCatInput = (e) => {
    const val = e.target.value
    setNuevaCatInput(val)
    if (val.trim().length >= 3) {
      const similar = todasCategorias.find(
        (c) =>
          esSimilar(c, val) && c.toLowerCase() !== val.toLowerCase()
      )
      setSugerenciaNuevaCat(similar || null)
    } else {
      setSugerenciaNuevaCat(null)
    }
  }

  const handleAgregarCategoria = () => {
    const val = nuevaCatInput.trim()
    if (!val) return
    if (todasCategorias.some((c) => c.toLowerCase() === val.toLowerCase())) {
      setSugerenciaCategoria('duplicado')
      return
    }
    setCategoriasCustom((prev) => [...prev, val])
    onNuevaCategoria?.(val)
    setCategoriaSeleccionada(val)
    setMostrarNuevaCat(false)
    setNuevaCatInput('')
    setSugerenciaNuevaCat(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.nombre.trim()) {
      setError('Ingresa el nombre del servicio.')
      return
    }
    if (!categoriaSeleccionada) {
      setError('Selecciona una categoría.')
      return
    }
    const precio = Number(form.precio)
    if (form.precio === '' || !Number.isFinite(precio) || precio < 0) {
      setError('Indica un precio válido (número mayor o igual a 0).')
      return
    }

    setSubmitting(true)
    try {
      // TODO: reemplaza con tu llamada al servicio real
      // await createServicio({ nombre: form.nombre.trim(), categoria: categoriaSeleccionada, precio })
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
      title="Registrar nuevo servicio"
      subtitle="Alta en el catálogo: nombre, categoría y precio."
    >
      <form className="inventario-form inventario-form--modal" onSubmit={handleSubmit}>
        <div className="inventario-form__grid">

          {/* Nombre */}
          <label className="inventario-form__field inventario-form__field--span2">
            <span>Nombre del servicio</span>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              maxLength={60}
              required
              autoComplete="off"
              placeholder="Ej. Consulta general"
            />
            {sugerenciaNombre && (
              <p className="inventario-form__sugerencia">
                ¿Quisiste decir{' '}
                <button
                  type="button"
                  className="inventario-form__sugerencia-btn"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, nombre: sugerenciaNombre }))
                    setSugerenciaNombre(null)
                  }}
                >
                  {sugerenciaNombre}
                </button>
                ?
              </p>
            )}
          </label>

          {/* Categoría */}
          <div className="inventario-form__field inventario-form__field--span2">
            <span>Categoría</span>
            <div className="inventario-form__cat-grid">
              {todasCategorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`inventario-form__cat-btn${categoriaSeleccionada === cat ? ' inventario-form__cat-btn--selected' : ''}`}
                  onClick={() => handleSeleccionarCategoria(cat)}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                className="inventario-form__cat-btn inventario-form__cat-btn--nueva"
                onClick={() => setMostrarNuevaCat((v) => !v)}
              >
                + Nueva
              </button>
            </div>

            {mostrarNuevaCat && (
              <div className="inventario-form__nueva-cat-row">
                <input
                  ref={nuevaCatRef}
                  type="text"
                  value={nuevaCatInput}
                  onChange={handleNuevaCatInput}
                  maxLength={40}
                  placeholder="Nombre de nueva categoría"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarCategoria())}
                />
                <button
                  type="button"
                  className="inventario-form__btnPri"
                  onClick={handleAgregarCategoria}
                >
                  Agregar
                </button>
              </div>
            )}

            {sugerenciaNuevaCat && (
              <p className="inventario-form__sugerencia">
                ¿Quisiste decir{' '}
                <button
                  type="button"
                  className="inventario-form__sugerencia-btn"
                  onClick={() => {
                    handleSeleccionarCategoria(sugerenciaNuevaCat)
                    setMostrarNuevaCat(false)
                    setNuevaCatInput('')
                    setSugerenciaNuevaCat(null)
                  }}
                >
                  {sugerenciaNuevaCat}
                </button>
                ?
              </p>
            )}

            {sugerenciaCategoria === 'duplicado' && (
              <p className="inventario-estado inventario-estado--error" role="alert">
                Esa categoría ya existe.
              </p>
            )}
          </div>

          {/* Precio */}
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
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : 'Guardar servicio'}
          </button>
        </div>
      </form>
    </InventarioModalShell>
  )
}