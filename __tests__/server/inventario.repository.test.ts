/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

const mockGetConnection = jest.fn() as any;

jest.unstable_mockModule(
  "oracledb",
  () => ({
    default: {
      OUT_FORMAT_OBJECT: 4002,
      BIND_OUT: 3003,
      NUMBER: 2010,
    },
    OUT_FORMAT_OBJECT: 4002,
    BIND_OUT: 3003,
    NUMBER: 2010,
  }),
  { virtual: true }
);

jest.unstable_mockModule("../../server/src/db/oracle", () => ({
  OracleConnection: jest.fn().mockImplementation(() => ({
    getConnection: mockGetConnection,
  })),
}));

let OracleInventarioRepository: any;

beforeAll(async () => {
  const module = await import("../../server/src/repositories/inventario.repository");
  OracleInventarioRepository = module.OracleInventarioRepository;
});

const createMockConnection = () => ({
  execute: jest.fn() as any,
  commit: jest.fn(async () => undefined) as any,
  rollback: jest.fn(async () => undefined) as any,
  close: jest.fn(async () => undefined) as any,
});
const productoActivoRow = {
  ID_INVENTARIO: 1,
  CLAVE: "MED-001",
  NOMBRE: "Gasas",
  ID_CATEGORIA: 2,
  UNIDAD_MEDIDA: "pz",
  PRECIO: 15.5,
  CANTIDAD: 20,
  ACTIVO: 1,
};

const productoInactivoRow = {
  ...productoActivoRow,
  ACTIVO: 0,
};

