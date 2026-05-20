/** Misma lógica que el backend para vista previa en el formulario de alta. */

export function prefijoClaveDesdeCategoria(descripcion) {
  const sinAcentos = String(descripcion ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const soloLetras = sinAcentos.toLowerCase().replace(/[^a-z]/g, '')
  return (soloLetras + 'gen').slice(0, 3)
}

export function formatearClaveInventario(prefijo, numeroSecuencia) {
  const pref = (String(prefijo).toLowerCase().replace(/[^a-z]/g, '') + 'gen').slice(0, 3)
  const n = Math.max(1, Math.floor(numeroSecuencia))
  const digitos = n >= 1000 ? String(n) : String(n).padStart(3, '0')
  return `${pref}-${digitos}`
}

function siguienteNumeroClaveInventario(clavesExistentes, prefijo) {
  const pref = (String(prefijo).toLowerCase().replace(/[^a-z]/g, '') + 'gen').slice(0, 3)
  const patron = new RegExp(`^${pref}-(\\d+)$`, 'i')
  let maxSufijo = 0

  for (const clave of clavesExistentes) {
    const coincidencia = String(clave ?? '').trim().match(patron)
    if (coincidencia) {
      maxSufijo = Math.max(maxSufijo, Number(coincidencia[1]))
    }
  }

  return maxSufijo + 1
}

/**
 * Estima la clave que asignará el servidor al crear el producto.
 * @param {number|string} idCategoria
 * @param {Array<{ ID_CATEGORIA?: number, DESCRIPCION?: string|null }>} categorias
 * @param {Array<{ ID_CATEGORIA?: number, CLAVE?: string }>} itemsInventario filas del listado cargado
 */
export function vistaPreviaClaveInventario(idCategoria, categorias, itemsInventario) {
  const id = Number(idCategoria)
  if (!Number.isFinite(id) || id < 1) return ''

  const cat = (categorias || []).find((c) => Number(c.ID_CATEGORIA) === id)
  const descripcion = cat?.DESCRIPCION ?? ''
  const prefijo = prefijoClaveDesdeCategoria(descripcion)

  const claves = (itemsInventario || [])
    .filter((row) => Number(row.ID_CATEGORIA) === id)
    .map((row) => row.CLAVE)

  const numero = siguienteNumeroClaveInventario(claves, prefijo)
  return formatearClaveInventario(prefijo, numero)
}
