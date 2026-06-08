/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { ReportesHandler } from "../../server/src/handlers/reportes.handler";

function createMockResponse() {
  const res: any = {};

  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);

  return res;
}

describe("ReportesHandler", () => {
  let controller: any;
  let handler: ReportesHandler;
  let res: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    controller = {
      getAllTimes: jest.fn(),
      getRangoFechas: jest.fn(),
      getMensual: jest.fn(),
      getInventario: jest.fn(),
      getAnual: jest.fn(),
    };

    handler = new ReportesHandler(controller);
    res = createMockResponse();

    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getAllTimes", () => {
    test("debe responder con el reporte global cuando el controller funciona", async () => {
      const data = {
        beneficiarios_activos: 10,
        beneficiarios_inactivos: 2,
      };

      controller.getAllTimes.mockResolvedValue(data);

      await handler.getAllTimes({} as any, res);

      expect(controller.getAllTimes).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(data);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 500 cuando falla getAllTimes", async () => {
      controller.getAllTimes.mockRejectedValue(new Error("Error interno"));

      await handler.getAllTimes({} as any, res);

      expect(controller.getAllTimes).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener reporte global.",
      });
    });
  });

  describe("getRangoFechas", () => {
    test("debe responder 400 si falta desde", async () => {
      const req = {
        query: {
          hasta: "2026-06-04",
        },
      };

      await handler.getRangoFechas(req as any, res);

      expect(controller.getRangoFechas).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si falta hasta", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
        },
      };

      await handler.getRangoFechas(req as any, res);

      expect(controller.getRangoFechas).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si desde no tiene formato YYYY-MM-DD", async () => {
      const req = {
        query: {
          desde: "06/01/2026",
          hasta: "2026-06-04",
        },
      };

      await handler.getRangoFechas(req as any, res);

      expect(controller.getRangoFechas).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si hasta no es una fecha válida", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "fecha-mala",
        },
      };

      await handler.getRangoFechas(req as any, res);

      expect(controller.getRangoFechas).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si desde es posterior a hasta", async () => {
      const req = {
        query: {
          desde: "2026-06-10",
          hasta: "2026-06-01",
        },
      };

      await handler.getRangoFechas(req as any, res);

      expect(controller.getRangoFechas).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "La fecha desde no puede ser posterior a hasta.",
      });
    });

    test("debe responder con el reporte por rango cuando las fechas son válidas", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "2026-06-04",
        },
      };

      const data = {
        periodo: {
          desde: "2026-06-01",
          hasta: "2026-06-04",
        },
        servicios_periodo: 8,
      };

      controller.getRangoFechas.mockResolvedValue(data);

      await handler.getRangoFechas(req as any, res);

      expect(controller.getRangoFechas).toHaveBeenCalledWith(
        "2026-06-01",
        "2026-06-04"
      );
      expect(res.json).toHaveBeenCalledWith(data);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 500 cuando falla getRangoFechas", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "2026-06-04",
        },
      };

      controller.getRangoFechas.mockRejectedValue(new Error("Error interno"));

      await handler.getRangoFechas(req as any, res);

      expect(controller.getRangoFechas).toHaveBeenCalledWith(
        "2026-06-01",
        "2026-06-04"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener reporte por rango de fechas.",
      });
    });
  });

  describe("getMensual", () => {
    test("debe responder 400 si mes no es entero", async () => {
      const req = {
        query: {
          mes: "abc",
          anio: "2026",
        },
      };

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'mes' inválido. Usa un entero entre 1 y 12.",
      });
    });

    test("debe responder 400 si mes es menor que 1", async () => {
      const req = {
        query: {
          mes: "0",
          anio: "2026",
        },
      };

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'mes' inválido. Usa un entero entre 1 y 12.",
      });
    });

    test("debe responder 400 si mes es mayor que 12", async () => {
      const req = {
        query: {
          mes: "13",
          anio: "2026",
        },
      };

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'mes' inválido. Usa un entero entre 1 y 12.",
      });
    });

    test("debe responder 400 si anio no es entero", async () => {
      const req = {
        query: {
          mes: "6",
          anio: "abc",
        },
      };

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'anio' inválido. Usa un año entre 1900 y 2100.",
      });
    });

    test("debe responder 400 si anio es menor a 1900", async () => {
      const req = {
        query: {
          mes: "6",
          anio: "1899",
        },
      };

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'anio' inválido. Usa un año entre 1900 y 2100.",
      });
    });

    test("debe responder 400 si anio es mayor a 2100", async () => {
      const req = {
        query: {
          mes: "6",
          anio: "2101",
        },
      };

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'anio' inválido. Usa un año entre 1900 y 2100.",
      });
    });

    test("debe responder con el reporte mensual cuando mes y anio son válidos", async () => {
      const req = {
        query: {
          mes: "6",
          anio: "2026",
        },
      };

      const data = {
        mes: 6,
        anio: 2026,
        servicios_periodo: 20,
      };

      controller.getMensual.mockResolvedValue(data);

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).toHaveBeenCalledWith(6, 2026);
      expect(res.json).toHaveBeenCalledWith(data);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 500 cuando falla getMensual", async () => {
      const req = {
        query: {
          mes: "6",
          anio: "2026",
        },
      };

      controller.getMensual.mockRejectedValue(new Error("Error interno"));

      await handler.getMensual(req as any, res);

      expect(controller.getMensual).toHaveBeenCalledWith(6, 2026);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener reporte mensual.",
      });
    });
  });

  describe("getInventario", () => {
    test("debe responder 400 si faltan fechas", async () => {
      const req = {
        query: {},
      };

      await handler.getInventario(req as any, res);

      expect(controller.getInventario).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si la fecha tiene formato inválido", async () => {
      const req = {
        query: {
          desde: "2026/06/01",
          hasta: "2026-06-04",
        },
      };

      await handler.getInventario(req as any, res);

      expect(controller.getInventario).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD.",
      });
    });

    test("debe responder 400 si desde es posterior a hasta", async () => {
      const req = {
        query: {
          desde: "2026-06-10",
          hasta: "2026-06-01",
        },
      };

      await handler.getInventario(req as any, res);

      expect(controller.getInventario).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "La fecha desde no puede ser posterior a hasta.",
      });
    });

    test("debe responder con el reporte de inventario cuando las fechas son válidas", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "2026-06-04",
        },
      };

      const data = {
        periodo: {
          desde: "2026-06-01",
          hasta: "2026-06-04",
        },
        articulos_activos: 12,
      };

      controller.getInventario.mockResolvedValue(data);

      await handler.getInventario(req as any, res);

      expect(controller.getInventario).toHaveBeenCalledWith(
        "2026-06-01",
        "2026-06-04"
      );
      expect(res.json).toHaveBeenCalledWith(data);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 500 cuando falla getInventario", async () => {
      const req = {
        query: {
          desde: "2026-06-01",
          hasta: "2026-06-04",
        },
      };

      controller.getInventario.mockRejectedValue(new Error("Error interno"));

      await handler.getInventario(req as any, res);

      expect(controller.getInventario).toHaveBeenCalledWith(
        "2026-06-01",
        "2026-06-04"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener reporte de inventario.",
      });
    });
  });

  describe("getAnual", () => {
    test("debe responder 400 si anio no es entero", async () => {
      const req = {
        query: {
          anio: "abc",
        },
      };

      await handler.getAnual(req as any, res);

      expect(controller.getAnual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'anio' inválido. Usa un año entre 1900 y 2100.",
      });
    });

    test("debe responder 400 si anio es menor a 1900", async () => {
      const req = {
        query: {
          anio: "1899",
        },
      };

      await handler.getAnual(req as any, res);

      expect(controller.getAnual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'anio' inválido. Usa un año entre 1900 y 2100.",
      });
    });

    test("debe responder 400 si anio es mayor a 2100", async () => {
      const req = {
        query: {
          anio: "2101",
        },
      };

      await handler.getAnual(req as any, res);

      expect(controller.getAnual).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Parámetro 'anio' inválido. Usa un año entre 1900 y 2100.",
      });
    });

    test("debe responder con el reporte anual cuando anio es válido", async () => {
      const req = {
        query: {
          anio: "2026",
        },
      };

      const data = {
        anio: 2026,
        servicios_periodo: 100,
      };

      controller.getAnual.mockResolvedValue(data);

      await handler.getAnual(req as any, res);

      expect(controller.getAnual).toHaveBeenCalledWith(2026);
      expect(res.json).toHaveBeenCalledWith(data);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 500 cuando falla getAnual", async () => {
      const req = {
        query: {
          anio: "2026",
        },
      };

      controller.getAnual.mockRejectedValue(new Error("Error interno"));

      await handler.getAnual(req as any, res);

      expect(controller.getAnual).toHaveBeenCalledWith(2026);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener reporte anual.",
      });
    });
  });
});