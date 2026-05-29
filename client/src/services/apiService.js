import { getValidToken, handleUnauthorizedResponse } from '../utils/auth'

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
