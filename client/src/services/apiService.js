export const BASE_URL = 'https://reto-aebnl-production.up.railway.app'

export function getAuthHeaders() {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No hay sesión activa')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function parseErrorMessage(response) {
  const errorData = await response.json().catch(() => ({}))
  return errorData.message || `Error ${response.status}`
}
