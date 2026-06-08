/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

const mockGetCitas = jest.fn() as any;
const mockCreateCita = jest.fn() as any;
const mockUpdateCita = jest.fn() as any;

jest.unstable_mockModule("../../server/src/repositories/citas.repository", () => ({
  OracleCitasRepository: jest.fn().mockImplementation(() => ({
    getCitas: mockGetCitas,
    createCita: mockCreateCita,
    updateCita: mockUpdateCita,
  })),
}));

let getCitas: any;
let createCita: any;
let updateCita: any;

beforeAll(async () => {
  const handler = await import("../../server/src/handlers/citas.handler");

  getCitas = handler.getCitas;
  createCita = handler.createCita;
  updateCita = handler.updateCita;
});

const createMockResponse = () => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("Handlers de citas", () => {
  let res: any;
  let next: any;

  beforeEach(() => {
    res = createMockResponse();
    next = jest.fn();

    mockGetCitas.mockReset();
    mockCreateCita.mockReset();
    mockUpdateCita.mockReset();
  });

  describe("getCitas", () => {
    test("debe responder con la lista de citas", async () => {
      const citasMock = [
        {
          id_cita: 1,
          beneficiario: "Ana López",
          fecha: "2026-06-05",
          hora: "10:00",
          estatus: "programada",
        },
        {
          id_cita: 2,
          beneficiario: "Carlos Pérez",
          fecha: "2026-06-06",
          hora: "11:00",
          estatus: "programada",
        },
      ];

      mockGetCitas.mockResolvedValue(citasMock);

      await getCitas({} as any, res, next);

      expect(mockGetCitas).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(citasMock);
      expect(res.status).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("debe responder con arreglo vacío cuando no hay citas", async () => {
      mockGetCitas.mockResolvedValue([]);

      await getCitas({} as any, res, next);

      expect(mockGetCitas).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith([]);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar next cuando ocurre un error al obtener citas", async () => {
      const errorMock = new Error("Error al obtener citas");

      mockGetCitas.mockRejectedValue(errorMock);

      await getCitas({} as any, res, next);

      expect(mockGetCitas).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("createCita", () => {
    test("debe crear una cita y responder con status 201", async () => {
      const req: any = {
        body: {
          id_beneficiario: 10,
          fecha: "2026-06-05",
          hora: "10:00",
          id_especialista: 3,
          id_catalogo_servicio: 2,
          motivo: "Consulta inicial",
          notas: "Paciente llega acompañado",
          estatus: "programada",
        },
      };

      const resultadoMock = {
        message: "Cita creada correctamente",
      };

      mockCreateCita.mockResolvedValue(resultadoMock);

      await createCita(req, res, next);

      expect(mockCreateCita).toHaveBeenCalledTimes(1);
      expect(mockCreateCita).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(resultadoMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe crear una cita aunque el body tenga solo los campos obligatorios", async () => {
      const req: any = {
        body: {
          id_beneficiario: 10,
          fecha: "2026-06-05",
          hora: "10:00",
          id_especialista: 3,
          id_catalogo_servicio: 2,
        },
      };

      const resultadoMock = {
        message: "Cita creada correctamente",
      };

      mockCreateCita.mockResolvedValue(resultadoMock);

      await createCita(req, res, next);

      expect(mockCreateCita).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(resultadoMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar next cuando ocurre un error al crear cita", async () => {
      const req: any = {
        body: {
          id_beneficiario: 10,
          fecha: "2026-06-05",
          hora: "10:00",
          id_especialista: 3,
          id_catalogo_servicio: 2,
        },
      };

      const errorMock = new Error("Error al crear cita");

      mockCreateCita.mockRejectedValue(errorMock);

      await createCita(req, res, next);

      expect(mockCreateCita).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test("debe enviar a next un error de conflicto cuando el repositorio lo lanza", async () => {
      const req: any = {
        body: {
          id_beneficiario: 10,
          fecha: "2026-06-05",
          hora: "10:00",
          id_especialista: 3,
          id_catalogo_servicio: 2,
        },
      };

      const errorMock = new Error(
        "El especialista ya tiene una cita programada el 2026-06-05 a las 10:00."
      );

      mockCreateCita.mockRejectedValue(errorMock);

      await createCita(req, res, next);

      expect(mockCreateCita).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("updateCita", () => {
    test("debe actualizar una cita y responder con el resultado", async () => {
      const req: any = {
        params: {
          id: "15",
        },
        body: {
          fecha: "2026-06-10",
          hora: "13:00",
          id_especialista: 5,
          id_catalogo_servicio: 4,
          motivo: "Seguimiento",
          notas: "Actualizar tratamiento",
          estatus: "programada",
        },
      };

      const resultadoMock = {
        message: "Cita actualizada correctamente",
      };

      mockUpdateCita.mockResolvedValue(resultadoMock);

      await updateCita(req, res, next);

      expect(mockUpdateCita).toHaveBeenCalledTimes(1);
      expect(mockUpdateCita).toHaveBeenCalledWith(15, req.body);
      expect(res.json).toHaveBeenCalledWith(resultadoMock);
      expect(res.status).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("debe convertir el id de params a número antes de actualizar", async () => {
      const req: any = {
        params: {
          id: "25",
        },
        body: {
          fecha: "2026-06-11",
          hora: "09:00",
          id_especialista: 2,
          id_catalogo_servicio: 7,
        },
      };

      const resultadoMock = {
        message: "Cita actualizada correctamente",
      };

      mockUpdateCita.mockResolvedValue(resultadoMock);

      await updateCita(req, res, next);

      expect(mockUpdateCita).toHaveBeenCalledWith(25, req.body);
      expect(res.json).toHaveBeenCalledWith(resultadoMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar al repositorio con NaN si el id no es numérico", async () => {
      const req: any = {
        params: {
          id: "abc",
        },
        body: {
          fecha: "2026-06-11",
          hora: "09:00",
          id_especialista: 2,
          id_catalogo_servicio: 7,
        },
      };

      const resultadoMock = {
        message: "Cita actualizada correctamente",
      };

      mockUpdateCita.mockResolvedValue(resultadoMock);

      await updateCita(req, res, next);

      expect(mockUpdateCita).toHaveBeenCalledWith(Number.NaN, req.body);
      expect(res.json).toHaveBeenCalledWith(resultadoMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar next cuando ocurre un error al actualizar cita", async () => {
      const req: any = {
        params: {
          id: "15",
        },
        body: {
          fecha: "2026-06-10",
          hora: "13:00",
          id_especialista: 5,
          id_catalogo_servicio: 4,
        },
      };

      const errorMock = new Error("Error al actualizar cita");

      mockUpdateCita.mockRejectedValue(errorMock);

      await updateCita(req, res, next);

      expect(mockUpdateCita).toHaveBeenCalledWith(15, req.body);
      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.json).not.toHaveBeenCalled();
    });

    test("debe enviar a next el error cuando la cita no existe", async () => {
      const req: any = {
        params: {
          id: "15",
        },
        body: {
          fecha: "2026-06-10",
          hora: "13:00",
          id_especialista: 5,
          id_catalogo_servicio: 4,
        },
      };

      const errorMock = new Error("Cita no encontrada.");

      mockUpdateCita.mockRejectedValue(errorMock);

      await updateCita(req, res, next);

      expect(mockUpdateCita).toHaveBeenCalledWith(15, req.body);
      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.json).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});