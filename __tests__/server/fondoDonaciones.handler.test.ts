/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, afterEach, beforeAll } from "@jest/globals";

const mockGetSaldo = jest.fn() as any;
const mockListarMovimientos = jest.fn() as any;
const mockListarDonadores = jest.fn() as any;
const mockRegistrarAbono = jest.fn() as any;
const mockCrearDonador = jest.fn() as any;

jest.unstable_mockModule("../../server/src/controllers/fondoDonaciones.controller", () => ({
  FondoDonacionesController: jest.fn().mockImplementation(() => ({
    getSaldo: mockGetSaldo,
    listarMovimientos: mockListarMovimientos,
    listarDonadores: mockListarDonadores,
    registrarAbono: mockRegistrarAbono,
    crearDonador: mockCrearDonador,
  })),
}));

let FondoDonacionesHandler: any;

beforeAll(async () => {
  const module = await import("../../server/src/handlers/fondoDonaciones.handler");
  FondoDonacionesHandler = module.FondoDonacionesHandler;
});

const createMockResponse = () => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("FondoDonacionesHandler", () => {
  let handler: any;
  let res: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    res = createMockResponse();
    handler = new FondoDonacionesHandler();

    mockGetSaldo.mockReset();
    mockListarMovimientos.mockReset();
    mockListarDonadores.mockReset();
    mockRegistrarAbono.mockReset();
    mockCrearDonador.mockReset();

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getSaldo", () => {
    test("debe responder con status 200 y el saldo del fondo", async () => {
      const saldoMock = {
        saldo: 1500,
        totalAbonos: 2000,
        totalCargos: 500,
      };

      mockGetSaldo.mockResolvedValue(saldoMock);

      await handler.getSaldo({} as any, res);

      expect(mockGetSaldo).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: saldoMock,
      });
    });

    test("debe responder con status 500 cuando ocurre un error al consultar el saldo", async () => {
      mockGetSaldo.mockRejectedValue(new Error("Error de base de datos"));

      await handler.getSaldo({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al consultar saldo del fondo",
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("listarMovimientos", () => {
    test("debe listar movimientos con límite 100 por defecto", async () => {
      const movimientosMock = [
        { id_movimiento: 1, monto: 100 },
        { id_movimiento: 2, monto: 200 },
      ];

      mockListarMovimientos.mockResolvedValue(movimientosMock);

      const req: any = {
        query: {},
      };

      await handler.listarMovimientos(req, res);

      expect(mockListarMovimientos).toHaveBeenCalledWith(100, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: movimientosMock,
      });
    });

    test("debe limitar el parámetro limite a máximo 500", async () => {
      mockListarMovimientos.mockResolvedValue([]);

      const req: any = {
        query: {
          limite: "999",
        },
      };

      await handler.listarMovimientos(req, res);

      expect(mockListarMovimientos).toHaveBeenCalledWith(500, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("debe enviar idDonador cuando id_donador es válido", async () => {
      mockListarMovimientos.mockResolvedValue([]);

      const req: any = {
        query: {
          limite: "25",
          id_donador: "7",
        },
      };

      await handler.listarMovimientos(req, res);

      expect(mockListarMovimientos).toHaveBeenCalledWith(25, 7);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("debe enviar idDonador como undefined cuando id_donador está vacío", async () => {
      mockListarMovimientos.mockResolvedValue([]);

      const req: any = {
        query: {
          id_donador: "",
        },
      };

      await handler.listarMovimientos(req, res);

      expect(mockListarMovimientos).toHaveBeenCalledWith(100, undefined);
    });

    test("debe enviar idDonador como undefined cuando id_donador no es numérico", async () => {
      mockListarMovimientos.mockResolvedValue([]);

      const req: any = {
        query: {
          id_donador: "abc",
        },
      };

      await handler.listarMovimientos(req, res);

      expect(mockListarMovimientos).toHaveBeenCalledWith(100, undefined);
    });

    test("debe enviar idDonador como undefined cuando id_donador es menor o igual a cero", async () => {
      mockListarMovimientos.mockResolvedValue([]);

      const req: any = {
        query: {
          id_donador: "0",
        },
      };

      await handler.listarMovimientos(req, res);

      expect(mockListarMovimientos).toHaveBeenCalledWith(100, undefined);
    });

    test("debe responder con status 500 cuando ocurre un error al listar movimientos", async () => {
      mockListarMovimientos.mockRejectedValue(new Error("Error al listar movimientos"));

      const req: any = {
        query: {},
      };

      await handler.listarMovimientos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al listar movimientos del fondo",
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("listarDonadores", () => {
    test("debe responder con status 200 y la lista de donadores", async () => {
      const donadoresMock = [
        { id_donador: 1, nombre: "Familia López" },
        { id_donador: 2, nombre: "Marca ABC" },
      ];

      mockListarDonadores.mockResolvedValue(donadoresMock);

      await handler.listarDonadores({} as any, res);

      expect(mockListarDonadores).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: donadoresMock,
      });
    });

    test("debe responder con status 500 cuando ocurre un error al listar donadores", async () => {
      mockListarDonadores.mockRejectedValue(new Error("Error al listar donadores"));

      await handler.listarDonadores({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al listar donadores",
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("registrarAbono", () => {
    test("debe responder con status 401 cuando no hay usuario autenticado", async () => {
      const req: any = {
        body: {
          id_donador: 7,
          monto: 500,
        },
      };

      await handler.registrarAbono(req, res);

      expect(mockRegistrarAbono).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Usuario no autenticado",
      });
    });

    test("debe responder con status 201 y registrar el abono con id_usuario", async () => {
      const abonoMock = {
        id_movimiento: 10,
        monto: 500,
      };

      mockRegistrarAbono.mockResolvedValue(abonoMock);

      const req: any = {
        user: {
          id_usuario: 3,
        },
        body: {
          id_donador: 7,
          monto: 500,
          concepto: "Donación mensual",
        },
      };

      await handler.registrarAbono(req, res);

      expect(mockRegistrarAbono).toHaveBeenCalledWith({
        id_donador: 7,
        monto: 500,
        concepto: "Donación mensual",
        id_usuario: 3,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: abonoMock,
      });
    });

    test("debe responder con status 409 cuando ya existe una marca o familia", async () => {
      const mensaje = "Ya existe una marca o familia con ese nombre";

      mockRegistrarAbono.mockRejectedValue(new Error(mensaje));

      const req: any = {
        user: {
          id_usuario: 3,
        },
        body: {
          id_donador: 7,
          monto: 500,
        },
      };

      await handler.registrarAbono(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: mensaje,
      });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test("debe responder con status 500 cuando ocurre un error general al registrar abono", async () => {
      mockRegistrarAbono.mockRejectedValue(new Error("Error inesperado"));

      const req: any = {
        user: {
          id_usuario: 3,
        },
        body: {
          id_donador: 7,
          monto: 500,
        },
      };

      await handler.registrarAbono(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al registrar donación",
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("crearDonador", () => {
    test("debe responder con status 201 cuando se crea el donador", async () => {
      const donadorMock = {
        id_donador: 9,
        nombre: "Familia Pérez",
      };

      mockCrearDonador.mockResolvedValue(donadorMock);

      const req: any = {
        body: {
          nombre: "Familia Pérez",
          tipo: "familia",
        },
      };

      await handler.crearDonador(req, res);

      expect(mockCrearDonador).toHaveBeenCalledWith({
        nombre: "Familia Pérez",
        tipo: "familia",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: donadorMock,
      });
    });

    test("debe responder con status 409 cuando ya existe una marca o familia", async () => {
      const mensaje = "Ya existe una marca o familia con ese nombre";

      mockCrearDonador.mockRejectedValue(new Error(mensaje));

      const req: any = {
        body: {
          nombre: "Familia Pérez",
          tipo: "familia",
        },
      };

      await handler.crearDonador(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: mensaje,
      });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test("debe responder con status 500 cuando ocurre un error general al crear donador", async () => {
      mockCrearDonador.mockRejectedValue(new Error("Error inesperado"));

      const req: any = {
        body: {
          nombre: "Familia Pérez",
          tipo: "familia",
        },
      };

      await handler.crearDonador(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al crear marca o familia",
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});