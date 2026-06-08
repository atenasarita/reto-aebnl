/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { ServiciosHandler } from "../../server/src/handlers/servicios.handler";

const createMockResponse = () => {
  const res: any = {};

  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);

  return res;
};

describe("ServiciosHandler", () => {
  let controller: any;
  let handler: ServiciosHandler;
  let res: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    controller = {
      getTiposServicio: jest.fn(),
      getFechasUltimosEstudios: jest.fn(),
      registrarServicio: jest.fn(),
      getHistorial: jest.fn(),
      getCategorias: jest.fn(),
      crearServicioCatalogo: jest.fn(),
    };

    handler = new ServiciosHandler(controller);
    res = createMockResponse();

    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getTiposServicio", () => {
    test("debe responder 200 con los tipos de servicio", async () => {
      const data = [
        { id: 1, nombre: "Consulta", categoria: "Medicina", precio: 300 },
      ];

      controller.getTiposServicio.mockResolvedValue(data);

      await handler.getTiposServicio({} as any, res);

      expect(controller.getTiposServicio).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe responder 500 si falla getTiposServicio", async () => {
      controller.getTiposServicio.mockRejectedValue(new Error("Error"));

      await handler.getTiposServicio({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error obteniendo tipos de servicio",
      });
    });
  });

  describe("getFechasUltimosEstudios", () => {
    test("debe responder 400 si el id_beneficiario es inválido", async () => {
      const req = {
        params: {
          id_beneficiario: "abc",
        },
      };

      await handler.getFechasUltimosEstudios(req as any, res);

      expect(controller.getFechasUltimosEstudios).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "ID de beneficiario inválido",
      });
    });

    test("debe responder 400 si el id_beneficiario es cero", async () => {
      const req = {
        params: {
          id_beneficiario: "0",
        },
      };

      await handler.getFechasUltimosEstudios(req as any, res);

      expect(controller.getFechasUltimosEstudios).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "ID de beneficiario inválido",
      });
    });

    test("debe responder 200 con las fechas de últimos estudios", async () => {
      const req = {
        params: {
          id_beneficiario: "1",
        },
      };

      const data = {
        idBeneficiario: 1,
        ecoRenal: "2026-06-04",
      };

      controller.getFechasUltimosEstudios.mockResolvedValue(data);

      await handler.getFechasUltimosEstudios(req as any, res);

      expect(controller.getFechasUltimosEstudios).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe responder 500 si falla getFechasUltimosEstudios", async () => {
      const req = {
        params: {
          id_beneficiario: "1",
        },
      };

      controller.getFechasUltimosEstudios.mockRejectedValue(new Error("Error"));

      await handler.getFechasUltimosEstudios(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error obteniendo fechas de últimos estudios",
      });
    });
  });

  describe("registrarServicio", () => {
    const baseBody = {
      id_beneficiario: 1,
      id_catalogo_servicio: 2,
      fecha: "2026-06-04",
      hora: "10:00",
      cuota_total: 300,
      monto_pagado: 300,
      monto_donacion: 0,
      id_fondo: null,
      id_donador: null,
    };

    test("debe responder 401 si no hay usuario autenticado", async () => {
      const req = {
        body: baseBody,
      };

      await handler.registrarServicio(req as any, res);

      expect(controller.registrarServicio).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Usuario no autenticado",
      });
    });

    test("debe responder 400 si monto_pagado es negativo", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: {
          ...baseBody,
          monto_pagado: -1,
        },
      };

      await handler.registrarServicio(req as any, res);

      expect(controller.registrarServicio).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Los montos de aportación y donación deben ser no negativos",
      });
    });

    test("debe responder 400 si monto_donacion es negativo", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: {
          ...baseBody,
          monto_pagado: 100,
          monto_donacion: -5,
        },
      };

      await handler.registrarServicio(req as any, res);

      expect(controller.registrarServicio).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Los montos de aportación y donación deben ser no negativos",
      });
    });

    test("debe responder 400 si la suma de aportación y donación excede la cuota total", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: {
          ...baseBody,
          cuota_total: 300,
          monto_pagado: 250,
          monto_donacion: 100,
        },
      };

      await handler.registrarServicio(req as any, res);

      expect(controller.registrarServicio).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "La suma de aportación familiar y donación no puede exceder el total a pagar",
      });
    });

    test("debe responder 400 si hay donación pero no se selecciona fondo o donador", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: {
          ...baseBody,
          cuota_total: 300,
          monto_pagado: 200,
          monto_donacion: 100,
          id_fondo: null,
          id_donador: null,
        },
      };

      await handler.registrarServicio(req as any, res);

      expect(controller.registrarServicio).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Debe seleccionar el fondo de donación a utilizar",
      });
    });

    test("debe responder 201 y mandar montos convertidos a número", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: {
          ...baseBody,
          cuota_total: "300",
          monto_pagado: "200",
          monto_donacion: "100",
          id_fondo: "10",
          id_donador: "5",
        },
      };

      const data = {
        ok: true,
        id_servicio_otorgado: 99,
      };

      controller.registrarServicio.mockResolvedValue(data);

      await handler.registrarServicio(req as any, res);

      expect(controller.registrarServicio).toHaveBeenCalledWith({
        ...req.body,
        monto_pagado: 200,
        monto_donacion: 100,
        id_fondo: 10,
        id_donador: 5,
        id_usuario: 7,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe mandar id_fondo e id_donador como null si no vienen en el body", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: {
          ...baseBody,
          monto_pagado: "300",
          monto_donacion: "0",
          id_fondo: "",
          id_donador: "",
        },
      };

      controller.registrarServicio.mockResolvedValue({
        id_servicio_otorgado: 100,
      });

      await handler.registrarServicio(req as any, res);

      expect(controller.registrarServicio).toHaveBeenCalledWith({
        ...req.body,
        monto_pagado: 300,
        monto_donacion: 0,
        id_fondo: null,
        id_donador: null,
        id_usuario: 7,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("debe responder 409 si el controller manda error de stock insuficiente", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: baseBody,
      };

      controller.registrarServicio.mockRejectedValue(
        new Error("Stock insuficiente para insumo ID 5")
      );

      await handler.registrarServicio(req as any, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Stock insuficiente para insumo ID 5",
      });
    });

    test("debe responder 409 si el insumo no se encuentra en inventario", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: baseBody,
      };

      controller.registrarServicio.mockRejectedValue(
        new Error("Insumo ID 99 no encontrado en inventario")
      );

      await handler.registrarServicio(req as any, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Insumo ID 99 no encontrado en inventario",
      });
    });

    test("debe responder 409 si hay saldo insuficiente en fondo de donaciones", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: baseBody,
      };

      controller.registrarServicio.mockRejectedValue(
        new Error("Saldo insuficiente en fondo de donaciones")
      );

      await handler.registrarServicio(req as any, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Saldo insuficiente en fondo de donaciones",
      });
    });

    test("debe responder 500 si ocurre un error general al registrar servicio", async () => {
      const req = {
        user: { id_usuario: 7 },
        body: baseBody,
      };

      controller.registrarServicio.mockRejectedValue(
        new Error("Error interno")
      );

      await handler.registrarServicio(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error interno",
      });
    });
  });

  describe("getHistorial", () => {
    test("debe responder 200 con historial usando limit y page del query", async () => {
      const req = {
        query: {
          limit: "10",
          page: "2",
        },
      };

      const result = {
        data: [{ id: 1, nombre: "Consulta" }],
        hasMore: false,
        page: 2,
        limit: 10,
      };

      controller.getHistorial.mockResolvedValue(result);

      await handler.getHistorial(req as any, res);

      expect(controller.getHistorial).toHaveBeenCalledWith(10, 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        ...result,
      });
    });

    test("debe limitar limit a máximo 200 y page mínimo 0", async () => {
      const req = {
        query: {
          limit: "500",
          page: "-5",
        },
      };

      const result = {
        data: [],
        hasMore: false,
        page: 0,
        limit: 200,
      };

      controller.getHistorial.mockResolvedValue(result);

      await handler.getHistorial(req as any, res);

      expect(controller.getHistorial).toHaveBeenCalledWith(200, 0);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("debe usar valores por defecto si limit y page no vienen", async () => {
      const req = {
        query: {},
      };

      const result = {
        data: [],
        hasMore: false,
        page: 0,
        limit: 20,
      };

      controller.getHistorial.mockResolvedValue(result);

      await handler.getHistorial(req as any, res);

      expect(controller.getHistorial).toHaveBeenCalledWith(20, 0);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("debe responder 500 si falla getHistorial", async () => {
      const req = {
        query: {},
      };

      controller.getHistorial.mockRejectedValue(new Error("Error"));

      await handler.getHistorial(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error obteniendo historial de servicios",
      });
    });
  });

  describe("getCategorias", () => {
    test("debe responder 200 con categorías", async () => {
      const data = ["Consulta", "Estudios"];

      controller.getCategorias.mockResolvedValue(data);

      await handler.getCategorias({} as any, res);

      expect(controller.getCategorias).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe responder 500 si falla getCategorias", async () => {
      controller.getCategorias.mockRejectedValue(new Error("Error"));

      await handler.getCategorias({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error obteniendo categorías",
      });
    });
  });

  describe("crearServicioCatalogo", () => {
    test("debe responder 400 si el nombre está vacío", async () => {
      const req = {
        body: {
          nombre: "   ",
          categoria: "Consulta",
          precio: 100,
        },
      };

      await handler.crearServicioCatalogo(req as any, res);

      expect(controller.crearServicioCatalogo).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "El nombre es requerido",
      });
    });

    test("debe responder 400 si la categoría está vacía", async () => {
      const req = {
        body: {
          nombre: "Consulta",
          categoria: "   ",
          precio: 100,
        },
      };

      await handler.crearServicioCatalogo(req as any, res);

      expect(controller.crearServicioCatalogo).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "La categoría es requerida",
      });
    });

    test("debe responder 400 si el precio no es número", async () => {
      const req = {
        body: {
          nombre: "Consulta",
          categoria: "Medicina",
          precio: "abc",
        },
      };

      await handler.crearServicioCatalogo(req as any, res);

      expect(controller.crearServicioCatalogo).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "El precio debe ser un número mayor o igual a 0",
      });
    });

    test("debe responder 400 si el precio es negativo", async () => {
      const req = {
        body: {
          nombre: "Consulta",
          categoria: "Medicina",
          precio: -1,
        },
      };

      await handler.crearServicioCatalogo(req as any, res);

      expect(controller.crearServicioCatalogo).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "El precio debe ser un número mayor o igual a 0",
      });
    });

    test("debe responder 201 si crea el servicio de catálogo correctamente", async () => {
      const req = {
        body: {
          nombre: " Consulta general ",
          categoria: " Medicina ",
          precio: "300",
        },
      };

      const data = {
        id: 1,
      };

      controller.crearServicioCatalogo.mockResolvedValue(data);

      await handler.crearServicioCatalogo(req as any, res);

      expect(controller.crearServicioCatalogo).toHaveBeenCalledWith({
        nombre: "Consulta general",
        categoria: "Medicina",
        precio: 300,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe responder 500 si falla crearServicioCatalogo", async () => {
      const req = {
        body: {
          nombre: "Consulta",
          categoria: "Medicina",
          precio: 300,
        },
      };

      controller.crearServicioCatalogo.mockRejectedValue(new Error("Error"));

      await handler.crearServicioCatalogo(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al crear servicio en catálogo",
      });
    });
  });
});