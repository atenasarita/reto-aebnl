export const API_URL = import.meta.env.VITE_API_URL;

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
