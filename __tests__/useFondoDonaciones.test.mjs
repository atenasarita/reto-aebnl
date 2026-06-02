/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  API_URL: 'http://localhost:3000',
}));

const axios = (await import('axios')).default;
const { default: useFondoDonaciones } = await import('../client/src/hooks/useFondoDonaciones.js');

let current;
let container;
let root;

function HookTest() {
  current = useFondoDonaciones();
  return null;
}

describe('useFondoDonaciones', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.setItem('token', 'test-token-123');

    axios.get.mockResolvedValue({ data: { data: { saldo: 1000 } } });
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    jest.clearAllMocks();
    localStorage.clear();
    current = null;
  });

  async function mountHook() {
    await act(async () => {
      root.render(React.createElement(HookTest));
    });
  }

  test('inicializa con valores por defecto', async () => {
    await mountHook();

    expect(current.saldo).not.toBeNull();
    expect(current.movimientos).toEqual([]);
    expect(current.error).toBeNull();
  });

  test('fetchSaldo obtiene el saldo correctamente', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: { saldo: 5000 } } });

    await mountHook();

    await act(async () => {
      await current.fetchSaldo();
    });

    expect(current.saldo).toEqual({ saldo: 5000 });
    expect(current.error).toBeNull();
  });

  test('fetchSaldo maneja errores correctamente', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockRejectedValueOnce({
        response: { data: { message: 'Error de servidor' } },
        message: 'Error de servidor',
      });

    await mountHook();

    await act(async () => {
      try {
        await current.fetchSaldo();
      } catch {}
    });

    expect(current.error).toBe('Error de servidor');
  });

  test('fetchMovimientos obtiene movimientos correctamente', async () => {
    const mockMovimientos = [
      { id_movimiento: 1, tipo_movimiento: 'abono', monto: 500 },
      { id_movimiento: 2, tipo_movimiento: 'egreso', monto: 200 },
    ];

    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: mockMovimientos } });

    await mountHook();

    await act(async () => {
      await current.fetchMovimientos();
    });

    expect(current.movimientos).toEqual(mockMovimientos);
    expect(current.error).toBeNull();
  });

  test('fetchMovimientos maneja respuesta vacía', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: null } });

    await mountHook();

    await act(async () => {
      await current.fetchMovimientos();
    });

    expect(current.movimientos).toEqual([]);
  });

  test('fetchMovimientos maneja errores', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockRejectedValueOnce({ message: 'Network error' });

    await mountHook();

    await act(async () => {
      try {
        await current.fetchMovimientos();
      } catch {}
    });

    expect(current.error).toBe('Network error');
  });

  test('registrarAbono registra correctamente', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, id: 1 } });

    await mountHook();

    let result;

    await act(async () => {
      result = await current.registrarAbono({
        monto: 1000,
        origen_tipo: 'marca',
        origen_nombre: 'Empresa XYZ',
        concepto: 'Donación mensual',
      });
    });

    expect(result).toEqual({ success: true, id: 1 });
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/fondo_donaciones/abonos',
      {
        monto: 1000,
        origen_tipo: 'marca',
        origen_nombre: 'Empresa XYZ',
        concepto: 'Donación mensual',
      },
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  test('registrarAbono maneja errores', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Monto inválido' } },
      message: 'Monto inválido',
    });

    await mountHook();

    await act(async () => {
      try {
        await current.registrarAbono({ monto: -100 });
      } catch {}
    });

    expect(current.error).toBe('Monto inválido');
  });

  test('loading termina en false después de fetchSaldo', async () => {
    await mountHook();

    await act(async () => {
      await current.fetchSaldo();
    });

    expect(current.loading).toBe(false);
  });
});
