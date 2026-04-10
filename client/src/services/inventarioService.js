const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3000'

/* GET /api/inventario */
export async function getInventario() {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No hay sesión activa')
  }

  try {
    const response = await fetch(`${BASE_URL}/api/inventario`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error ${response.status}: no se pudo obtener el inventario`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'No se puede conectar al servidor. Comprueba tu conexión.'
      )
    }
    throw error
  }
}
