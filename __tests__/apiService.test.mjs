import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule('../client/src/utils/auth.js', () => ({
  getValidToken: jest.fn(() => null),
  handleUnauthorizedResponse: jest.fn(() => false),
  authFetch: jest.fn(),
}));

const apiService = await import('../client/src/services/apiService.js');
const { getAuthHeaders, parseErrorMessage } = apiService;
const authModule = await import('../client/src/utils/auth.js');

describe('apiService', () => {
  describe('getAuthHeaders', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('lanza error cuando no hay token valido', () => {
      authModule.getValidToken.mockReturnValue(null);

      expect(() => getAuthHeaders()).toThrow('No hay sesión activa');
    });

    test('devuelve headers con Content-Type y Authorization cuando hay token', () => {
      authModule.getValidToken.mockReturnValue('valid-token-123');

      const headers = getAuthHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Authorization).toBe('Bearer valid-token-123');
    });

    test('devuelve un objeto con las propiedades correctas', () => {
      authModule.getValidToken.mockReturnValue('test-token');

      const headers = getAuthHeaders();

      expect(headers).toHaveProperty('Content-Type');
      expect(headers).toHaveProperty('Authorization');
      expect(Object.keys(headers)).toHaveLength(2);
    });
  });

  describe('parseErrorMessage', () => {
    test('extrae el mensaje de error cuando la respuesta es JSON valido', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ message: 'Error de validación' }),
        status: 400
      };

      const result = await parseErrorMessage(mockResponse);

      expect(result).toBe('Error de validación');
    });

    test('devuelve status code cuando no hay mensaje en JSON', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({}),
        status: 500
      };

      const result = await parseErrorMessage(mockResponse);

      expect(result).toBe('Error 500');
    });

    test('devuelve status code cuando response.json() falla', async () => {
      const mockResponse = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        status: 404
      };

      const result = await parseErrorMessage(mockResponse);

      expect(result).toBe('Error 404');
    });

    test('maneja respuestas con estructura anidada de error', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          error: 'Campo inválido',
          message: 'Mensaje principal'
        }),
        status: 422
      };

      const result = await parseErrorMessage(mockResponse);

      expect(result).toBe('Mensaje principal');
    });
  });
});
