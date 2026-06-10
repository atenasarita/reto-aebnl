/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

global.fetch = jest.fn();

const mockGetAuthHeaders = jest.fn();
const mockParseErrorMessage = jest.fn();

jest.unstable_mockModule('../client/src/services/apiService.js', () => ({
  getAuthHeaders: (...args) => mockGetAuthHeaders(...args),
  parseErrorMessage: (...args) => mockParseErrorMessage(...args),
}));

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  API_URL: 'http://localhost:3000',
}));

const {
  getInventario,
  getCategoriasInventario,
  createProductoInventario,
  updateProductoInventario,
  deleteProductoInventario,
  registrarMovimientoInventario,
} = await import('../client/src/services/inventarioService.js');

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(status = 400) {
  return {
    ok: false,
    status,
    json: async () => ({
      message: 'Error del servidor',
    }),
  };
}

describe('inventarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAuthHeaders.mockReturnValue({
      Authorization: 'Bearer token-123',
      'Content-Type': 'application/json',
    });

    mockParseErrorMessage.mockResolvedValue('Mensaje procesado del error');

    global.fetch.mockReset();
  });

  describe('getInventario', () => {
    test('regresa el inventario cuando la respuesta es un arreglo', async () => {
      const inventarioMock = [
        { id_inventario: 1, nombre: 'Paracetamol' },
        { id_inventario: 2, nombre: 'Ibuprofeno' },
      ];

      global.fetch.mockResolvedValueOnce(okResponse(inventarioMock));

      const result = await getInventario();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/inventario',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(inventarioMock);
    });

    test('regresa data.inventario cuando la respuesta viene dentro de un objeto', async () => {
      const inventarioMock = [
        { id_inventario: 1, nombre: 'Diclofenaco' },
      ];

      global.fetch.mockResolvedValueOnce(
        okResponse({
          inventario: inventarioMock,
        })
      );

      const result = await getInventario();

      expect(result).toEqual(inventarioMock);
    });

    test('regresa arreglo vacío cuando la respuesta no es arreglo ni contiene inventario', async () => {
      global.fetch.mockResolvedValueOnce(
        okResponse({
          data: 'respuesta inválida',
        })
      );

      const result = await getInventario();

      expect(result).toEqual([]);
    });

    test('lanza error procesado cuando la respuesta no es ok', async () => {
      const response = errorResponse(500);

      global.fetch.mockResolvedValueOnce(response);

      await expect(getInventario()).rejects.toThrow(
        'Mensaje procesado del error'
      );

      expect(mockParseErrorMessage).toHaveBeenCalledWith(response);
    });

    test('lanza mensaje de conexión cuando fetch falla con TypeError', async () => {
      global.fetch.mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      await expect(getInventario()).rejects.toThrow(
        'No se puede conectar al servidor. Comprueba tu conexión.'
      );
    });

    test('relanza el error original cuando no es TypeError de fetch', async () => {
      global.fetch.mockRejectedValueOnce(
        new Error('Error inesperado')
      );

      await expect(getInventario()).rejects.toThrow(
        'Error inesperado'
      );
    });
  });

  describe('getCategoriasInventario', () => {
    test('regresa las categorías cuando la respuesta es un arreglo', async () => {
      const categoriasMock = [
        { id_categoria: 1, nombre: 'Medicamentos' },
        { id_categoria: 2, nombre: 'Material médico' },
      ];

      global.fetch.mockResolvedValueOnce(okResponse(categoriasMock));

      const result = await getCategoriasInventario();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/inventario/categorias',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(categoriasMock);
    });

    test('regresa arreglo vacío cuando categorías no es un arreglo', async () => {
      global.fetch.mockResolvedValueOnce(
        okResponse({
          categorias: [],
        })
      );

      const result = await getCategoriasInventario();

      expect(result).toEqual([]);
    });

    test('lanza error procesado cuando falla la carga de categorías', async () => {
      const response = errorResponse(400);

      global.fetch.mockResolvedValueOnce(response);

      await expect(getCategoriasInventario()).rejects.toThrow(
        'Mensaje procesado del error'
      );

      expect(mockParseErrorMessage).toHaveBeenCalledWith(response);
    });
  });

  describe('createProductoInventario', () => {
    test('crea producto de inventario correctamente', async () => {
      const payload = {
        nombre: 'Paracetamol',
        id_categoria: 1,
        stock: 20,
      };

      const responseMock = {
        id_inventario: 10,
        ...payload,
      };

      global.fetch.mockResolvedValueOnce(okResponse(responseMock));

      const result = await createProductoInventario(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/inventario',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      expect(result).toEqual(responseMock);
    });

    test('lanza error procesado cuando falla crear producto', async () => {
      const payload = {
        nombre: '',
      };

      const response = errorResponse(400);

      global.fetch.mockResolvedValueOnce(response);

      await expect(createProductoInventario(payload)).rejects.toThrow(
        'Mensaje procesado del error'
      );

      expect(mockParseErrorMessage).toHaveBeenCalledWith(response);
    });
  });

  describe('updateProductoInventario', () => {
    test('actualiza producto de inventario correctamente', async () => {
      const payload = {
        nombre: 'Ibuprofeno actualizado',
        stock: 30,
      };

      const responseMock = {
        id_inventario: 5,
        ...payload,
      };

      global.fetch.mockResolvedValueOnce(okResponse(responseMock));

      const result = await updateProductoInventario(5, payload);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/inventario/5',
        {
          method: 'PATCH',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      expect(result).toEqual(responseMock);
    });

    test('lanza error procesado cuando falla actualizar producto', async () => {
      const response = errorResponse(404);

      global.fetch.mockResolvedValueOnce(response);

      await expect(
        updateProductoInventario(99, { nombre: 'No existe' })
      ).rejects.toThrow('Mensaje procesado del error');

      expect(mockParseErrorMessage).toHaveBeenCalledWith(response);
    });
  });

  describe('deleteProductoInventario', () => {
    test('elimina producto correctamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await deleteProductoInventario(8);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/inventario/8',
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toBeUndefined();
    });

    test('lanza error procesado cuando falla eliminar producto', async () => {
      const response = errorResponse(409);

      global.fetch.mockResolvedValueOnce(response);

      await expect(deleteProductoInventario(8)).rejects.toThrow(
        'Mensaje procesado del error'
      );

      expect(mockParseErrorMessage).toHaveBeenCalledWith(response);
    });
  });

  describe('registrarMovimientoInventario', () => {
    test('registra movimiento de inventario correctamente', async () => {
      const payload = {
        id_inventario: 1,
        tipo_movimiento: 'entrada',
        cantidad: 5,
      };

      const responseMock = {
        id_movimiento: 20,
        ...payload,
      };

      global.fetch.mockResolvedValueOnce(okResponse(responseMock));

      const result = await registrarMovimientoInventario(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/inventario/movimientos',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      expect(result).toEqual(responseMock);
    });

    test('lanza error procesado cuando falla registrar movimiento', async () => {
      const response = errorResponse(400);

      global.fetch.mockResolvedValueOnce(response);

      await expect(
        registrarMovimientoInventario({
          id_inventario: 1,
          tipo_movimiento: 'salida',
          cantidad: 999,
        })
      ).rejects.toThrow('Mensaje procesado del error');

      expect(mockParseErrorMessage).toHaveBeenCalledWith(response);
    });
  });
});