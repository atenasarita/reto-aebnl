/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

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
    getConnection: jest.fn(),
  })),
}));

let ServicioRepository: any;

beforeAll(async () => {
  const module = await import("../../server/src/repositories/servicios.repository");
  ServicioRepository = module.ServicioRepository;
});

const createMockConnection = () => ({
  execute: jest.fn() as any,
  commit: jest.fn(async () => undefined) as any,
  rollback: jest.fn(async () => undefined) as any,
  close: jest.fn(async () => undefined) as any,
});

const createRepository = (connection: any, fondoRepository: any = {}) => {
  const oracleConnectionMock = {
    getConnection: jest.fn(async () => connection),
  };

  const fondoRepositoryMock = {
    registrarEgresoEnTransaccion: jest.fn(async () => undefined),
    ...fondoRepository,
  };

  return {
    repository: new ServicioRepository(oracleConnectionMock as any, fondoRepositoryMock as any),
    fondoRepositoryMock,
    oracleConnectionMock,
  };
};

const baseServicioInput = {
  id_beneficiario: 1,
  id_catalogo_servicio: 2,
  fecha: "2026-06-04",
  hora: "10:30",
  id_cita: null,
  cantidad: 1,
  notas: "Servicio de prueba",
  insumos: [],
  monto_servicio: 300,
  monto_inventario: 0,
  descuento: 0,
  cuota_total: 300,
  monto_pagado: 300,
  monto_donacion: 0,
  id_fondo: null,
  id_donador: null,
  metodo_pago: "efectivo",
  ya_aporto: false,
  id_usuario: 7,
};

