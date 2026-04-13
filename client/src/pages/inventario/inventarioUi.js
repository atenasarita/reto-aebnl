/** Utilidades puras: API → filas de tabla, filtros y opciones del select. */

export function formatPrecioMXN(valor) {
  const n = Number(valor)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(n)
}

function categoriaVisibleDesdeApi(row) {
  const desc = row.DESCRIPCION_CATEGORIA
  if (desc == null) return null
  const s = String(desc).trim()
  return s === '' ? null : s
}

export function etiquetaCategoriaDesdeApi(row) {
  const nombre = categoriaVisibleDesdeApi(row)
  if (nombre != null) return nombre
  if (row.ID_CATEGORIA != null) return `Categoría ${row.ID_CATEGORIA}`
  return '—'
}

/**
 * Una fila del JSON del backend → forma que usa InventarioTabla / filtros.
 */
export function mapInventarioApiRowToTableRow(row) {
  return {
    id: String(row.ID_INVENTARIO),
    id_categoria: row.ID_CATEGORIA,
    categoria: etiquetaCategoriaDesdeApi(row),
    nombre: row.NOMBRE ?? '',
    clave: row.CLAVE ?? '',
    cantidad: `${row.CANTIDAD ?? ''} ${row.UNIDAD_MEDIDA ?? ''}`.trim(),
    precio: formatPrecioMXN(row.PRECIO),
  }
}

export function buildCategoriaFilterOptions(filas) {
  const etiquetaPorId = new Map()
  for (const p of filas) {
    if (p.id_categoria != null && !etiquetaPorId.has(p.id_categoria)) {
      etiquetaPorId.set(p.id_categoria, p.categoria)
    }
  }
  const idsOrdenados = [...etiquetaPorId.keys()].sort(
    (a, b) => Number(a) - Number(b)
  )
  return [
    { label: 'Todas las categorías', value: '' },
    ...idsOrdenados.map((id) => ({
      label: etiquetaPorId.get(id) ?? `Categoría ${id}`,
      value: String(id),
    })),
  ]
}

export function filterInventarioTableRows(filas, { categoriaId, textoBusqueda }) {
  let lista = filas
  if (categoriaId) {
    lista = lista.filter((p) => String(p.id_categoria) === categoriaId)
  }
  const q = textoBusqueda.trim().toLowerCase()
  if (!q) return lista
  return lista.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q) ||
      p.clave.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
  )
}
