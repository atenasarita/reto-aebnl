/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { InventarioHandler } from "../../server/src/handlers/inventario.handler";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../server/src/errors/appError";

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
}

describe("InventarioHandler", () => {
  let controller: any;
  let handler: InventarioHandler;
  let res: any;

  beforeEach(() => {
    controller = {
      getInventario: jest.fn(),
      getProductosEscasos: jest.fn(),
      listObjetoCategorias: jest.fn(),
      createInventario: jest.fn(),
      updateInventario: jest.fn(),
      deleteInventario: jest.fn(),
      registrarMovimientoInventario: jest.fn(),
    };

    handler = new InventarioHandler(controller);
    res = createMockResponse();

    jest.clearAllMocks();
  });

  describe("getInventario", () => {
    test("debe responder 200 con el inventario", async () => {
      const inventario = [
        {
          id_inventario: 1,
          clave: "MED-001",
          nombre: "Gasas",
        },
      ];

      controller.getInventario.mockResolvedValue(inventario);

      await handler.getInventario({} as any, res);

      expect(controller.getInventario).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(inventario);
    });

    test("debe responder 500 si falla al obtener inventario", async () => {
      controller.getInventario.mockRejectedValue(new Error("Error"));

      await handler.getInventario({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener el inventario",
      });
    });
  });

  describe("getProductosEscasos", () => {
    test("debe responder 200 con productos escasos", async () => {
      const productosEscasos = [
        {
          id_inventario: 2,
          nombre: "Alcohol",
          cantidad: 1,
        },
      ];

      controller.getProductosEscasos.mockResolvedValue(productosEscasos);

      await handler.getProductosEscasos({} as any, res);

      expect(controller.getProductosEscasos).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(productosEscasos);
    });

    test("debe responder 500 si falla al obtener productos escasos", async () => {
      controller.getProductosEscasos.mockRejectedValue(new Error("Error"));

      await handler.getProductosEscasos({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener productos escasos",
      });
    });
  });

  describe("listObjetoCategorias", () => {
    test("debe responder 200 con las categorías", async () => {
      const categorias = [
        {
          id_categoria: 1,
          descripcion: "Medicamentos",
        },
      ];

      controller.listObjetoCategorias.mockResolvedValue(categorias);

      await handler.listObjetoCategorias({} as any, res);

      expect(controller.listObjetoCategorias).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(categorias);
    });

    test("debe responder 500 si falla al obtener categorías", async () => {
      controller.listObjetoCategorias.mockRejectedValue(new Error("Error"));

      await handler.listObjetoCategorias({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener categorías de inventario",
      });
    });
  });

  describe("createInventario", () => {
    test("debe responder 201 con el producto creado", async () => {
      const req = {
        body: {
          clave: "MED-001",
          nombre: "Gasas",
        },
      };

      const creado = {
        id_inventario: 1,
        clave: "MED-001",
        nombre: "Gasas",
      };

      controller.createInventario.mockResolvedValue(creado);

      await handler.createInventario(req as any, res);

      expect(controller.createInventario).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(creado);
    });

    test("debe responder 409 si el producto ya existe", async () => {
      const req = {
        body: {
          clave: "MED-001",
          nombre: "Gasas",
        },
      };

      controller.createInventario.mockRejectedValue(
        new ConflictError("Ya existe un producto con esa clave.")
      );

      await handler.createInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ya existe un producto con esa clave.",
      });
    });

    test("debe responder 400 si hay error de validación al crear", async () => {
      const req = {
        body: {
          nombre: "Gasas",
        },
      };

      controller.createInventario.mockRejectedValue(
        new ValidationError("La categoría indicada no existe.")
      );

      await handler.createInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "La categoría indicada no existe.",
      });
    });

    test("debe responder 500 si ocurre un error general al crear", async () => {
      const req = {
        body: {
          nombre: "Gasas",
        },
      };

      controller.createInventario.mockRejectedValue(new Error("Error interno"));

      await handler.createInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al crear el producto en inventario",
      });
    });
  });

  describe("updateInventario", () => {
    test("debe responder 400 si el ID no es numérico", async () => {
      const req = {
        params: {
          id_inventario: "abc",
        },
        body: {},
      };

      await handler.updateInventario(req as any, res);

      expect(controller.updateInventario).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID de inventario inválido.",
      });
    });

    test("debe responder 400 si el ID es menor a 1", async () => {
      const req = {
        params: {
          id_inventario: "0",
        },
        body: {},
      };

      await handler.updateInventario(req as any, res);

      expect(controller.updateInventario).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID de inventario inválido.",
      });
    });

    test("debe responder 200 con el producto actualizado", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
        body: {
          nombre: "Gasas actualizadas",
        },
      };

      const actualizado = {
        id_inventario: 1,
        nombre: "Gasas actualizadas",
      };

      controller.updateInventario.mockResolvedValue(actualizado);

      await handler.updateInventario(req as any, res);

      expect(controller.updateInventario).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(actualizado);
    });

    test("debe responder 404 si el producto no existe al actualizar", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
        body: {},
      };

      controller.updateInventario.mockRejectedValue(
        new NotFoundError("Producto de inventario no encontrado.")
      );

      await handler.updateInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Producto de inventario no encontrado.",
      });
    });

    test("debe responder 409 si hay conflicto al actualizar", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
        body: {},
      };

      controller.updateInventario.mockRejectedValue(
        new ConflictError("Ya existe un producto con esa clave.")
      );

      await handler.updateInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ya existe un producto con esa clave.",
      });
    });

    test("debe responder 400 si hay error de validación al actualizar", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
        body: {},
      };

      controller.updateInventario.mockRejectedValue(
        new ValidationError("La categoría indicada no existe.")
      );

      await handler.updateInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "La categoría indicada no existe.",
      });
    });

    test("debe responder 500 si ocurre un error general al actualizar", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
        body: {},
      };

      controller.updateInventario.mockRejectedValue(new Error("Error interno"));

      await handler.updateInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al actualizar el producto en inventario",
      });
    });
  });

  describe("deleteInventario", () => {
    test("debe responder 400 si el ID no es válido", async () => {
      const req = {
        params: {
          id_inventario: "abc",
        },
      };

      await handler.deleteInventario(req as any, res);

      expect(controller.deleteInventario).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID de inventario inválido.",
      });
    });

    test("debe responder 204 si elimina correctamente", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
      };

      controller.deleteInventario.mockResolvedValue(undefined);

      await handler.deleteInventario(req as any, res);

      expect(controller.deleteInventario).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    test("debe responder 404 si el producto no existe al eliminar", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
      };

      controller.deleteInventario.mockRejectedValue(
        new NotFoundError("Producto de inventario no encontrado.")
      );

      await handler.deleteInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Producto de inventario no encontrado.",
      });
    });

    test("debe responder 500 si ocurre un error general al eliminar", async () => {
      const req = {
        params: {
          id_inventario: "1",
        },
      };

      controller.deleteInventario.mockRejectedValue(new Error("Error interno"));

      await handler.deleteInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al eliminar el producto del inventario",
      });
    });
  });

  describe("registrarMovimientoInventario", () => {
    test("debe responder 401 si no hay usuario autenticado", async () => {
      const req = {
        body: {},
      };

      await handler.registrarMovimientoInventario(req as any, res);

      expect(controller.registrarMovimientoInventario).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no autenticado.",
      });
    });

    test("debe responder 201 con el movimiento registrado", async () => {
      const req = {
        user: {
          id_usuario: 7,
        },
        body: {
          id_inventario: 1,
          tipo_movimiento: "entrada",
          cantidad: 5,
        },
      };

      const movimiento = {
        id_movimiento: 10,
        id_inventario: 1,
        tipo_movimiento: "entrada",
        cantidad: 5,
      };

      controller.registrarMovimientoInventario.mockResolvedValue(movimiento);

      await handler.registrarMovimientoInventario(req as any, res);

      expect(controller.registrarMovimientoInventario).toHaveBeenCalledWith(
        req.body,
        7
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(movimiento);
    });

    test("debe responder 404 si el producto no existe al registrar movimiento", async () => {
      const req = {
        user: {
          id_usuario: 7,
        },
        body: {
          id_inventario: 99,
        },
      };

      controller.registrarMovimientoInventario.mockRejectedValue(
        new NotFoundError("Producto de inventario no encontrado.")
      );

      await handler.registrarMovimientoInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Producto de inventario no encontrado.",
      });
    });

    test("debe responder 400 si hay error de validación al registrar movimiento", async () => {
      const req = {
        user: {
          id_usuario: 7,
        },
        body: {
          id_inventario: 1,
        },
      };

      controller.registrarMovimientoInventario.mockRejectedValue(
        new ValidationError("Stock insuficiente para una salida de esa cantidad.")
      );

      await handler.registrarMovimientoInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Stock insuficiente para una salida de esa cantidad.",
      });
    });

    test("debe responder 500 si ocurre un error general al registrar movimiento", async () => {
      const req = {
        user: {
          id_usuario: 7,
        },
        body: {
          id_inventario: 1,
        },
      };

      controller.registrarMovimientoInventario.mockRejectedValue(
        new Error("Error interno")
      );

      await handler.registrarMovimientoInventario(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al registrar el movimiento de inventario",
      });
    });
  });
});