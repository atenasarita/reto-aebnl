import { API_URL, getAuthHeaders, parseErrorMessage } from './apiService'

/* GET /api/inventario */
export async function getInventario() {
  try {
    const response = await fetch(`${API_URL}/api/inventario`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response))
    }

    const data = await response.json()
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.inventario)) return data.inventario
    return []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'No se puede conectar al servidor. Comprueba tu conexión.'
      )
    }
    throw error
  }
}

/* GET /api/inventario/categorias */
export async function getCategoriasInventario() {
  const response = await fetch(`${API_URL}/api/inventario/categorias`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  const data = await response.json()
  return Array.isArray(data) ? data : []
}

/* POST /api/inventario */
export async function createProductoInventario(payload) {
  const response = await fetch(`${API_URL}/api/inventario`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  return response.json()
}

/* POST /api/inventario/movimientos */
export async function registrarMovimientoInventario(payload) {
  const response = await fetch(`${API_URL}/api/inventario/movimientos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  return response.json()
}
