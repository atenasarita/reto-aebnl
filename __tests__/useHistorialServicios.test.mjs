/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockAxiosGet = jest.fn();
const mockHumanizeError = jest.fn();

jest.unstable_mockModule('axios', () => ({
  default: {
    get: mockAxiosGet,
  },
}));

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  API_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule('../client/src/utils/humanizeError.js', () => ({
  humanizeError: (...args) => mockHumanizeError(...args),
}));

const { default: useHistorialServicios } = await import(
  '../client/src/hooks/useHistorialServicios.js'
);

let current;
let container;
let root;

function HookTest() {
  current = useHistorialServicios();
  return null;
}

function okHistorial(data, hasMore = true) {
  return {
    data: {
      data,
      hasMore,
    },
  };
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('useHistorialServicios', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    localStorage.setItem('token', 'token-123');

    jest.clearAllMocks();

    mockAxiosGet.mockResolvedValue(
      okHistorial([], false)
    );

    mockHumanizeError.mockReturnValue('Error procesado');
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });

    container.remove();
    localStorage.clear();
    current = null;
  });

  async function mountHook() {
    await act(async () => {
      root.render(React.createElement(HookTest));
    });

    await flushPromises();
  }

  test('carga la primera página al montar el hook', async () => {
    const serviciosMock = [
      { id_servicio: 1, nombre: 'Consulta general' },
      { id_servicio: 2, nombre: 'Terapia física' },
    ];

    mockAxiosGet.mockResolvedValueOnce(
      okHistorial(serviciosMock, true)
    );

    await mountHook();

    expect(mockAxiosGet).toHaveBeenCalledTimes(1);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:3000/api/servicios/historial',
      {
        params: {
          page: 0,
          limit: 20,
        },
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(current.servicios).toEqual(serviciosMock);
    expect(current.hasMore).toBe(true);
    expect(current.loading).toBe(false);
    expect(current.error).toBe(null);
  });

  test('loadMore carga la siguiente página y conserva los datos anteriores', async () => {
    mockAxiosGet
      .mockResolvedValueOnce(
        okHistorial(
          [{ id_servicio: 1, nombre: 'Consulta general' }],
          true
        )
      )
      .mockResolvedValueOnce(
        okHistorial(
          [{ id_servicio: 2, nombre: 'Terapia física' }],
          false
        )
      );

    await mountHook();

    await act(async () => {
      current.loadMore();
    });

    await flushPromises();

    expect(mockAxiosGet).toHaveBeenCalledTimes(2);

    expect(mockAxiosGet).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/servicios/historial',
      {
        params: {
          page: 1,
          limit: 20,
        },
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(current.servicios).toEqual([
      { id_servicio: 1, nombre: 'Consulta general' },
      { id_servicio: 2, nombre: 'Terapia física' },
    ]);

    expect(current.hasMore).toBe(false);
    expect(current.loading).toBe(false);
    expect(current.error).toBe(null);
  });

  test('no carga más registros cuando hasMore es false', async () => {
    mockAxiosGet.mockResolvedValueOnce(
      okHistorial(
        [{ id_servicio: 1, nombre: 'Consulta general' }],
        false
      )
    );

    await mountHook();

    await act(async () => {
      current.loadMore();
    });

    await flushPromises();

    expect(mockAxiosGet).toHaveBeenCalledTimes(1);

    expect(current.servicios).toEqual([
      { id_servicio: 1, nombre: 'Consulta general' },
    ]);

    expect(current.hasMore).toBe(false);
  });

  test('no hace otra petición si ya hay una carga en proceso', async () => {
    let resolverPeticion;

    mockAxiosGet.mockReturnValueOnce(
      new Promise((resolve) => {
        resolverPeticion = resolve;
      })
    );

    await act(async () => {
      root.render(React.createElement(HookTest));
    });

    expect(current.loading).toBe(true);

    await act(async () => {
      current.loadMore();
    });

    expect(mockAxiosGet).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolverPeticion(
        okHistorial(
          [{ id_servicio: 1, nombre: 'Consulta general' }],
          true
        )
      );
    });

    await flushPromises();

    expect(current.loading).toBe(false);
    expect(current.servicios).toEqual([
      { id_servicio: 1, nombre: 'Consulta general' },
    ]);
  });

  test('maneja error cuando falla la petición inicial', async () => {
    const errorMock = new Error('Error de red');

    mockAxiosGet.mockRejectedValueOnce(errorMock);
    mockHumanizeError.mockReturnValueOnce('No se pudo cargar el historial');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await mountHook();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching historial servicios:',
      errorMock
    );

    expect(mockHumanizeError).toHaveBeenCalledWith(errorMock);
    expect(current.error).toBe('No se pudo cargar el historial');
    expect(current.servicios).toEqual([]);
    expect(current.loading).toBe(false);

    consoleSpy.mockRestore();
  });

  test('limpia el error cuando una nueva carga se ejecuta correctamente', async () => {
    const errorMock = new Error('Error inicial');

    mockAxiosGet
      .mockRejectedValueOnce(errorMock)
      .mockResolvedValueOnce(
        okHistorial(
          [{ id_servicio: 1, nombre: 'Consulta general' }],
          true
        )
      );

    mockHumanizeError.mockReturnValueOnce('Error inicial procesado');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await mountHook();

    expect(current.error).toBe('Error inicial procesado');

    await act(async () => {
      current.refetch();
    });

    await flushPromises();

    expect(current.error).toBe(null);
    expect(current.servicios).toEqual([
      { id_servicio: 1, nombre: 'Consulta general' },
    ]);

    consoleSpy.mockRestore();
  });

  test('refetch vuelve a cargar desde la página 0', async () => {
    mockAxiosGet
      .mockResolvedValueOnce(
        okHistorial(
          [{ id_servicio: 1, nombre: 'Servicio anterior' }],
          true
        )
      )
      .mockResolvedValueOnce(
        okHistorial(
          [{ id_servicio: 2, nombre: 'Servicio actualizado' }],
          true
        )
      );

    await mountHook();

    expect(current.servicios).toEqual([
      { id_servicio: 1, nombre: 'Servicio anterior' },
    ]);

    await act(async () => {
      current.refetch();
    });

    await flushPromises();

    expect(mockAxiosGet).toHaveBeenCalledTimes(2);

    expect(mockAxiosGet).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/servicios/historial',
      {
        params: {
          page: 0,
          limit: 20,
        },
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(current.servicios).toEqual([
      { id_servicio: 2, nombre: 'Servicio actualizado' },
    ]);

    expect(current.hasMore).toBe(true);
    expect(current.loading).toBe(false);
  });

  test('usa Bearer null cuando no existe token en localStorage', async () => {
    localStorage.clear();

    mockAxiosGet.mockResolvedValueOnce(
      okHistorial([], false)
    );

    await mountHook();

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:3000/api/servicios/historial',
      {
        params: {
          page: 0,
          limit: 20,
        },
        headers: {
          Authorization: 'Bearer null',
        },
      }
    );

    expect(current.servicios).toEqual([]);
    expect(current.hasMore).toBe(false);
    expect(current.loading).toBe(false);
  });
});