describe("ServicioRepository", () => {
  let connection: any;
  let repository: any;
  let fondoRepositoryMock: any;

  beforeEach(() => {
    connection = createMockConnection();
    const setup = createRepository(connection);
    repository = setup.repository;
    fondoRepositoryMock = setup.fondoRepositoryMock;
    jest.clearAllMocks();
  });

  describe("getTiposServicio", () => {
    test("debe regresar los tipos de servicio mapeados", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ID_CATALOGO_SERVICIO: 1,
            NOMBRE: "Consulta",
            CATEGORIA: "Medicina",
            PRECIO: 300,
          },
          {
            ID_CATALOGO_SERVICIO: 2,
            NOMBRE: "Laboratorio",
            CATEGORIA: "Estudios",
            PRECIO: 500,
          },
        ],
      });

      const result = await repository.getTiposServicio();

      expect(result).toEqual([
        {
          id: 1,
          nombre: "Consulta",
          categoria: "Medicina",
          precio: 300,
        },
        {
          id: 2,
          nombre: "Laboratorio",
          categoria: "Estudios",
          precio: 500,
        },
      ]);

      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío si Oracle no devuelve rows", async () => {
      connection.execute.mockResolvedValueOnce({});

      const result = await repository.getTiposServicio();

      expect(result).toEqual([]);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("getFechasUltimosEstudios", () => {
    test("debe regresar fechas nulas cuando no hay estudios previos", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await repository.getFechasUltimosEstudios(1);

      expect(result).toEqual({
        idBeneficiario: 1,
        controlUrologico: null,
        ecoRenal: null,
        uroTac: null,
        estUrodinamico: null,
        tacCerebro: null,
        urocultivo: null,
      });

      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar las últimas fechas de estudios cuando existen", async () => {
      const fechaOrina = new Date("2026-01-01");
      const fechaEco = new Date("2026-02-01");
      const fechaUrotac = new Date("2026-03-01");

      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ID_BENEFICIARIO: 1,
            GRAL_ORINA: fechaOrina,
            ECO_RENAL: fechaEco,
            UROTAC: fechaUrotac,
            EST_URODINAMICO: null,
            TAC_CEREBRO: null,
            UROCULTIVO: null,
          },
        ],
      });

      const result = await repository.getFechasUltimosEstudios(1);

      expect(result).toEqual({
        idBeneficiario: 1,
        gralOrina: fechaOrina,
        ecoRenal: fechaEco,
        uroTac: fechaUrotac,
        estUrodinamico: null,
        tacCerebro: null,
        urocultivo: null,
      });

      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("registrarServicio", () => {
    test("debe registrar un servicio sin insumos y guardar información financiera", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [100],
          },
        })
        .mockResolvedValueOnce({});

      const result = await repository.registrarServicio(baseServicioInput);

      expect(result).toEqual({
        ok: true,
        id_servicio_otorgado: 100,
      });

      expect(connection.execute).toHaveBeenCalledTimes(2);
      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        id_servicio_otorgado: 100,
        monto_servicio: 300,
        monto_inventario: 0,
        descuento: 0,
        cuota_total: 300,
        monto_pagado: 300,
        monto_donacion: 0,
        metodo_pago: "efectivo",
        ya_aporto: 0,
        id_donador: null,
        id_fondo: null,
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe usar hora 00:00 cuando no se manda hora", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [101],
          },
        })
        .mockResolvedValueOnce({});

      await repository.registrarServicio({
        ...baseServicioInput,
        hora: "",
      });

      expect(connection.execute.mock.calls[0][1]).toMatchObject({
        hora: "00:00",
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe registrar servicio con insumo, venta, descuento de inventario y movimiento", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [200],
          },
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 10,
            },
          ],
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const result = await repository.registrarServicio({
        ...baseServicioInput,
        insumos: [
          {
            id: 5,
            cantidad: 3,
            precio: 20,
          },
        ],
        monto_inventario: 60,
        cuota_total: 360,
        monto_pagado: 360,
      });

      expect(result).toEqual({
        ok: true,
        id_servicio_otorgado: 200,
      });

      expect(connection.execute).toHaveBeenCalledTimes(6);

      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        id_servicio_otorgado: 200,
        id_inventario: 5,
        cantidad: 3,
        precio_unitario: 20,
        subtotal: 60,
      });

      expect(connection.execute.mock.calls[3][1]).toMatchObject({
        cantidad: 3,
        id_inventario: 5,
      });

      expect(connection.execute.mock.calls[4][1]).toMatchObject({
        id_inventario: 5,
        cantidad: 3,
        cant_anterior: 10,
        cant_nueva: 7,
        id_servicio_otorgado: 200,
        id_usuario: 7,
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error si el insumo no existe en inventario", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [201],
          },
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          rows: [],
        });

      await expect(
        repository.registrarServicio({
          ...baseServicioInput,
          insumos: [
            {
              id: 99,
              cantidad: 2,
              precio: 10,
            },
          ],
        })
      ).rejects.toThrow("Insumo ID 99 no encontrado en inventario");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error si el insumo deja stock negativo", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [202],
          },
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          rows: [
            {
              CANTIDAD: 1,
            },
          ],
        });

      await expect(
        repository.registrarServicio({
          ...baseServicioInput,
          insumos: [
            {
              id: 5,
              cantidad: 3,
              precio: 20,
            },
          ],
        })
      ).rejects.toThrow(
        "Stock insuficiente para insumo ID 5. Disponible: 1, solicitado: 3"
      );

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe registrar egreso de donación cuando monto_donacion es mayor a cero", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [300],
          },
        })
        .mockResolvedValueOnce({});

      await repository.registrarServicio({
        ...baseServicioInput,
        monto_donacion: 100,
        id_fondo: 10,
        id_donador: 1,
        metodo_pago: "transferencia",
        monto_pagado: 200,
      });

      expect(fondoRepositoryMock.registrarEgresoEnTransaccion).toHaveBeenCalledWith(
        connection,
        {
          monto: 100,
          id_fondo: 10,
          id_donador: 1,
          id_servicio_otorgado: 300,
          id_usuario: 7,
          motivo: "Pago de servicio con fondo de donaciones",
        }
      );

      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        metodo_pago: "donacion",
        monto_donacion: 100,
        id_donador: 1,
        id_fondo: 10,
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error si hay donación pero no se selecciona fondo o donador", async () => {
      connection.execute.mockResolvedValueOnce({
        outBinds: {
          id_servicio_otorgado: [301],
        },
      });

      await expect(
        repository.registrarServicio({
          ...baseServicioInput,
          monto_donacion: 100,
          id_fondo: null,
          id_donador: null,
        })
      ).rejects.toThrow("Debe seleccionar el fondo de donación a utilizar.");

      expect(fondoRepositoryMock.registrarEgresoEnTransaccion).not.toHaveBeenCalled();
      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe convertir método de pago tarjeta a tarjeta", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [302],
          },
        })
        .mockResolvedValueOnce({});

      await repository.registrarServicio({
        ...baseServicioInput,
        metodo_pago: "Tarjeta de crédito",
      });

      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        metodo_pago: "tarjeta",
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
    });

    test("debe convertir método de pago cheque a donacion", async () => {
      connection.execute
        .mockResolvedValueOnce({
          outBinds: {
            id_servicio_otorgado: [303],
          },
        })
        .mockResolvedValueOnce({});

      await repository.registrarServicio({
        ...baseServicioInput,
        metodo_pago: "cheque",
      });

      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        metodo_pago: "donacion",
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
    });

    test("debe hacer rollback si falla cualquier operación del registro", async () => {
      connection.execute.mockRejectedValueOnce(new Error("Error al insertar servicio"));

      await expect(repository.registrarServicio(baseServicioInput)).rejects.toThrow(
        "Error al insertar servicio"
      );

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("getHistorial", () => {
    test("debe regresar historial paginado y hasMore true cuando rows es igual al límite", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ID_SERVICIO_OTORGADO: 1,
            BENEFICIARIO: " Ana López ",
            SERVICIO: "Consulta",
            CATEGORIA: "Medicina",
            FECHA: "2026-06-04",
            HORA: "10:30",
            MONTO_SERVICIO: 300,
            MONTO_INVENTARIO: 50,
            DESCUENTO: 0,
            CUOTA_TOTAL: 350,
            MONTO_PAGADO: 350,
            METODO_PAGO: "efectivo",
            YA_APORTO: 1,
            MONTO_DONACION: 0,
          },
          {
            ID_SERVICIO_OTORGADO: 2,
            BENEFICIARIO: " Carlos Ruiz ",
            SERVICIO: "Estudio",
            CATEGORIA: "Laboratorio",
            FECHA: "2026-06-05",
            HORA: "11:00",
            MONTO_SERVICIO: null,
            MONTO_INVENTARIO: null,
            DESCUENTO: null,
            CUOTA_TOTAL: null,
            MONTO_PAGADO: null,
            METODO_PAGO: null,
            YA_APORTO: null,
            MONTO_DONACION: null,
          },
        ],
      });

      const result = await repository.getHistorial(2, 1);

      expect(result).toEqual({
        data: [
          {
            id: 1,
            beneficiario: "Ana López",
            nombre: "Consulta",
            categoria: "Medicina",
            fecha: "2026-06-04",
            hora: "10:30",
            montoServicio: 300,
            montoInventario: 50,
            descuento: 0,
            cuotaTotal: 350,
            montoPagado: 350,
            metodoPago: "efectivo",
            yaAporto: 1,
            montoDonacion: 0,
          },
          {
            id: 2,
            beneficiario: "Carlos Ruiz",
            nombre: "Estudio",
            categoria: "Laboratorio",
            fecha: "2026-06-05",
            hora: "11:00",
            montoServicio: null,
            montoInventario: null,
            descuento: null,
            cuotaTotal: null,
            montoPagado: null,
            metodoPago: null,
            yaAporto: null,
            montoDonacion: null,
          },
        ],
        hasMore: true,
        page: 1,
        limit: 2,
      });

      expect(connection.execute).toHaveBeenCalledWith(
        expect.anything(),
        {
          limit: 2,
          offset: 2,
        },
        expect.any(Object)
      );
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar hasMore false cuando rows es menor al límite", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ID_SERVICIO_OTORGADO: 1,
            BENEFICIARIO: "Ana López",
            SERVICIO: "Consulta",
            CATEGORIA: "Medicina",
            FECHA: "2026-06-04",
            HORA: "10:30",
            MONTO_SERVICIO: 300,
            MONTO_INVENTARIO: 0,
            DESCUENTO: 0,
            CUOTA_TOTAL: 300,
            MONTO_PAGADO: 300,
            METODO_PAGO: "efectivo",
            YA_APORTO: 0,
            MONTO_DONACION: 0,
          },
        ],
      });

      const result = await repository.getHistorial(20, 0);

      expect(result.hasMore).toBe(false);
      expect(result.page).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.data).toHaveLength(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar data vacía si Oracle no devuelve rows", async () => {
      connection.execute.mockResolvedValueOnce({});

      const result = await repository.getHistorial();

      expect(result).toEqual({
        data: [],
        hasMore: false,
        page: 0,
        limit: 20,
      });

      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCategorias", () => {
    test("debe regresar las categorías del catálogo", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          { CATEGORIA: "Consulta" },
          { CATEGORIA: "Estudios" },
          { CATEGORIA: "Terapia" },
        ],
      });

      const result = await repository.getCategorias();

      expect(result).toEqual(["Consulta", "Estudios", "Terapia"]);
      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío si no hay categorías", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await repository.getCategorias();

      expect(result).toEqual([]);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("crearServicioCatalogo", () => {
    test("debe crear un servicio en catálogo y limpiar espacios del input", async () => {
      connection.execute.mockResolvedValueOnce({
        outBinds: {
          id_catalogo_servicio: [50],
        },
      });

      const result = await repository.crearServicioCatalogo({
        nombre: " Consulta general ",
        categoria: " Medicina ",
        precio: 300,
      });

      expect(result).toEqual({
        id: 50,
      });

      expect(connection.execute).toHaveBeenCalledWith(
        expect.anything(),
        {
          nombre: "Consulta general",
          categoria: "Medicina",
          precio: 300,
          id_catalogo_servicio: expect.any(Object),
        }
      );

      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe hacer rollback si falla al crear servicio de catálogo", async () => {
      connection.execute.mockRejectedValueOnce(new Error("Error al crear catálogo"));

      await expect(
        repository.crearServicioCatalogo({
          nombre: "Consulta",
          categoria: "Medicina",
          precio: 300,
        })
      ).rejects.toThrow("Error al crear catálogo");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });
});