/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

const {
  isTokenValid,
  clearSession,
  getValidToken,
  getStoredUser,
  saveSession,
  logout,
  handleUnauthorizedResponse,
  authFetch,
} = await import('../client/src/utils/auth.js');

function makeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('isTokenValid', () => {
    test('retorna false si el token es null', () => {
      expect(isTokenValid(null)).toBe(false);
    });

    test('retorna false si el token no tiene 3 partes', () => {
      expect(isTokenValid('abc.def')).toBe(false);
    });

    test('retorna false si el token está expirado', () => {
      const expired = makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
      expect(isTokenValid(expired)).toBe(false);
    });

    test('retorna true si el token es válido', () => {
      const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(isTokenValid(valid)).toBe(true);
    });

    test('retorna false si el payload no tiene exp', () => {
      const noExp = makeJwt({ userId: 1 });
      expect(isTokenValid(noExp)).toBe(false);
    });
  });

  describe('clearSession', () => {
    test('elimina token y user del localStorage', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      clearSession();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getValidToken', () => {
    test('retorna null si no hay token', () => {
      expect(getValidToken()).toBeNull();
    });

    test('retorna null y limpia sesión si el token está expirado', () => {
      const expired = makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
      localStorage.setItem('token', expired);
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      const result = getValidToken();

      expect(result).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('retorna el token si es válido', () => {
      const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('token', valid);

      expect(getValidToken()).toBe(valid);
    });
  });

  describe('getStoredUser', () => {
    test('retorna null si no hay usuario guardado', () => {
      expect(getStoredUser()).toBeNull();
    });

    test('retorna el usuario guardado', () => {
      const user = { id: 1, nombre: 'Ana' };
      localStorage.setItem('user', JSON.stringify(user));

      expect(getStoredUser()).toEqual(user);
    });

    test('retorna null si el JSON es inválido', () => {
      localStorage.setItem('user', 'invalid-json{{{');

      expect(getStoredUser()).toBeNull();
    });
  });

  describe('saveSession', () => {
    test('guarda token y user en localStorage', () => {
      const user = { id: 1, nombre: 'Ana' };

      saveSession('mi-token', user);

      expect(localStorage.getItem('token')).toBe('mi-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(user);
    });
  });

  describe('logout', () => {
    test('limpia la sesión sin redirigir', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      logout({ redirect: false });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('handleUnauthorizedResponse', () => {
    test('retorna false si la respuesta no es 401', () => {
      expect(handleUnauthorizedResponse({ status: 200 })).toBe(false);
    });

    test('retorna true si la respuesta es 401', () => {
      expect(handleUnauthorizedResponse({ status: 401 })).toBe(true);
    });

    test('retorna false si la respuesta es null', () => {
      expect(handleUnauthorizedResponse(null)).toBe(false);
    });
  });

  describe('authFetch', () => {
    test('lanza error si no hay token válido', async () => {
      await expect(authFetch('http://localhost:3000/api/test')).rejects.toThrow(
        'Sesión expirada. Inicie sesión de nuevo.'
      );
    });

    test('hace fetch con Authorization header si el token es válido', async () => {
      const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('token', valid);

      global.fetch.mockResolvedValue({ status: 200 });

      const response = await authFetch('http://localhost:3000/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${valid}`,
          }),
        })
      );

      expect(response.status).toBe(200);
    });

    test('lanza error si la respuesta es 401', async () => {
      const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('token', valid);

      global.fetch.mockResolvedValue({ status: 401 });

      await expect(authFetch('http://localhost:3000/api/test')).rejects.toThrow(
        'Sesión expirada. Inicie sesión de nuevo.'
      );
    });

    test('agrega Content-Type si hay body', async () => {
      const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('token', valid);

      global.fetch.mockResolvedValue({ status: 200 });

      await authFetch('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
