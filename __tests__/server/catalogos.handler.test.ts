/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, beforeAll } from "@jest/globals";

const mockGetEspecialistas = jest.fn() as any;
const mockGetCatalogoServicios = jest.fn() as any;
const mockSearchBeneficiarios = jest.fn() as any;
const mockUpdateCita = jest.fn() as any;

jest.unstable_mockModule("../../server/src/repositories/catalogos.repository", () => ({
  CatalogosRepository: jest.fn().mockImplementation(() => ({
    getEspecialistas: mockGetEspecialistas,
    getCatalogoServicios: mockGetCatalogoServicios,
    searchBeneficiarios: mockSearchBeneficiarios,
  })),
}));

jest.unstable_mockModule("../../server/src/repositories/citas.repository", () => ({
  OracleCitasRepository: jest.fn().mockImplementation(() => ({
    updateCita: mockUpdateCita,
  })),
}));

let getEspecialistas: any;
let getCatalogoServicios: any;
let searchBeneficiarios: any;
let updateCita: any;

beforeAll(async () => {
  const handler = await import("../../server/src/handlers/catalogos.handler");

  getEspecialistas = handler.getEspecialistas;
  getCatalogoServicios = handler.getCatalogoServicios;
  searchBeneficiarios = handler.searchBeneficiarios;
  updateCita = handler.updateCita;
});

const createMockResponse = () => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("Handlers de catálogos y citas", () => {
  let res: any;
  let next: any;

  beforeEach(() => {
    res = createMockResponse();
    next = jest.fn();

    mockGetEspecialistas.mockReset();
    mockGetCatalogoServicios.mockReset();
    mockSearchBeneficiarios.mockReset();
    mockUpdateCita.mockReset();
  });

  describe("getEspecialistas", () => {
    test("debe responder con la lista de especialistas", async () => {
      const especialistasMock = [
        { id: 1, nombre: "Dra. Laura" },
        { id: 2, nombre: "Dr. Carlos" },
      ];

      mockGetEspecialistas.mockResolvedValue(especialistasMock);

      await getEspecialistas({} as any, res, next);

      expect(mockGetEspecialistas).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(especialistasMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar next cuando ocurre un error al obtener especialistas", async () => {
      const errorMock = new Error("Error al obtener especialistas");

      mockGetEspecialistas.mockRejectedValue(errorMock);

      await getEspecialistas({} as any, res, next);

      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getCatalogoServicios", () => {
    test("debe responder con el catálogo de servicios", async () => {
      const serviciosMock = [
        { id: 1, nombre: "Consulta médica" },
        { id: 2, nombre: "Estudio médico" },
      ];

      mockGetCatalogoServicios.mockResolvedValue(serviciosMock);

      await getCatalogoServicios({} as any, res, next);

      expect(mockGetCatalogoServicios).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(serviciosMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar next cuando ocurre un error al obtener el catálogo de servicios", async () => {
      const errorMock = new Error("Error al obtener catálogo de servicios");

      mockGetCatalogoServicios.mockRejectedValue(errorMock);

      await getCatalogoServicios({} as any, res, next);

      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("searchBeneficiarios", () => {
    test("debe responder con un arreglo vacío cuando el query está vacío", async () => {
      const req: any = {
        query: {
          q: "",
        },
      };

      await searchBeneficiarios(req, res, next);

      expect(res.json).toHaveBeenCalledWith([]);
      expect(mockSearchBeneficiarios).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("debe responder con un arreglo vacío cuando el query tiene menos de 2 caracteres", async () => {
      const req: any = {
        query: {
          q: "a",
        },
      };

      await searchBeneficiarios(req, res, next);

      expect(res.json).toHaveBeenCalledWith([]);
      expect(mockSearchBeneficiarios).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("debe buscar beneficiarios cuando el query tiene 2 o más caracteres", async () => {
      const req: any = {
        query: {
          q: "Ana",
        },
      };

      const beneficiariosMock = [
        { id: 1, nombre: "Ana López" },
      ];

      mockSearchBeneficiarios.mockResolvedValue(beneficiariosMock);

      await searchBeneficiarios(req, res, next);

      expect(mockSearchBeneficiarios).toHaveBeenCalledWith("Ana");
      expect(res.json).toHaveBeenCalledWith(beneficiariosMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe limpiar espacios del query antes de buscar beneficiarios", async () => {
      const req: any = {
        query: {
          q: "  Ana  ",
        },
      };

      const beneficiariosMock = [
        { id: 1, nombre: "Ana López" },
      ];

      mockSearchBeneficiarios.mockResolvedValue(beneficiariosMock);

      await searchBeneficiarios(req, res, next);

      expect(mockSearchBeneficiarios).toHaveBeenCalledWith("Ana");
      expect(res.json).toHaveBeenCalledWith(beneficiariosMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar next cuando ocurre un error al buscar beneficiarios", async () => {
      const req: any = {
        query: {
          q: "Ana",
        },
      };

      const errorMock = new Error("Error al buscar beneficiarios");

      mockSearchBeneficiarios.mockRejectedValue(errorMock);

      await searchBeneficiarios(req, res, next);

      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("updateCita", () => {
    test("debe responder con status 400 cuando el ID de la cita no es válido", async () => {
      const req: any = {
        params: {
          id: "abc",
        },
        body: {},
      };

      await updateCita(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID de cita inválido.",
      });
      expect(mockUpdateCita).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("debe actualizar la cita cuando el ID es válido", async () => {
      const req: any = {
        params: {
          id: "10",
        },
        body: {
          fecha: "2026-06-04",
          hora: "10:00",
          especialistaId: 1,
        },
      };

      const resultadoMock = {
        success: true,
        message: "Cita actualizada correctamente",
      };

      mockUpdateCita.mockResolvedValue(resultadoMock);

      await updateCita(req, res, next);

      expect(mockUpdateCita).toHaveBeenCalledWith(10, req.body);
      expect(res.json).toHaveBeenCalledWith(resultadoMock);
      expect(next).not.toHaveBeenCalled();
    });

    test("debe llamar next cuando ocurre un error al actualizar la cita", async () => {
      const req: any = {
        params: {
          id: "10",
        },
        body: {
          fecha: "2026-06-04",
        },
      };

      const errorMock = new Error("Error al actualizar cita");

      mockUpdateCita.mockRejectedValue(errorMock);

      await updateCita(req, res, next);

      expect(mockUpdateCita).toHaveBeenCalledWith(10, req.body);
      expect(next).toHaveBeenCalledWith(errorMock);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});