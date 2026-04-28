<<<<<<< HEAD
import { getValidToken, handleUnauthorizedResponse } from '../utils/auth'
=======
export const API_URL = import.meta.env.VITE_API_URL;
>>>>>>> 05eb4c4 (vite.url)

export function getAuthHeaders() {
  const token = getValidToken()
  if (!token) {
    throw new Error('No hay sesión activa')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export { authFetch, handleUnauthorizedResponse } from '../utils/auth'

export async function parseErrorMessage(response) {
  const errorData = await response.json().catch(() => ({}))
  return errorData.message || `Error ${response.status}`
}
