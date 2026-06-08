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

    axios.get.mockResolvedValue({ data: { data: [] } });
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
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: [] } });

    await mountHook();

    expect(current.saldo).toEqual({ saldo: 1000 });
    expect(current.donadores).toEqual([]);
    expect(current.movimientos).toEqual([]);
    expect(current.error).toBeNull();
  });

  test('fetchSaldo obtiene el saldo correctamente', async () => {
    axios.get
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchSaldo
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
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchSaldo
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

  test('fetchDonadores obtiene donadores correctamente', async () => {
    const mockDonadores = [
      { id_donador: 1, nombre: 'Empresa XYZ', tipo: 'marca' },
      { id_donador: 2, nombre: 'Familia García', tipo: 'familia' },
    ];

    axios.get
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchDonadores
      .mockResolvedValueOnce({ data: { data: mockDonadores } });

    await mountHook();

    await act(async () => {
      await current.fetchDonadores();
    });

    expect(current.donadores).toEqual(mockDonadores);
    expect(current.error).toBeNull();
  });

  test('fetchDonadores maneja respuesta vacía', async () => {
    axios.get
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchDonadores
      .mockResolvedValueOnce({ data: { data: null } });

    await mountHook();

    await act(async () => {
      await current.fetchDonadores();
    });

    expect(current.donadores).toEqual([]);
  });

  test('fetchDonadores maneja errores', async () => {
    axios.get
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchDonadores
      .mockRejectedValueOnce({ message: 'Network error' });

    await mountHook();

    await act(async () => {
      try {
        await current.fetchDonadores();
      } catch {}
    });

    expect(current.error).toBe('Network error');
  });

  test('fetchMovimientos obtiene movimientos correctamente', async () => {
    const mockMovimientos = [
      { id_movimiento: 1, tipo_movimiento: 'abono', monto: 500 },
      { id_movimiento: 2, tipo_movimiento: 'egreso', monto: 200 },
    ];

    axios.get
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchMovimientos
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
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchMovimientos
      .mockResolvedValueOnce({ data: { data: null } });

    await mountHook();

    await act(async () => {
      await current.fetchMovimientos();
    });

    expect(current.movimientos).toEqual([]);
  });

  test('fetchMovimientos maneja errores', async () => {
    axios.get
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // llamada manual: fetchMovimientos
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
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: [] } });

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
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  test('registrarAbono maneja errores', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: [] } });

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

  test('crearDonador registra correctamente', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: [] } });

    axios.post.mockResolvedValueOnce({ data: { success: true, id_donador: 1 } });

    await mountHook();

    let result;

    await act(async () => {
      result = await current.crearDonador({
        nombre: 'Empresa XYZ',
        tipo: 'marca',
      });
    });

    expect(result).toEqual({ success: true, id_donador: 1 });
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/fondo_donaciones/donadores',
      {
        nombre: 'Empresa XYZ',
        tipo: 'marca',
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  test('crearDonador maneja errores', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: [] } });

    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Nombre requerido' } },
      message: 'Nombre requerido',
    });

    await mountHook();

    await act(async () => {
      try {
        await current.crearDonador({});
      } catch {}
    });

    expect(current.error).toBe('Nombre requerido');
  });

  test('refrescar actualiza saldo, donadores y movimientos', async () => {
    const mockDonadores = [{ id_donador: 1, nombre: 'Empresa XYZ' }];
    const mockMovimientos = [{ id_movimiento: 1, tipo_movimiento: 'abono', monto: 500 }];

    axios.get
      // useEffect: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      // useEffect: fetchDonadores
      .mockResolvedValueOnce({ data: { data: [] } })
      // refrescar: fetchSaldo
      .mockResolvedValueOnce({ data: { data: { saldo: 8000 } } })
      // refrescar: fetchDonadores
      .mockResolvedValueOnce({ data: { data: mockDonadores } })
      // refrescar: fetchMovimientos
      .mockResolvedValueOnce({ data: { data: mockMovimientos } });

    await mountHook();

    await act(async () => {
      await current.refrescar();
    });

    expect(current.saldo).toEqual({ saldo: 8000 });
    expect(current.donadores).toEqual(mockDonadores);
    expect(current.movimientos).toEqual(mockMovimientos);
  });

  test('loading termina en false después de fetchSaldo', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { saldo: 1000 } } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: { saldo: 5000 } } });

    await mountHook();

    await act(async () => {
      await current.fetchSaldo();
    });

    expect(current.loading).toBe(false);
  });
});
