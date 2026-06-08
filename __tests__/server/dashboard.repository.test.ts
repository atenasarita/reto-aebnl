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

let DashboardRepository: any;

beforeAll(async () => {
  const module = await import("../../server/src/repositories/dashboard.repository");
  DashboardRepository = module.DashboardRepository;
});

const createMockConnection = () => ({
  execute: jest.fn() as any,
  commit: jest.fn(async () => undefined) as any,
  rollback: jest.fn(async () => undefined) as any,
  close: jest.fn(async () => undefined) as any,
});

describe("DashboardRepository", () => {
  let connection: any;
  let repository: any;

  beforeEach(() => {
    connection = createMockConnection();
    mockGetConnection.mockImplementation(async () => connection);
    repository = new DashboardRepository();

    jest.clearAllMocks();
  });

  describe("getAgendaHoy", () => {
    test("debe obtener la agenda del día, mapear los campos y cerrar conexión", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ID_CITA: 1,
            FECHA: "2026-06-05",
            HORA: "10:00",
            ESTATUS: "programada",
            ID_BENEFICIARIO: 15,
            ID_ESPECIALISTA: 3,
            NOMBRE_COMPLETO: "Ana López",
            FOLIO: "BEN-001",
            ESPECIALISTA_NOMBRE: "Dra. Pérez",
            SERVICIO_NOMBRE: "Consulta",
            MOTIVO: "Seguimiento",
            NOTAS: "Sin notas",
          },
        ],
      });

      const result = await repository.getAgendaHoy("2026-06-05");

      expect(connection.execute).toHaveBeenCalledWith(
        expect.anything(),
        { fecha: "2026-06-05" },
        expect.any(Object)
      );

      expect(result).toEqual([
        {
          id_cita: 1,
          fecha: "2026-06-05",
          hora: "10:00",
          estatus: "programada",
          id_beneficiario: 15,
          id_especialista: 3,
          nombre_completo: "Ana López",
          folio: "BEN-001",
          especialista_nombre: "Dra. Pérez",
          servicio_nombre: "Consulta",
          motivo: "Seguimiento",
          notas: "Sin notas",
        },
      ]);

      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío si no hay citas en agenda", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await repository.getAgendaHoy("2026-06-05");

      expect(result).toEqual([]);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("getPreregistroPendientes", () => {
    test("debe obtener preregistros pendientes, mapear campos y cerrar conexión", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [
          {
            ID_PREREGISTRO: 1,
            NOMBRES: "Carlos",
            APELLIDO_PATERNO: "Ruiz",
            APELLIDO_MATERNO: "García",
            NOMBRE_COMPLETO: "Carlos Ruiz García",
            CURP: "CURP123",
            GENERO: "masculino",
            FECHA_NACIMIENTO: "2010-01-01",
            ESTADO: "pendiente",
            ID_BENEFICIARIO: null,
          },
        ],
      });

      const result = await repository.getPreregistroPendientes();

      expect(connection.execute).toHaveBeenCalledWith(
        expect.anything(),
        {},
        expect.any(Object)
      );

      expect(result).toEqual([
        {
          id_preregistro: 1,
          nombres: "Carlos",
          apellido_paterno: "Ruiz",
          apellido_materno: "García",
          nombre_completo: "Carlos Ruiz García",
          curp: "CURP123",
          genero: "masculino",
          fecha_nacimiento: "2010-01-01",
          estado: "pendiente",
          id_beneficiario: null,
        },
      ]);

      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío si no hay preregistros pendientes", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await repository.getPreregistroPendientes();

      expect(result).toEqual([]);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("updatePreregistroEstado", () => {
    test("debe lanzar error y hacer rollback si el preregistro no existe", async () => {
      connection.execute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        repository.updatePreregistroEstado({
          id_preregistro: 99,
          estado: "aceptado",
        })
      ).rejects.toThrow("Preregistro no encontrado");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe rechazar preregistro sin crear beneficiario y usando autoCommit", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              ID_PREREGISTRO: 1,
              NOMBRES: "Ana",
              GENERO: "femenino",
            },
          ],
        })
        .mockResolvedValueOnce({});

      const result = await repository.updatePreregistroEstado({
        id_preregistro: 1,
        estado: "rechazado",
      });

      expect(result).toEqual({
        ok: true,
        estado: "rechazado",
      });

      expect(connection.execute).toHaveBeenCalledTimes(2);

      expect(connection.execute.mock.calls[1][1]).toEqual({
        id_preregistro: 1,
        estado: "rechazado",
      });

      expect(connection.execute.mock.calls[1][2]).toEqual({
        autoCommit: true,
      });

      expect(connection.commit).not.toHaveBeenCalled();
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe aceptar preregistro, crear beneficiario, insertar identificadores, espinas y hacer commit", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              ID_PREREGISTRO: 1,
              GENERO: "femenino",
              CURP: "CURP123",
              NOMBRES: "Ana",
              APELLIDO_PATERNO: "López",
              APELLIDO_MATERNO: "García",
              FECHA_NACIMIENTO: "2010-01-01",
              ESTADO_NACIMIENTO: "Nuevo León",
              FOTOGRAFIA: "foto.png",
              TELEFONO: "8188888888",
              EMAIL: "ana@test.com",
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_beneficiario: [25],
          },
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          rows: [
            {
              ID_ESPINA: 1,
            },
            {
              ID_ESPINA: 3,
            },
          ],
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const result = await repository.updatePreregistroEstado({
        id_preregistro: 1,
        estado: "aceptado",
      });

      expect(result).toEqual({
        ok: true,
        estado: "aceptado",
        id_beneficiario: 25,
      });

      expect(connection.execute).toHaveBeenCalledTimes(8);

      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        folio: "TMP000000000",
        genero: "femenino",
      });

      expect(connection.execute.mock.calls[2][1]).toEqual({
        id_beneficiario: 25,
      });

      expect(connection.execute.mock.calls[3][1]).toMatchObject({
        id_beneficiario: 25,
        curp: "CURP123",
        nombres: "Ana",
        apellido_paterno: "López",
        apellido_materno: "García",
        fecha_nacimiento: "2010-01-01",
        estado_nacimiento: "Nuevo León",
        fotografia: "foto.png",
        telefono: "8188888888",
        email: "ana@test.com",
      });

      expect(connection.execute.mock.calls[5][1]).toEqual({
        id_beneficiario: 25,
        id_espina: 1,
      });

      expect(connection.execute.mock.calls[6][1]).toEqual({
        id_beneficiario: 25,
        id_espina: 3,
      });

      expect(connection.execute.mock.calls[7][1]).toEqual({
        id_preregistro: 1,
        id_beneficiario: 25,
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.rollback).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe aceptar preregistro usando valores por defecto si faltan campos", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              id_preregistro: 1,
              genero: null,
              curp: null,
              nombres: null,
              apellido_paterno: null,
              apellido_materno: null,
              fecha_nacimiento: "2012-02-02",
              estado_nacimiento: null,
              fotografia: null,
              telefono: null,
              email: null,
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_beneficiario: [30],
          },
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({});

      const result = await repository.updatePreregistroEstado({
        id_preregistro: 1,
        estado: "aceptado",
      });

      expect(result).toEqual({
        ok: true,
        estado: "aceptado",
        id_beneficiario: 30,
      });

      expect(connection.execute.mock.calls[1][1]).toMatchObject({
        genero: "otro",
      });

      expect(connection.execute.mock.calls[3][1]).toMatchObject({
        id_beneficiario: 30,
        curp: "",
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        fecha_nacimiento: "2012-02-02",
        estado_nacimiento: "N/A",
        fotografia: "",
        telefono: "",
        email: "",
      });

      expect(connection.commit).toHaveBeenCalledTimes(1);
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error y hacer rollback si no se pudo crear el beneficiario", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              ID_PREREGISTRO: 1,
              GENERO: "femenino",
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_beneficiario: [],
          },
        });

      await expect(
        repository.updatePreregistroEstado({
          id_preregistro: 1,
          estado: "aceptado",
        })
      ).rejects.toThrow("No se pudo crear el beneficiario");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.commit).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });

    test("debe hacer rollback si falla alguna operación al aceptar preregistro", async () => {
      connection.execute
        .mockResolvedValueOnce({
          rows: [
            {
              ID_PREREGISTRO: 1,
              GENERO: "femenino",
            },
          ],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id_beneficiario: [25],
          },
        })
        .mockRejectedValueOnce(new Error("Error al actualizar folio"));

      await expect(
        repository.updatePreregistroEstado({
          id_preregistro: 1,
          estado: "aceptado",
        })
      ).rejects.toThrow("Error al actualizar folio");

      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.commit).not.toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalledTimes(1);
    });
  });
});