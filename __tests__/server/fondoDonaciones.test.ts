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

let FondoDonacionesRepository: any;

beforeAll(async () => {
  const module = await import("../../server/src/repositories/fondoDonaciones.repository");
  FondoDonacionesRepository = module.FondoDonacionesRepository;
});

const createMockConnection = () => ({
  execute: jest.fn() as any,
  commit: jest.fn(async () => undefined) as any,
  rollback: jest.fn(async () => undefined) as any,
  close: jest.fn(async () => undefined) as any,
});

const donadorRow = {
  ID_DONADOR: 1,
  TIPO_ORIGEN: "marca",
  NOMBRE: "Donador Uno",
  ID_FONDO: 10,
  SALDO: 500,
  FECHA_ACTUALIZACION: "2026-06-04",
};

const fondoLockRow = {
  ID_FONDO: 10,
  ID_DONADOR: 1,
  SALDO: 500,
  TIPO_ORIGEN: "marca",
  NOMBRE: "Donador Uno",
};

const movimientoRow = {
  ID_MOVIMIENTO: 100,
  TIPO_MOVIMIENTO: "ABONO",
  MONTO: 200,
  SALDO_ANTERIOR: 300,
  SALDO_NUEVO: 500,
  ORIGEN_TIPO: "marca",
  ORIGEN_NOMBRE: "Donador Uno",
  CONCEPTO: "Donación mensual",
  ID_DONADOR: 1,
  ID_FONDO: 10,
  DONADOR_NOMBRE: "Donador Uno",
  DONADOR_TIPO: "marca",
  ID_SERVICIO_OTORGADO: null,
  FOLIO_SERVICIO: null,
  NOMBRE_SERVICIO: null,
  ID_USUARIO: 7,
  FECHA: "2026-06-04",
  MOTIVO: "Abono al fondo de donaciones",
};

