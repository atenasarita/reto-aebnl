/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, beforeAll, afterEach } from "@jest/globals";

const mockListarPorFecha = jest.fn() as any;
const mockListarPorMes = jest.fn() as any;
const mockListarRecibosRango = jest.fn() as any;
const mockObtenerPorId = jest.fn() as any;

jest.unstable_mockModule(
  "../../server/src/repositories/recibo.repository.js",
  () => ({
    ReciboRepository: jest.fn().mockImplementation(() => ({
      listarPorFecha: mockListarPorFecha,
      listarPorMes: mockListarPorMes,
      listarRecibosRango: mockListarRecibosRango,
      obtenerPorId: mockObtenerPorId,
    })),
  }),
  { virtual: true }
);

let listarRecibos: any;
let listarRecibosMes: any;
let listarRecibosRango: any;
let obtenerRecibo: any;

beforeAll(async () => {
  const module = await import("../../server/src/handlers/recibos.handler.ts");

  listarRecibos = module.listarRecibos;
  listarRecibosMes = module.listarRecibosMes;
  listarRecibosRango = module.listarRecibosRango;
  obtenerRecibo = module.obtenerRecibo;
});

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("ReciboHandler", () => {
  let res: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    res = createMockResponse();

    jest.clearAllMocks();

    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  describe("listarRecibos", () => {
    test("debe listar recibos por fecha válida recibida en query", async () => {
      const req = {
        query: {
          fecha: "2026-06-05",
        },
      };

      const recibos = [
        {
          id_recibo: 1,
          fecha: "2026-06-05",
          monto: 300,
        },
      ];

      mockListarPorFecha.mockResolvedValue(recibos);

      await listarRecibos(req as any, res);

      expect(mockListarPorFecha).toHaveBeenCalledWith("2026-06-05");
      expect(res.json).toHaveBeenCalledWith(recibos);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe usar la fecha de hoy si no se manda fecha en query", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));

      const req = {
        query: {},
      };

      const recibos = [
        {
          id_recibo: 2,
          fecha: "2026-06-05",
          monto: 150,
        },
      ];

      mockListarPorFecha.mockResolvedValue(recibos);

      await listarRecibos(req as any, res);

      expect(mockListarPorFecha).toHaveBeenCalledWith("2026-06-05");
      expect(res.json).toHaveBeenCalledWith(recibos);
    });

    test("debe responder 400 si la fecha tiene formato inválido", async () => {
      const req = {
        query: {
          fecha: "05/06/2026",
        },
      };

      await listarRecibos(req as any, res);

      expect(mockListarPorFecha).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Formato de fecha inválido. Usa YYYY-MM-DD.",
      });
    });

    test("debe responder 500 si el repositorio falla al listar por fecha", async () => {
      const req = {
        query: {
          fecha: "2026-06-05",
        },
      };

      mockListarPorFecha.mockRejectedValue(new Error("Error interno"));

      await listarRecibos(req as any, res);

      expect(mockListarPorFecha).toHaveBeenCalledWith("2026-06-05");
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error interno del servidor.",
      });
    });
  });

  describe("listarRecibosMes", () => {
    test("debe listar recibos por mes válido", async () => {
      const req = {
        query: {
          fecha: "2026-06",
        },
      };

      const recibos = [
        {
          id_recibo: 1,
          fecha: "2026-06-05",
        },
      ];

      mockListarPorMes.mockResolvedValue(recibos);

      await listarRecibosMes(req as any, res);

      expect(mockListarPorMes).toHaveBeenCalledWith("2026-06");
      expect(res.json).toHaveBeenCalledWith(recibos);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 400 si no se manda fecha del mes", async () => {
      const req = {
        query: {},
      };

      await listarRecibosMes(req as any, res);

      expect(mockListarPorMes).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Formato de fecha inválido. Usa YYYY-MM.",
      });
    });

    test("debe responder 400 si el mes tiene formato inválido", async () => {
      const req = {
        query: {
          fecha: "2026/06",
        },
      };

      await listarRecibosMes(req as any, res);

      expect(mockListarPorMes).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Formato de fecha inválido. Usa YYYY-MM.",
      });
    });

    test("debe responder 500 si el repositorio falla al listar por mes", async () => {
      const req = {
        query: {
          fecha: "2026-06",
        },
      };

      mockListarPorMes.mockRejectedValue(new Error("Error interno"));

      await listarRecibosMes(req as any, res);

      expect(mockListarPorMes).toHaveBeenCalledWith("2026-06");
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error interno del servidor.",
      });
    });
  });

  describe("listarRecibosRango", () => {
    test("debe listar recibos por rango de fechas válido", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "2026-06-05",
        },
      };

      const recibos = [
        {
          id_recibo: 1,
          fecha: "2026-06-02",
        },
      ];

      mockListarRecibosRango.mockResolvedValue(recibos);

      await listarRecibosRango(req as any, res);

      expect(mockListarRecibosRango).toHaveBeenCalledWith(
        "2026-06-01",
        "2026-06-05"
      );
      expect(res.json).toHaveBeenCalledWith(recibos);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 400 si falta desde", async () => {
      const req = {
        query: {
          hasta: "2026-06-05",
        },
      };

      await listarRecibosRango(req as any, res);

      expect(mockListarRecibosRango).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Formato de fecha inválido. Usa YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si falta hasta", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
        },
      };

      await listarRecibosRango(req as any, res);

      expect(mockListarRecibosRango).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Formato de fecha inválido. Usa YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si desde tiene formato inválido", async () => {
      const req = {
        query: {
          desde: "2026/06/01",
          hasta: "2026-06-05",
        },
      };

      await listarRecibosRango(req as any, res);

      expect(mockListarRecibosRango).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Formato de fecha inválido. Usa YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si hasta tiene formato inválido", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "05-06-2026",
        },
      };

      await listarRecibosRango(req as any, res);

      expect(mockListarRecibosRango).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Formato de fecha inválido. Usa YYYY-MM-DD.",
      });
    });

    test("debe responder 500 si el repositorio falla al listar por rango", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "2026-06-05",
        },
      };

      mockListarRecibosRango.mockRejectedValue(new Error("Error interno"));

      await listarRecibosRango(req as any, res);

      expect(mockListarRecibosRango).toHaveBeenCalledWith(
        "2026-06-01",
        "2026-06-05"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error interno del servidor.",
      });
    });
  });

  describe("obtenerRecibo", () => {
    test("debe obtener un recibo por ID válido", async () => {
      const req = {
        params: {
          id: "1",
        },
      };

      const recibo = {
        id_recibo: 1,
        monto: 300,
      };

      mockObtenerPorId.mockResolvedValue(recibo);

      await obtenerRecibo(req as any, res);

      expect(mockObtenerPorId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(recibo);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 400 si el ID no es numérico", async () => {
      const req = {
        params: {
          id: "abc",
        },
      };

      await obtenerRecibo(req as any, res);

      expect(mockObtenerPorId).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID de recibo inválido.",
      });
    });

    test("debe responder 404 si el recibo no existe", async () => {
      const req = {
        params: {
          id: "99",
        },
      };

      mockObtenerPorId.mockResolvedValue(null);

      await obtenerRecibo(req as any, res);

      expect(mockObtenerPorId).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recibo no encontrado.",
      });
    });

    test("debe responder 500 si el repositorio falla al obtener recibo", async () => {
      const req = {
        params: {
          id: "1",
        },
      };

      mockObtenerPorId.mockRejectedValue(new Error("Error interno"));

      await obtenerRecibo(req as any, res);

      expect(mockObtenerPorId).toHaveBeenCalledWith(1);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error interno del servidor.",
      });
    });
  });
});