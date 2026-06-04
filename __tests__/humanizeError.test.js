/**
 * @jest-environment jsdom
 */

const { describe, test, expect } = require('@jest/globals');
const { humanizeError } = require('../client/src/utils/humanizeError');

const MSG_CONEXION = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
const MSG_SERVIDOR = 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.';
const MSG_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.';

describe('humanizeError', () => {
  describe('errores de red del navegador', () => {
    test('convierte "Failed to fetch" (Chrome/Edge) en mensaje legible', () => {
      expect(humanizeError(new Error('Failed to fetch'))).toBe(MSG_CONEXION);
    });

    test('convierte "Load failed" (Safari) en mensaje legible', () => {
      expect(humanizeError(new Error('Load failed'))).toBe(MSG_CONEXION);
    });

    test('convierte "Network Error" (Axios) en mensaje legible', () => {
      expect(humanizeError(new Error('Network Error'))).toBe(MSG_CONEXION);
    });

    test('convierte "NetworkError when attempting to fetch resource" (Firefox) en mensaje legible', () => {
      expect(humanizeError(new Error('NetworkError when attempting to fetch resource'))).toBe(MSG_CONEXION);
    });
  });

  describe('errores de Axios con respuesta del servidor', () => {
    test('prioriza el mensaje del servidor sobre el texto del error', () => {
      const axiosErr = {
        response: { data: { message: 'El folio ya existe en el sistema.' } },
        message: 'Network Error',
      };
      expect(humanizeError(axiosErr)).toBe('El folio ya existe en el sistema.');
    });

    test('prioriza el mensaje del servidor aunque el error sea de red', () => {
      const axiosErr = {
        response: { data: { message: 'No se pudo procesar la solicitud.' } },
        message: 'Failed to fetch',
      };
      expect(humanizeError(axiosErr)).toBe('No se pudo procesar la solicitud.');
    });
  });

  describe('mensajes ya amigables en español', () => {
    test('pasa mensajes de validación del servidor sin modificarlos', () => {
      const msg = 'El beneficiario no tiene membresía activa.';
      expect(humanizeError(new Error(msg))).toBe(msg);
    });

    test('pasa mensajes de negocio sin modificarlos', () => {
      const msg = 'No hay citas disponibles para esta fecha.';
      expect(humanizeError(new Error(msg))).toBe(msg);
    });

    test('acepta string directo amigable sin modificarlo', () => {
      const msg = 'La donación supera el saldo disponible.';
      expect(humanizeError(msg)).toBe(msg);
    });
  });

  describe('acepta strings directos con patrones técnicos', () => {
    test('convierte string "Failed to fetch" en mensaje legible', () => {
      expect(humanizeError('Failed to fetch')).toBe(MSG_CONEXION);
    });

    test('convierte string "Network Error" en mensaje legible', () => {
      expect(humanizeError('Network Error')).toBe(MSG_CONEXION);
    });
  });

  describe('casos extremos — valores sin mensaje', () => {
    test('devuelve mensaje genérico para null', () => {
      expect(humanizeError(null)).toBe(MSG_GENERICO);
    });

    test('devuelve mensaje genérico para undefined', () => {
      expect(humanizeError(undefined)).toBe(MSG_GENERICO);
    });

    test('devuelve mensaje genérico para Error con mensaje vacío', () => {
      expect(humanizeError(new Error(''))).toBe(MSG_GENERICO);
    });

    test('devuelve mensaje genérico para string vacío', () => {
      expect(humanizeError('')).toBe(MSG_GENERICO);
    });

    test('devuelve mensaje genérico para objeto sin propiedades relevantes', () => {
      expect(humanizeError({})).toBe(MSG_GENERICO);
    });
  });
});