describe("OracleInventarioRepository", () => {
  let connection: any;
  let repository: any;

  beforeEach(() => {
    connection = createMockConnection();
    mockGetConnection.mockResolvedValue(connection);
    repository = new OracleInventarioRepository();
    jest.clearAllMocks();
  });

  describe("getInventario", () => {
    test("debe regresar el inventario y cerrar la conexión", async () => {
      const inventarioMock = [
        {
          ID_INVENTARIO: 1,
          CLAVE: "MED-001",
          NOMBRE: "Gasas",
        },
      ];

      connection.execute.mockResolvedValueOnce({
        rows: inventarioMock,
      });

      const result = await repository.getInventario();

      expect(result).toEqual(inventarioMock);
      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error cuando falla la consulta de inventario", async () => {
      connection.execute.mockRejectedValueOnce(new Error("Oracle error"));

      await expect(repository.getInventario()).rejects.toThrow(
        "Error al obtener el inventario"
      );

      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProductosEscasos", () => {
    test("debe regresar los productos escasos y cerrar la conexión", async () => {
      const productosMock = [
        {
          ID_INVENTARIO: 2,
          CLAVE: "CUR-001",
          NOMBRE: "Alcohol",
          CANTIDAD: 1,
        },
      ];

      connection.execute.mockResolvedValueOnce({
        rows: productosMock,
      });

      const result = await repository.getProductosEscasos();

      expect(result).toEqual(productosMock);
      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error cuando falla la consulta de productos escasos", async () => {
      connection.execute.mockRejectedValueOnce(new Error("Oracle error"));

      await expect(repository.getProductosEscasos()).rejects.toThrow(
        "Error al obtener productos escasos"
      );

      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("listObjetoCategorias", () => {
    test("debe regresar las categorías de inventario", async () => {
      const categoriasMock = [
        {
          ID_CATEGORIA: 1,
          DESCRIPCION: "Medicamentos",
        },
        {
          ID_CATEGORIA: 2,
          DESCRIPCION: "Curación",
        },
      ];

      connection.execute.mockResolvedValueOnce({
        rows: categoriasMock,
      });

      const result = await repository.listObjetoCategorias();

      expect(result).toEqual(categoriasMock);
      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío cuando Oracle no devuelve rows", async () => {
      connection.execute.mockResolvedValueOnce({});

      const result = await repository.listObjetoCategorias();

      expect(result).toEqual([]);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error cuando falla la consulta de categorías", async () => {
      connection.execute.mockRejectedValueOnce(new Error("Oracle error"));

      await expect(repository.listObjetoCategorias()).rejects.toThrow(
        "Error al obtener categorías de inventario"
      );

      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateInventario", () => {
    test("debe actualizar un producto activo y regresar el producto mapeado", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [productoActivoRow],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        })
        .mockResolvedValueOnce({
          rows: [
            {
              ...productoActivoRow,
              NOMBRE: "Gasas actualizadas",
              PRECIO: 20,
            },
          ],
        });

      const result = await repository.updateInventario(1, {
        clave: "MED-001",
        nombre: "Gasas actualizadas",
        id_categoria: 2,
        unidad_medida: "pz",
        precio: 20,
      });

      expect(result).toEqual({
        id_inventario: 1,
        clave: "MED-001",
        nombre: "Gasas actualizadas",
        id_categoria: 2,
        unidad_medida: "pz",
        precio: 20,
        cantidad: 20,
        activo: 1,
      });
      expect(connection.execute).toHaveBeenCalledTimes(3);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar NotFoundError si el producto no existe", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        repository.updateInventario(99, {
          clave: "MED-999",
          nombre: "No existe",
          id_categoria: 2,
          unidad_medida: "pz",
          precio: 20,
        })
      ).rejects.toThrow("Producto de inventario no encontrado.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar NotFoundError si el producto está inactivo", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [productoInactivoRow],
      });

      await expect(
        repository.updateInventario(1, {
          clave: "MED-001",
          nombre: "Gasas",
          id_categoria: 2,
          unidad_medida: "pz",
          precio: 20,
        })
      ).rejects.toThrow("Producto de inventario no encontrado.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar NotFoundError si el update no afecta filas", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [productoActivoRow],
        })
        .mockResolvedValueOnce({
          rowsAffected: 0,
        });

      await expect(
        repository.updateInventario(1, {
          clave: "MED-001",
          nombre: "Gasas",
          id_categoria: 2,
          unidad_medida: "pz",
          precio: 20,
        })
      ).rejects.toThrow("Producto de inventario no encontrado.");

      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ConflictError cuando Oracle devuelve ORA-00001", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [productoActivoRow],
        })
        .mockRejectedValueOnce({
          code: "ORA-00001",
        });

      await expect(
        repository.updateInventario(1, {
          clave: "MED-001",
          nombre: "Gasas",
          id_categoria: 2,
          unidad_medida: "pz",
          precio: 20,
        })
      ).rejects.toThrow("Ya existe un producto con esa clave.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ValidationError cuando Oracle devuelve ORA-02291", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [productoActivoRow],
        })
        .mockRejectedValueOnce({
          code: "ORA-02291",
        });

      await expect(
        repository.updateInventario(1, {
          clave: "MED-001",
          nombre: "Gasas",
          id_categoria: 999,
          unidad_medida: "pz",
          precio: 20,
        })
      ).rejects.toThrow("La categoría indicada no existe.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteInventario", () => {
    test("debe eliminar lógicamente un producto activo", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [productoActivoRow],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      await repository.deleteInventario(1);

      expect(connection.execute).toHaveBeenCalledTimes(2);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar NotFoundError si el producto no existe al eliminar", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(repository.deleteInventario(99)).rejects.toThrow(
        "Producto de inventario no encontrado."
      );

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar NotFoundError si el delete no afecta filas", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [productoActivoRow],
        })
        .mockResolvedValueOnce({
          rowsAffected: 0,
        });

      await expect(repository.deleteInventario(1)).rejects.toThrow(
        "Producto de inventario no encontrado."
      );

      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error general si Oracle falla al eliminar", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [productoActivoRow],
        })
        .mockRejectedValueOnce(new Error("Oracle error"));

      await expect(repository.deleteInventario(1)).rejects.toThrow(
        "Error al eliminar el producto del inventario"
      );

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("createInventario", () => {
    test("debe crear producto con clave manual", async () => {
      connection.execute.mockResolvedValueOnce({
        outBinds: {
          id_inventario: [10],
        },
      });

      const result = await repository.createInventario({
        clave: "MANUAL-001",
        nombre: "Gasas",
        id_categoria: 2,
        unidad_medida: "pz",
        precio: 15.5,
        cantidad: 30,
        activo: "1",
      });

      expect(result).toEqual({
        id_inventario: 10,
        clave: "MANUAL-001",
        nombre: "Gasas",
        id_categoria: 2,
        unidad_medida: "pz",
        precio: 15.5,
        cantidad: 30,
        activo: 1,
      });
      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe crear producto con clave automática si no viene clave", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              ID_CATEGORIA: 2,
              DESCRIPCION: "Medicamentos",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              CLAVE: "MED-001",
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_inventario: [11],
          },
        });

      const result = await repository.createInventario({
        nombre: "Paracetamol",
        id_categoria: 2,
        unidad_medida: "caja",
        precio: 55,
      });

      expect(result.id_inventario).toBe(11);
      expect(result.nombre).toBe("Paracetamol");
      expect(result.id_categoria).toBe(2);
      expect(result.cantidad).toBe(0);
      expect(result.activo).toBe(1);
      expect(result.clave.toLowerCase()).toContain("med");
      expect(connection.execute).toHaveBeenCalledTimes(3);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe crear producto inactivo cuando activo es '0'", async () => {
      connection.execute.mockResolvedValueOnce({
        outBinds: {
          id_inventario: [12],
        },
      });

      const result = await repository.createInventario({
        clave: "INACTIVO-001",
        nombre: "Producto inactivo",
        id_categoria: 2,
        unidad_medida: "pz",
        precio: 10,
        cantidad: 5,
        activo: "0",
      });

      expect(result.activo).toBe(0);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ValidationError si la categoría no existe al generar clave automática", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        repository.createInventario({
          nombre: "Gasas",
          id_categoria: 999,
          unidad_medida: "pz",
          precio: 15,
        })
      ).rejects.toThrow("La categoría indicada no existe.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe reintentar clave automática cuando hay conflicto ORA-00001", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              ID_CATEGORIA: 2,
              DESCRIPCION: "Medicamentos",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              CLAVE: "MED-001",
            },
          ],
        })
        .mockRejectedValueOnce({
          code: "ORA-00001",
        })
        .mockResolvedValueOnce({
          rows: [
            {
              ID_CATEGORIA: 2,
              DESCRIPCION: "Medicamentos",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              CLAVE: "MED-001",
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_inventario: [13],
          },
        });

      const result = await repository.createInventario({
        nombre: "Gasas",
        id_categoria: 2,
        unidad_medida: "pz",
        precio: 15,
      });

      expect(result.id_inventario).toBe(13);
      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ConflictError si la clave manual ya existe", async () => {
      connection.execute.mockRejectedValueOnce({
        code: "ORA-00001",
      });

      await expect(
        repository.createInventario({
          clave: "DUP-001",
          nombre: "Duplicado",
          id_categoria: 2,
          unidad_medida: "pz",
          precio: 15,
        })
      ).rejects.toThrow("Ya existe un producto con esa clave.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ValidationError si Oracle devuelve ORA-02291 al crear", async () => {
      connection.execute.mockRejectedValueOnce({
        code: "ORA-02291",
      });

      await expect(
        repository.createInventario({
          clave: "BAD-CAT",
          nombre: "Categoría mala",
          id_categoria: 999,
          unidad_medida: "pz",
          precio: 15,
        })
      ).rejects.toThrow("La categoría indicada no existe.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("registrarMovimientoInventario", () => {
    test("debe registrar una entrada de inventario y aumentar stock", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 10,
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_movimiento: [100],
          },
        })
        .mockResolvedValueOnce({});

      const result = await repository.registrarMovimientoInventario(
        {
          id_inventario: 1,
          tipo_movimiento: "entrada",
          cantidad: 5,
          fecha: "2026-06-04",
          motivo: "Compra",
        },
        7
      );

      expect(result).toMatchObject({
        id_movimiento: 100,
        id_inventario: 1,
        tipo_movimiento: "entrada",
        cantidad: 5,
        cant_anterior: 10,
        cant_nueva: 15,
        id_servicio_otorgado: null,
        id_usuario: 7,
        motivo: "Compra",
      });
      expect(result.fecha).toBeInstanceOf(Date);
      expect(connection.execute).toHaveBeenCalledTimes(3);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe registrar una salida de inventario y disminuir stock", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 10,
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_movimiento: [101],
          },
        })
        .mockResolvedValueOnce({});

      const result = await repository.registrarMovimientoInventario(
        {
          id_inventario: 1,
          tipo_movimiento: "salida",
          cantidad: 4,
          fecha: "2026-06-04",
          id_servicio_otorgado: 20,
          motivo: "Uso en servicio",
        },
        7
      );

      expect(result).toMatchObject({
        id_movimiento: 101,
        id_inventario: 1,
        tipo_movimiento: "salida",
        cantidad: 4,
        cant_anterior: 10,
        cant_nueva: 6,
        id_servicio_otorgado: 20,
        id_usuario: 7,
        motivo: "Uso en servicio",
      });
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe usar fecha actual cuando la fecha enviada es inválida", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 10,
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_movimiento: [102],
          },
        })
        .mockResolvedValueOnce({});

      const result = await repository.registrarMovimientoInventario(
        {
          id_inventario: 1,
          tipo_movimiento: "entrada",
          cantidad: 1,
          fecha: "fecha-mala",
          motivo: "Ajuste",
        },
        7
      );

      expect(result.fecha).toBeInstanceOf(Date);
      expect(Number.isNaN(result.fecha.getTime())).toBe(false);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar NotFoundError si no existe el producto del movimiento", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        repository.registrarMovimientoInventario(
          {
            id_inventario: 99,
            tipo_movimiento: "entrada",
            cantidad: 5,
            motivo: "Compra",
          },
          7
        )
      ).rejects.toThrow("Producto de inventario no encontrado.");

      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ValidationError si la salida deja stock negativo", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            CANTIDAD: 3,
          },
        ],
      });

      await expect(
        repository.registrarMovimientoInventario(
          {
            id_inventario: 1,
            tipo_movimiento: "salida",
            cantidad: 5,
            motivo: "Uso",
          },
          7
        )
      ).rejects.toThrow("Stock insuficiente para una salida de esa cantidad.");

      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ValidationError cuando Oracle devuelve ORA-02291", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 10,
            },
          ],
        })
        .mockRejectedValueOnce({
          code: "ORA-02291",
        });

      await expect(
        repository.registrarMovimientoInventario(
          {
            id_inventario: 1,
            tipo_movimiento: "entrada",
            cantidad: 5,
            motivo: "Compra",
          },
          7
        )
      ).rejects.toThrow(
        "Referencia inválida (producto, usuario o servicio no encontrado)."
      );

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ValidationError cuando Oracle devuelve ORA-01861", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 10,
            },
          ],
        })
        .mockRejectedValueOnce({
          code: "ORA-01861",
        });

      await expect(
        repository.registrarMovimientoInventario(
          {
            id_inventario: 1,
            tipo_movimiento: "entrada",
            cantidad: 5,
            fecha: "2026-06-04",
            motivo: "Compra",
          },
          7
        )
      ).rejects.toThrow("La fecha del movimiento no es válida.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error general cuando ocurre un error no controlado al registrar movimiento", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 10,
            },
          ],
        })
        .mockRejectedValueOnce(new Error("Oracle error"));

      await expect(
        repository.registrarMovimientoInventario(
          {
            id_inventario: 1,
            tipo_movimiento: "entrada",
            cantidad: 5,
            motivo: "Compra",
          },
          7
        )
      ).rejects.toThrow("Error al registrar el movimiento de inventario");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });
});