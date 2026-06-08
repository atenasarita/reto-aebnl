/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockAxiosGet = jest.fn();
const mockHumanizeError = jest.fn((err) => `Error humano: ${err.message}`);

jest.unstable_mockModule('axios', () => ({
  __esModule: true,
  default: {
    get: mockAxiosGet,
  },
  get: mockAxiosGet,
}));

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule('../client/src/utils/humanizeError.js', () => ({
  __esModule: true,
  humanizeError: (err) => mockHumanizeError(err),
}));

jest.unstable_mockModule('../client/src/utils/humanizeError', () => ({
  __esModule: true,
  humanizeError: (err) => mockHumanizeError(err),
}));

const HookModule = await import('../client/src/hooks/useReporteDonaciones.js');

const useReporteDonaciones =
  HookModule.useReporteDonaciones ||
  HookModule.default?.useReporteDonaciones ||
  HookModule.default ||
  HookModule;

let container;
let root;
let hookState;

function TestComponent() {
  hookState = useReporteDonaciones();

  return React.createElement('div', {
    'data-testid': 'test-hook',
  });
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

describe('useReporteDonaciones', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    hookState = null;

    localStorage.clear();
    localStorage.setItem('token', 'fake-token-123');

    jest.clearAllMocks();
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

  test('inicia con valores por defecto', async () => {
    await renderHookComponent();

    expect(hookState.donadores).toEqual([]);
    expect(hookState.movimientos).toEqual([]);
    expect(hookState.loadingDonadores).toBe(false);
    expect(hookState.loadingMovimientos).toBe(false);
    expect(hookState.error).toBe(null);
    expect(typeof hookState.fetchDonadores).toBe('function');
    expect(typeof hookState.fetchMovimientosPorDonador).toBe('function');
    expect(typeof hookState.setMovimientos).toBe('function');
  });

  test('fetchDonadores consulta el endpoint, guarda donadores y regresa la data', async () => {
    const donadores = [
      { id_donador: 1, nombre: 'Ana' },
      { id_donador: 2, nombre: 'Carlos' },
    ];

    mockAxiosGet.mockResolvedValueOnce({
      data: {
        data: donadores,
      },
    });

    await renderHookComponent();

    let result;

    await act(async () => {
      result = await hookState.fetchDonadores();
    });

    await flushPromises();

    expect(mockAxiosGet).toHaveBeenCalledTimes(1);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:3000/api/fondo_donaciones/donadores',
      {
        headers: {
          Authorization: 'Bearer fake-token-123',
          'Content-Type': 'application/json',
        },
      }
    );

    expect(result).toEqual(donadores);
    expect(hookState.donadores).toEqual(donadores);
    expect(hookState.loadingDonadores).toBe(false);
    expect(hookState.error).toBe(null);
  });

  test('fetchDonadores usa arreglo vacío si la respuesta no trae data.data', async () => {
    mockAxiosGet.mockResolvedValueOnce({
      data: {},
    });

    await renderHookComponent();

    let result;

    await act(async () => {
      result = await hookState.fetchDonadores();
    });

    await flushPromises();

    expect(result).toEqual([]);
    expect(hookState.donadores).toEqual([]);
    expect(hookState.loadingDonadores).toBe(false);
    expect(hookState.error).toBe(null);
  });

 test('fetchDonadores humaniza el error, lo guarda en estado y relanza el error', async () => {
  mockAxiosGet.mockRejectedValueOnce(new Error('Network Error'));

  await renderHookComponent();

  let thrownError;

  await act(async () => {
    try {
      await hookState.fetchDonadores();
    } catch (err) {
      thrownError = err;
    }
  });

  await flushPromises();

  expect(thrownError).toBeInstanceOf(Error);
  expect(thrownError.message).toBe('Error humano: Network Error');

  expect(mockHumanizeError).toHaveBeenCalledTimes(1);
  expect(hookState.error).toBe('Error humano: Network Error');
  expect(hookState.loadingDonadores).toBe(false);
});

  test('fetchMovimientosPorDonador consulta movimientos con id y límite por defecto', async () => {
    const movimientos = [
      { id_movimiento: 1, monto: 100 },
      { id_movimiento: 2, monto: 200 },
    ];

    mockAxiosGet.mockResolvedValueOnce({
      data: {
        data: movimientos,
      },
    });

    await renderHookComponent();

    let result;

    await act(async () => {
      result = await hookState.fetchMovimientosPorDonador(5);
    });

    await flushPromises();

    expect(mockAxiosGet).toHaveBeenCalledTimes(1);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:3000/api/fondo_donaciones/movimientos?limite=300&id_donador=5',
      {
        headers: {
          Authorization: 'Bearer fake-token-123',
          'Content-Type': 'application/json',
        },
      }
    );

    expect(result).toEqual(movimientos);
    expect(hookState.movimientos).toEqual(movimientos);
    expect(hookState.loadingMovimientos).toBe(false);
    expect(hookState.error).toBe(null);
  });

  test('fetchMovimientosPorDonador permite mandar un límite personalizado', async () => {
    const movimientos = [
      { id_movimiento: 10, monto: 500 },
    ];

    mockAxiosGet.mockResolvedValueOnce({
      data: {
        data: movimientos,
      },
    });

    await renderHookComponent();

    let result;

    await act(async () => {
      result = await hookState.fetchMovimientosPorDonador(8, 50);
    });

    await flushPromises();

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:3000/api/fondo_donaciones/movimientos?limite=50&id_donador=8',
      {
        headers: {
          Authorization: 'Bearer fake-token-123',
          'Content-Type': 'application/json',
        },
      }
    );

    expect(result).toEqual(movimientos);
    expect(hookState.movimientos).toEqual(movimientos);
  });

  test('fetchMovimientosPorDonador limpia movimientos y no llama axios si no hay idDonador', async () => {
    await renderHookComponent();

    await act(async () => {
      hookState.setMovimientos([
        { id_movimiento: 1, monto: 100 },
      ]);
    });

    expect(hookState.movimientos).toEqual([
      { id_movimiento: 1, monto: 100 },
    ]);

    let result;

    await act(async () => {
      result = await hookState.fetchMovimientosPorDonador(null);
    });

    await flushPromises();

    expect(result).toEqual([]);
    expect(hookState.movimientos).toEqual([]);
    expect(mockAxiosGet).not.toHaveBeenCalled();
    expect(hookState.loadingMovimientos).toBe(false);
  });

  test('fetchMovimientosPorDonador usa arreglo vacío si la respuesta no trae data.data', async () => {
    mockAxiosGet.mockResolvedValueOnce({
      data: {},
    });

    await renderHookComponent();

    let result;

    await act(async () => {
      result = await hookState.fetchMovimientosPorDonador(3);
    });

    await flushPromises();

    expect(result).toEqual([]);
    expect(hookState.movimientos).toEqual([]);
    expect(hookState.loadingMovimientos).toBe(false);
    expect(hookState.error).toBe(null);
  });

  test('fetchMovimientosPorDonador humaniza el error, lo guarda y relanza el error', async () => {
  mockAxiosGet.mockRejectedValueOnce(new Error('Error movimientos'));

  await renderHookComponent();

  let thrownError;

  await act(async () => {
    try {
      await hookState.fetchMovimientosPorDonador(4);
    } catch (err) {
      thrownError = err;
    }
  });

  await flushPromises();

  expect(thrownError).toBeInstanceOf(Error);
  expect(thrownError.message).toBe('Error humano: Error movimientos');

  expect(mockHumanizeError).toHaveBeenCalledTimes(1);
  expect(hookState.error).toBe('Error humano: Error movimientos');
  expect(hookState.loadingMovimientos).toBe(false);
});

  test('setMovimientos permite modificar manualmente los movimientos', async () => {
    await renderHookComponent();

    const nuevosMovimientos = [
      { id_movimiento: 99, monto: 999 },
    ];

    await act(async () => {
      hookState.setMovimientos(nuevosMovimientos);
    });

    await flushPromises();

    expect(hookState.movimientos).toEqual(nuevosMovimientos);
  });
});