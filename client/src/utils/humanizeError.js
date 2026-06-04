/**
 * Converts a raw Error or message string into a user-friendly Spanish phrase.
 * Pass an Error object (including axios errors) or a plain string.
 */
export function humanizeError(err) {
  // Axios errors: prefer the server's own message if present
  if (err?.response?.data?.message) {
    return err.response.data.message
  }

  const msg = typeof err === 'string' ? err : (err?.message ?? '')
  return humanizeMsg(msg)
}

// Known technical patterns → friendly Spanish phrases
const NETWORK_PATTERNS = [
  'Failed to fetch',     // Chrome / Edge
  'Load failed',         // Safari
  'Network Error',       // Axios
  'NetworkError',        // Firefox
  'fetch',               // generic TypeError from fetch
]

function humanizeMsg(msg) {
  if (!msg) return 'Ocurrió un error inesperado. Intenta de nuevo.'

  for (const pattern of NETWORK_PATTERNS) {
    if (msg.includes(pattern)) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    }
  }

  // Chrome/Node network codes that sometimes appear in messages
  if (/ERR_CONNECTION|ERR_NETWORK|ECONNREFUSED|ENOTFOUND/.test(msg)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
  }

  // HTTP 5xx leaking as text
  if (/\b5\d\d\b/.test(msg) && /error/i.test(msg)) {
    return 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
  }

  return msg
}
