/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

const mockHumanizeError = jest.fn((err) => `Error humano: ${err.message}`);

jest.unstable_mockModule('../client/src/utils/humanizeError.js', () => ({
  __esModule: true,
  humanizeError: (err) => mockHumanizeError(err),
}));

jest.unstable_mockModule('../client/src/utils/humanizeError', () => ({
  __esModule: true,
  humanizeError: (err) => mockHumanizeError(err),
}));

const HookModule = await import('../client/src/hooks/useBeneficiarios.js');

const useBeneficiarios =
  HookModule.default?.default || HookModule.default || HookModule;

let container;
let root;
let hookState;

function TestComponent() {
  hookState = useBeneficiarios();
  return React.createElement('div', {
    'data-testid': 'test-component',
  });
}

function okResponse(data) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  };
}

function errorResponse(message = 'Error del servidor', status = 500) {
  return {
    ok: false,
    status,
    json: async () => ({ message }),
  };
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function renderHookComponent() {
  await act(async () => {
    root.render(React.createElement(TestComponent));
  });

  await flushPromises();
}

describe('useBeneficiarios', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    hookState = null;

    global.fetch = jest.fn();

    localStorage.clear();
    localStorage.setItem('token', 'fake-token-123');

    mockHumanizeError.mockClear();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    document.body.innerHTML = '';
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('carga beneficiarios al montarse y guarda los datos en caché', async () => {
    const beneficiarios = [
      { id: 1, nombre: 'Ana' },
      { id: 2, nombre: 'Carlos' },
    ];

    global.fetch.mockResolvedValueOnce(okResponse(beneficiarios));

    await renderHookComponent();

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token-123',
        },
      }
    );

    expect(hookState.data).toEqual(beneficiarios);
    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('');

    expect(localStorage.getItem('aebnl_cache_beneficiarios')).toBe(
      JSON.stringify(beneficiarios)
    );
  });

  test('cuando fetchBeneficiarios falla sin caché, muestra error humanizado', async () => {
    global.fetch.mockResolvedValueOnce(
      errorResponse('No autorizado', 401)
    );

    await renderHookComponent();

    expect(hookState.data).toEqual([]);
    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('Error humano: No autorizado');
    expect(mockHumanizeError).toHaveBeenCalledTimes(1);
  });

  test('cuando fetchBeneficiarios falla con caché, usa los datos guardados y no muestra error', async () => {
    const cachedData = [
      { id: 10, nombre: 'Beneficiario cacheado' },
    ];

    localStorage.setItem(
      'aebnl_cache_beneficiarios',
      JSON.stringify(cachedData)
    );

    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    await renderHookComponent();

    expect(hookState.data).toEqual(cachedData);
    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('');
    expect(mockHumanizeError).not.toHaveBeenCalled();
  });

  test('si la caché está corrupta y el fetch falla, no truena y muestra error humanizado', async () => {
    localStorage.setItem('aebnl_cache_beneficiarios', '{json inválido');

    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    await renderHookComponent();

    expect(hookState.data).toEqual([]);
    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('Error humano: Network Error');
    expect(mockHumanizeError).toHaveBeenCalledTimes(1);
  });

  test('buscarPorFolio con query válido consulta el endpoint de folio y envuelve un objeto en array', async () => {
    const initialData = [
      { id: 1, nombre: 'Ana' },
    ];

    const beneficiarioEncontrado = {
      id: 99,
      folio: 'F-001',
      nombre: 'María',
    };

    global.fetch
      .mockResolvedValueOnce(okResponse(initialData))
      .mockResolvedValueOnce(okResponse(beneficiarioEncontrado));

    await renderHookComponent();

    await act(async () => {
      await hookState.buscarPorFolio('  F-001  ');
    });

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(2);

    expect(global.fetch).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/beneficiarios/folio/F-001',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token-123',
        },
      }
    );

    expect(hookState.data).toEqual([beneficiarioEncontrado]);
    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('');
  });

  test('buscarPorFolio conserva el array si el backend responde con un array', async () => {
    const initialData = [
      { id: 1, nombre: 'Ana' },
    ];

    const resultadoBusqueda = [
      { id: 20, folio: 'ABC', nombre: 'Luis' },
      { id: 21, folio: 'ABC', nombre: 'Sofía' },
    ];

    global.fetch
      .mockResolvedValueOnce(okResponse(initialData))
      .mockResolvedValueOnce(okResponse(resultadoBusqueda));

    await renderHookComponent();

    await act(async () => {
      await hookState.buscarPorFolio('ABC');
    });

    await flushPromises();

    expect(hookState.data).toEqual(resultadoBusqueda);
    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('');
  });

  test('buscarPorFolio con query vacío vuelve a cargar todos los beneficiarios', async () => {
    const initialData = [
      { id: 1, nombre: 'Ana' },
    ];

    const refreshedData = [
      { id: 2, nombre: 'Carlos' },
    ];

    global.fetch
      .mockResolvedValueOnce(okResponse(initialData))
      .mockResolvedValueOnce(okResponse(refreshedData));

    await renderHookComponent();

    await act(async () => {
      await hookState.buscarPorFolio('   ');
    });

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(2);

    expect(global.fetch).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/beneficiarios',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token-123',
        },
      }
    );

    expect(hookState.data).toEqual(refreshedData);
    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('');
  });

  test('buscarPorFolio muestra el mensaje del backend cuando la respuesta no es ok', async () => {
    const initialData = [
      { id: 1, nombre: 'Ana' },
    ];

    global.fetch
      .mockResolvedValueOnce(okResponse(initialData))
      .mockResolvedValueOnce(errorResponse('No se encontró el beneficiario', 404));

    await renderHookComponent();

    await act(async () => {
      await hookState.buscarPorFolio('NO-EXISTE');
    });

    await flushPromises();

    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('No se encontró el beneficiario');
  });

  test('buscarPorFolio usa mensaje por defecto si el backend falla sin message', async () => {
    const initialData = [
      { id: 1, nombre: 'Ana' },
    ];

    global.fetch
      .mockResolvedValueOnce(okResponse(initialData))
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

    await renderHookComponent();

    await act(async () => {
      await hookState.buscarPorFolio('NO-EXISTE');
    });

    await flushPromises();

    expect(hookState.loading).toBe(false);
    expect(hookState.error).toBe('No se encontró el beneficiario');
  });
});