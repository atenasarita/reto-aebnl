/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

const mockGetConnection = jest.fn() as any;
const mockExecute = jest.fn() as any;
const mockClose = jest.fn() as any;

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

jest.unstable_mockModule("../../server/src/repositories/citas.queries", () => ({
  citasQueries: {
    getCitas: "SELECT * FROM CITAS",
    checkEmpalme: "SELECT COUNT(*) AS total FROM CITAS WHERE EMPALME",
    insertCita: "INSERT INTO CITAS",
  },
}));

jest.unstable_mockModule("../../server/src/repositories/especialistas.queries", () => ({
  especialistasQueries: {
    updateCita: "UPDATE CITAS",
  },
}));

let OracleCitasRepository: any;
let ConflictError: any;

beforeAll(async () => {
  const repositoryModule = await import("../../server/src/repositories/citas.repository");
  const errorModule = await import("../../server/src/errors/appError");

  OracleCitasRepository = repositoryModule.OracleCitasRepository;
  ConflictError = errorModule.ConflictError;
});

function setupConnection() {
  const connection = {
    execute: mockExecute,
    close: mockClose,
  };

  mockGetConnection.mockResolvedValue(connection);

  return connection;
}

describe("OracleCitasRepository", () => {
  let repository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockExecute.mockReset();
    mockClose.mockReset();
    mockGetConnection.mockReset();

    setupConnection();

    repository = new OracleCitasRepository();
  });

  describe("getCitas", () => {
    test("debe obtener las citas y cerrar la conexión", async () => {
      const citasMock = [
        {
          id_cita: 1,
          beneficiario: "Ana López",
          fecha: "2026-06-05",
          hora: "10:00",
        },
        {
          id_cita: 2,
          beneficiario: "Carlos Pérez",
          fecha: "2026-06-06",
          hora: "11:00",
        },
      ];

      mockExecute.mockResolvedValue({
        rows: citasMock,
      });

      const result = await repository.getCitas();

      expect(mockGetConnection).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith(
        "SELECT * FROM CITAS",
        {},
        {
          outFormat: 4002,
        }
      );
      expect(result).toEqual(citasMock);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe regresar arreglo vacío cuando la consulta no devuelve rows", async () => {
      mockExecute.mockResolvedValue({});

      const result = await repository.getCitas();

      expect(result).toEqual([]);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe cerrar la conexión aunque ocurra un error al obtener citas", async () => {
      const errorMock = new Error("Error al consultar citas");

      mockExecute.mockRejectedValue(errorMock);

      await expect(repository.getCitas()).rejects.toThrow("Error al consultar citas");

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("createCita", () => {
    test("debe crear una cita correctamente cuando no hay empalme", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const input = {
        id_beneficiario: 10,
        fecha: "2026-06-05",
        hora: "10:00",
        id_especialista: 3,
        id_catalogo_servicio: 2,
        motivo: "Consulta inicial",
        notas: "Paciente llega acompañado",
        estatus: "programada",
      };

      const result = await repository.createCita(input);

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        "SELECT COUNT(*) AS total FROM CITAS WHERE EMPALME",
        {
          id_especialista: 3,
          fecha: "2026-06-05",
          hora: "10:00",
          id_cita: null,
        },
        {
          outFormat: 4002,
        }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "INSERT INTO CITAS",
        {
          id_beneficiario: 10,
          fecha: "2026-06-05",
          hora: "10:00",
          id_especialista: 3,
          id_catalogo_servicio: 2,
          motivo: "Consulta inicial",
          notas: "Paciente llega acompañado",
          estatus: "programada",
        },
        {
          autoCommit: true,
        }
      );

      expect(result).toEqual({
        message: "Cita creada correctamente",
      });

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe limpiar la fecha cuando viene como string con formato ISO", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const input = {
        id_beneficiario: 10,
        fecha: "2026-06-05T00:00:00.000Z",
        hora: "12:00",
        id_especialista: 4,
        id_catalogo_servicio: 5,
      };

      await repository.createCita(input);

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        "SELECT COUNT(*) AS total FROM CITAS WHERE EMPALME",
        {
          id_especialista: 4,
          fecha: "2026-06-05",
          hora: "12:00",
          id_cita: null,
        },
        {
          outFormat: 4002,
        }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "INSERT INTO CITAS",
        expect.objectContaining({
          fecha: "2026-06-05",
        }),
        {
          autoCommit: true,
        }
      );

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe mandar motivo y notas como null cuando no vienen en el input", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const input = {
        id_beneficiario: 20,
        fecha: "2026-06-07",
        hora: "09:00",
        id_especialista: 1,
        id_catalogo_servicio: 8,
      };

      await repository.createCita(input);

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "INSERT INTO CITAS",
        {
          id_beneficiario: 20,
          fecha: "2026-06-07",
          hora: "09:00",
          id_especialista: 1,
          id_catalogo_servicio: 8,
          motivo: null,
          notas: null,
          estatus: "programada",
        },
        {
          autoCommit: true,
        }
      );

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ConflictError cuando existe empalme de cita", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [{ total: 1 }],
      });

      const input = {
        id_beneficiario: 10,
        fecha: "2026-06-05",
        hora: "10:00",
        id_especialista: 3,
        id_catalogo_servicio: 2,
      };

      let errorCapturado: any;

      try {
        await repository.createCita(input);
      } catch (error) {
        errorCapturado = error;
      }

      expect(errorCapturado).toBeInstanceOf(ConflictError);
      expect(errorCapturado.message).toBe(
        "El especialista ya tiene una cita programada el 2026-06-05 a las 10:00."
      );

      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledWith(
        "SELECT COUNT(*) AS total FROM CITAS WHERE EMPALME",
        {
          id_especialista: 3,
          fecha: "2026-06-05",
          hora: "10:00",
          id_cita: null,
        },
        {
          outFormat: 4002,
        }
      );

      expect(mockExecute).not.toHaveBeenCalledWith(
        "INSERT INTO CITAS",
        expect.anything(),
        expect.anything()
      );

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe cerrar la conexión cuando falla el insert de la cita", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockRejectedValueOnce(new Error("Error al insertar cita"));

      const input = {
        id_beneficiario: 10,
        fecha: "2026-06-05",
        hora: "10:00",
        id_especialista: 3,
        id_catalogo_servicio: 2,
      };

      await expect(repository.createCita(input)).rejects.toThrow("Error al insertar cita");

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateCita", () => {
    test("debe actualizar una cita correctamente cuando no hay empalme y rowsAffected es mayor a cero", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const input = {
        fecha: "2026-06-10",
        hora: "13:00",
        id_especialista: 5,
        id_catalogo_servicio: 4,
        motivo: "Seguimiento",
        notas: "Actualizar tratamiento",
        estatus: "programada",
      };

      const result = await repository.updateCita(15, input);

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        "SELECT COUNT(*) AS total FROM CITAS WHERE EMPALME",
        {
          id_especialista: 5,
          fecha: "2026-06-10",
          hora: "13:00",
          id_cita: 15,
        },
        {
          outFormat: 4002,
        }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "UPDATE CITAS",
        {
          id_cita: 15,
          fecha: "2026-06-10",
          hora: "13:00",
          id_especialista: 5,
          id_catalogo_servicio: 4,
          motivo: "Seguimiento",
          notas: "Actualizar tratamiento",
          estatus: "programada",
        },
        {
          autoCommit: true,
        }
      );

      expect(result).toEqual({
        message: "Cita actualizada correctamente",
      });

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe limpiar la fecha al actualizar cuando viene en formato ISO", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const input = {
        fecha: "2026-06-10T00:00:00.000Z",
        hora: "13:00",
        id_especialista: 5,
        id_catalogo_servicio: 4,
      };

      await repository.updateCita(15, input);

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "UPDATE CITAS",
        expect.objectContaining({
          fecha: "2026-06-10",
        }),
        {
          autoCommit: true,
        }
      );

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe mandar motivo, notas y estatus por defecto al actualizar si no vienen en el input", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const input = {
        fecha: "2026-06-10",
        hora: "13:00",
        id_especialista: 5,
        id_catalogo_servicio: 4,
      };

      await repository.updateCita(15, input);

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "UPDATE CITAS",
        {
          id_cita: 15,
          fecha: "2026-06-10",
          hora: "13:00",
          id_especialista: 5,
          id_catalogo_servicio: 4,
          motivo: null,
          notas: null,
          estatus: "programada",
        },
        {
          autoCommit: true,
        }
      );

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar ConflictError cuando existe empalme al actualizar", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [{ total: 1 }],
      });

      const input = {
        fecha: "2026-06-10",
        hora: "13:00",
        id_especialista: 5,
        id_catalogo_servicio: 4,
      };

      let errorCapturado: any;

      try {
        await repository.updateCita(15, input);
      } catch (error) {
        errorCapturado = error;
      }

      expect(errorCapturado).toBeInstanceOf(ConflictError);
      expect(errorCapturado.message).toBe(
        "El especialista ya tiene una cita programada el 2026-06-10 a las 13:00."
      );

      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe lanzar error cuando la cita no existe y rowsAffected es cero", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 0,
        });

      const input = {
        fecha: "2026-06-10",
        hora: "13:00",
        id_especialista: 5,
        id_catalogo_servicio: 4,
      };

      await expect(repository.updateCita(15, input)).rejects.toThrow("Cita no encontrada.");

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test("debe cerrar la conexión cuando falla el update de la cita", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ total: 0 }],
        })
        .mockRejectedValueOnce(new Error("Error al actualizar cita"));

      const input = {
        fecha: "2026-06-10",
        hora: "13:00",
        id_especialista: 5,
        id_catalogo_servicio: 4,
      };

      await expect(repository.updateCita(15, input)).rejects.toThrow("Error al actualizar cita");

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });
});