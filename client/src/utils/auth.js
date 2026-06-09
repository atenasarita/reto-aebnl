import { API_URL } from './config';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Margen de reloj (segundos) al comparar exp del JWT (servidor: JWT_EXPIRES_IN=8h). */
const CLOCK_SKEW_SEC = 30;

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;

  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec + CLOCK_SKEW_SEC;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Token en localStorage solo si el JWT no está expirado o malformado. */
export function getValidToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  if (!isTokenValid(token)) {
    clearSession();
    return null;
  }

  return token;
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function logout({ redirect = true } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    try {
      await fetch(`${API_URL}/api/usuarios/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Limpia sesion local aunque falle la revocacion remota.
    }
  }

  clearSession();

  if (redirect && typeof window !== 'undefined') {
    try {
      window.location.replace('/login');
    } catch {
      // En entornos de prueba como jsdom, la navegación no siempre está implementada.
    }
  }
}

/** Si la API responde 401, limpia sesión y manda al login. */
export function handleUnauthorizedResponse(response) {
  if (response?.status === 401) {
    logout();
    return true;
  }
  return false;
}

export async function authFetch(url, options = {}) {
  const token = getValidToken();
  if (!token) {
    logout();
    throw new Error('Sesión expirada. Inicie sesión de nuevo.');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  if (options.body && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (handleUnauthorizedResponse(response)) {
    throw new Error('Sesión expirada. Inicie sesión de nuevo.');
  }

  return response;
}