describe("FondoDonacionesRepository", () => {
  let connection: any;
  let repository: any;

  beforeEach(() => {
    connection = createMockConnection();
    mockGetConnection.mockResolvedValue(connection);
    repository = new FondoDonacionesRepository();
    jest.clearAllMocks();
  });

  describe("crearDonador", () => {
    test("debe crear un donador nuevo con fondo y hacer commit", async () => {
      connection.execute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ NEXT_ID: 1 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ NEXT_ID: 10 }] })
        .mockResolvedValueOnce({});

      const result = await repository.crearDonador({
        tipo_origen: "marca",
        nombre: " Donador Uno ",
      });

      expect(result).toMatchObject({
        id_donador: 1,
        id_fondo: 10,
        tipo_origen: "marca",
        nombre: "Donador Uno",
        saldo: 0,
      });
      expect(result.fecha_actualizacion).toEqual(expect.any(String));
      expect(connection.execute).toHaveBeenCalledTimes(5);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error si ya existe un donador con el mismo tipo y nombre", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [{ ID_DONADOR: 1 }],
      });

      await expect(
        repository.crearDonador({
          tipo_origen: "marca",
          nombre: "Donador Uno",
        })
      ).rejects.toThrow("Ya existe una marca o familia con ese nombre.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.commit).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe hacer rollback si falla la creación del donador", async () => {
      connection.execute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ NEXT_ID: 1 }] })
        .mockRejectedValueOnce(new Error("Error al insertar donador"));

      await expect(
        repository.crearDonador({
          tipo_origen: "familia",
          nombre: "Familia López",
        })
      ).rejects.toThrow("Error al insertar donador");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("getSaldo", () => {
    test("debe regresar el saldo agregado del fondo", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            SALDO: 1500.5,
            FECHA_ACTUALIZACION: "2026-06-04",
          },
        ],
      });

      const result = await repository.getSaldo();

      expect(result).toEqual({
        saldo: 1500.5,
        fecha_actualizacion: "2026-06-04",
      });
      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar saldo cero si Oracle no devuelve filas", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await repository.getSaldo();

      expect(result).toEqual({
        saldo: 0,
        fecha_actualizacion: "",
      });
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("listarDonadores", () => {
    test("debe listar donadores con su fondo mapeado", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [donadorRow],
      });

      const result = await repository.listarDonadores();

      expect(result).toEqual([
        {
          id_donador: 1,
          id_fondo: 10,
          tipo_origen: "marca",
          nombre: "Donador Uno",
          saldo: 500,
          fecha_actualizacion: "2026-06-04",
        },
      ]);
      expect(connection.execute).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío si no hay donadores", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await repository.listarDonadores();

      expect(result).toEqual([]);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("listarMovimientos", () => {
    test("debe listar movimientos generales usando límite por defecto", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [movimientoRow],
      });

      const result = await repository.listarMovimientos();

      expect(result).toEqual([
        {
          id_movimiento: 100,
          tipo_movimiento: "abono",
          monto: 200,
          saldo_anterior: 300,
          saldo_nuevo: 500,
          origen_tipo: "marca",
          origen_nombre: "Donador Uno",
          concepto: "Donación mensual",
          id_donador: 1,
          id_fondo: 10,
          donador_nombre: "Donador Uno",
          id_servicio_otorgado: null,
          folio_servicio: null,
          servicio_nombre: null,
          id_usuario: 7,
          fecha: "2026-06-04",
          motivo: "Abono al fondo de donaciones",
        },
      ]);
      expect(connection.execute).toHaveBeenCalledWith(
        expect.anything(),
        { limite: 100 },
        expect.any(Object)
      );
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe listar movimientos filtrados por donador cuando idDonador es mayor a cero", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [movimientoRow],
      });

      const result = await repository.listarMovimientos(25, 1);

      expect(result).toHaveLength(1);
      expect(connection.execute).toHaveBeenCalledWith(
        expect.anything(),
        { limite: 25, id_donador: 1 },
        expect.any(Object)
      );
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe usar FOLIO_SERVICIO cuando ID_SERVICIO_OTORGADO viene null", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ...movimientoRow,
            ID_SERVICIO_OTORGADO: null,
            FOLIO_SERVICIO: 77,
            ORIGEN_TIPO: null,
            ORIGEN_NOMBRE: null,
          },
        ],
      });

      const result = await repository.listarMovimientos(10, null);

      expect(result[0].id_servicio_otorgado).toBe(77);
      expect(result[0].folio_servicio).toBe(77);
      expect(result[0].origen_tipo).toBe("marca");
      expect(result[0].origen_nombre).toBe("Donador Uno");
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío si no hay movimientos", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await repository.listarMovimientos();

      expect(result).toEqual([]);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("registrarAbono", () => {
    test("debe registrar un abono, actualizar saldo y hacer commit", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [donadorRow],
        })
        .mockResolvedValueOnce({
          rows: [fondoLockRow],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_movimiento: [99],
          },
        })
        .mockResolvedValueOnce({});

      const result = await repository.registrarAbono({
        id_donador: 1,
        monto: 250,
        concepto: "Donación de junio",
        id_usuario: 7,
      });

      expect(result).toMatchObject({
        id_movimiento: 99,
        tipo_movimiento: "abono",
        monto: 250,
        saldo_anterior: 500,
        saldo_nuevo: 750,
        origen_tipo: "marca",
        origen_nombre: "Donador Uno",
        concepto: "Donación de junio",
        id_donador: 1,
        id_fondo: 10,
        donador_nombre: "Donador Uno",
        id_servicio_otorgado: null,
        folio_servicio: null,
        servicio_nombre: null,
        id_usuario: 7,
        motivo: "Abono al fondo de donaciones",
      });
      expect(result.fecha).toEqual(expect.any(String));
      expect(connection.execute).toHaveBeenCalledTimes(4);
      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error si el donador no existe al registrar abono", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        repository.registrarAbono({
          id_donador: 99,
          monto: 100,
          concepto: "Donación",
          id_usuario: 7,
        })
      ).rejects.toThrow("Marca o familia no encontrada.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error si el fondo no existe al registrar abono", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [donadorRow],
        })
        .mockResolvedValueOnce({
          rows: [],
        });

      await expect(
        repository.registrarAbono({
          id_donador: 1,
          monto: 100,
          concepto: "Donación",
          id_usuario: 7,
        })
      ).rejects.toThrow("Fondo de donación no encontrado.");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("registrarEgresoEnTransaccion", () => {
    test("no debe hacer nada si el monto es cero", async () => {
      await repository.registrarEgresoEnTransaccion(connection, {
        id_fondo: 10,
        id_donador: 1,
        monto: 0,
        id_servicio_otorgado: 50,
        id_usuario: 7,
        motivo: "Pago",
      });

      expect(connection.execute).not.toHaveBeenCalled();
    });

    test("no debe hacer nada si el monto es negativo", async () => {
      await repository.registrarEgresoEnTransaccion(connection, {
        id_fondo: 10,
        id_donador: 1,
        monto: -10,
        id_servicio_otorgado: 50,
        id_usuario: 7,
        motivo: "Pago",
      });

      expect(connection.execute).not.toHaveBeenCalled();
    });

    test("debe registrar egreso y disminuir saldo cuando hay saldo suficiente", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [fondoLockRow],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_movimiento: [101],
          },
        })
        .mockResolvedValueOnce({});

      await repository.registrarEgresoEnTransaccion(connection, {
        id_fondo: 10,
        id_donador: 1,
        monto: 150,
        id_servicio_otorgado: 55,
        id_usuario: 7,
        motivo: "Pago de servicio",
      });

      expect(connection.execute).toHaveBeenCalledTimes(3);
      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        tipo_movimiento: "egreso",
        monto: 150,
        saldo_anterior: 500,
        saldo_nuevo: 350,
        origen_tipo: "marca",
        origen_nombre: "Donador Uno",
        concepto: "Folio #55",
        id_servicio_otorgado: 55,
        id_usuario: 7,
        motivo: "Pago de servicio",
        id_donador: 1,
        id_fondo: 10,
      });
      expect(connection.execute.mock.calls[2][1]).toMatchObject({
        saldo: 350,
        id_fondo: 10,
      });
    });

    test("debe usar motivo automático si no se manda motivo en egreso", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [fondoLockRow],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_movimiento: [102],
          },
        })
        .mockResolvedValueOnce({});

      await repository.registrarEgresoEnTransaccion(connection, {
        id_fondo: 10,
        id_donador: 1,
        monto: 100,
        id_servicio_otorgado: 60,
        id_usuario: 7,
      });

      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        motivo: "Pago de servicio folio #60",
        concepto: "Folio #60",
      });
    });

    test("debe lanzar error si el fondo no existe en egreso", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        repository.registrarEgresoEnTransaccion(connection, {
          id_fondo: 99,
          id_donador: 1,
          monto: 100,
          id_servicio_otorgado: 50,
          id_usuario: 7,
        })
      ).rejects.toThrow("Fondo de donación no encontrado.");

      expect(connection.execute).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error si el saldo es insuficiente para el egreso", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ...fondoLockRow,
            SALDO: 50,
          },
        ],
      });

      await expect(
        repository.registrarEgresoEnTransaccion(connection, {
          id_fondo: 10,
          id_donador: 1,
          monto: 100,
          id_servicio_otorgado: 50,
          id_usuario: 7,
        })
      ).rejects.toThrow(
        "Saldo insuficiente en fondo de donaciones. Disponible: 50.00, solicitado: 100.00"
      );

      expect(connection.execute).toHaveBeenCalledTimes(1);
    });
  });
});