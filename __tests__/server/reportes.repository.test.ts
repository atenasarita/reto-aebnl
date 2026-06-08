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
    },
    OUT_FORMAT_OBJECT: 4002,
  }),
  { virtual: true }
);

jest.unstable_mockModule("../../server/src/db/oracle", () => ({
  OracleConnection: jest.fn().mockImplementation(() => ({
    getConnection: mockGetConnection,
  })),
}));

let ReportesRepository: any;

beforeAll(async () => {
  const module = await import("../../server/src/repositories/reportes.repository");
  ReportesRepository = module.ReportesRepository;
});

const createMockConnection = () => ({
  execute: jest.fn() as any,
  close: jest.fn() as any,
});

describe("ReportesRepository", () => {
  let connection: any;
  let repository: any;

  beforeEach(() => {
    connection = createMockConnection();
    mockGetConnection.mockResolvedValue(connection);
    repository = new ReportesRepository();
    jest.clearAllMocks();
  });

  test("getAllTimes debe mapear totales, género, etapa de vida, estado y tipo de espina", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            ACTIVOS: 10,
            INACTIVOS: 5,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { GENERO: "femenino", CONTEO: 6 },
          { GENERO: "masculino", CONTEO: 3 },
          { GENERO: "otro", CONTEO: 1 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { CODIGO: "infancia_0_12", CONTEO: 4 },
          { CODIGO: "adolescencia_13_17", CONTEO: 2 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { ESTADO: "Nuevo León", CONTEO: 8 },
          { ESTADO: "Coahuila", CONTEO: 2 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { ID_ESPINA: 1, NOMBRE: "Mielomeningocele", CONTEO: 7 },
        ],
      });

    const result = await repository.getAllTimes();

    expect(result.beneficiarios_activos).toBe(10);
    expect(result.beneficiarios_inactivos).toBe(5);

    expect(result.beneficiarios_por_genero).toEqual([
      { genero: "femenino", conteo: 6, porcentaje: 60 },
      { genero: "masculino", conteo: 3, porcentaje: 30 },
      { genero: "otro", conteo: 1, porcentaje: 10 },
    ]);

    expect(result.beneficiarios_por_etapa_vida).toEqual([
      { codigo: "infancia_0_12", etiqueta: "Infancia (0-12 años)", conteo: 4 },
      { codigo: "adolescencia_13_17", etiqueta: "Adolescencia (13-17 años)", conteo: 2 },
      { codigo: "adultez_18_59", etiqueta: "Adultez (18-59 años)", conteo: 0 },
      { codigo: "adulto_mayor_60_mas", etiqueta: "Adulto mayor (60+ años)", conteo: 0 },
    ]);

    expect(result.beneficiarios_por_estado).toEqual([
      { estado: "Nuevo León", conteo: 8, porcentaje: 80 },
      { estado: "Coahuila", conteo: 2, porcentaje: 20 },
    ]);

    expect(result.beneficiarios_por_tipo_espina).toEqual([
      { id_espina: 1, nombre: "Mielomeningocele", conteo: 7 },
    ]);

    expect(connection.execute).toHaveBeenCalledTimes(5);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getAllTimes debe regresar porcentajes en cero cuando no hay conteos de género", async () => {
    connection.execute
      .mockResolvedValueOnce({ rows: [{}] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await repository.getAllTimes();

    expect(result.beneficiarios_activos).toBe(0);
    expect(result.beneficiarios_inactivos).toBe(0);
    expect(result.beneficiarios_por_genero).toEqual([
      { genero: "femenino", conteo: 0, porcentaje: 0 },
      { genero: "masculino", conteo: 0, porcentaje: 0 },
      { genero: "otro", conteo: 0, porcentaje: 0 },
    ]);

    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getRangoFechas debe mapear tarjetas, servicios por día y distribuciones del rango", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            CITAS_PERIODO: 4,
            NUEVOS_REGISTROS: 2,
            TOTAL_ATENDIDOS: 3,
            SERVICIOS_OTORGADOS_PERIODO: 8,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { FECHA: "2026-06-01", CONTEO: 5 },
          { FECHA: "2026-06-03", CONTEO: 2 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { GENERO: "femenino", CONTEO: 2 },
          { GENERO: "masculino", CONTEO: 2 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { CODIGO: "adultez_18_59", CONTEO: 3 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { ESTADO: "Nuevo León", CONTEO: 3 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { ID_ESPINA: 2, NOMBRE: "Lipomeningocele", CONTEO: 1 },
        ],
      });

    const result = await repository.getRangoFechas("2026-06-01", "2026-06-03");

    expect(result.periodo).toEqual({
      desde: "2026-06-01",
      hasta: "2026-06-03",
    });
    expect(result.citas_periodo).toBe(4);
    expect(result.nuevos_beneficiarios).toBe(2);
    expect(result.beneficiarios_atendidos).toBe(3);
    expect(result.servicios_periodo).toBe(8);

    expect(result.servicios_por_dia).toEqual([
      { fecha: "2026-06-01", dia: 1, conteo: 5 },
      { fecha: "2026-06-02", dia: 2, conteo: 0 },
      { fecha: "2026-06-03", dia: 3, conteo: 2 },
    ]);

    expect(result.beneficiarios_por_tipo_espina).toEqual([
      { id_espina: 2, nombre: "Lipomeningocele", conteo: 1 },
    ]);

    expect(connection.execute).toHaveBeenCalledTimes(6);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getMensual debe calcular rango mensual y llenar todos los días del mes", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            NUEVOS_REGISTROS: 3,
            TOTAL_ATENDIDOS: 7,
            SERVICIOS_OTORGADOS_PERIODO: 12,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { FECHA: new Date(2026, 1, 1), CONTEO: 4 },
          { FECHA: "2026-02-28", CONTEO: 6 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { GENERO: "femenino", CONTEO: 1 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { CODIGO: "infancia_0_12", CONTEO: 1 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { ESTADO: "Nuevo León", CONTEO: 1 },
        ],
      });

    const result = await repository.getMensual(2, 2026);

    expect(result.periodo).toEqual({
      desde: "2026-02-01",
      hasta: "2026-02-28",
    });
    expect(result.mes).toBe(2);
    expect(result.anio).toBe(2026);
    expect(result.servicios_por_dia).toHaveLength(28);
    expect(result.servicios_por_dia[0]).toEqual({
      fecha: "2026-02-01",
      dia: 1,
      conteo: 4,
    });
    expect(result.servicios_por_dia[27]).toEqual({
      fecha: "2026-02-28",
      dia: 28,
      conteo: 6,
    });

    expect(connection.execute).toHaveBeenCalledTimes(5);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getAnual debe calcular rango anual y completar los 12 meses", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            NUEVOS_REGISTROS: 10,
            TOTAL_ATENDIDOS: 20,
            SERVICIOS_OTORGADOS_PERIODO: 30,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { MES: 1, CONTEO: 5 },
          { MES: 13, CONTEO: 99 },
          { MES: 6, CONTEO: 8 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { MES: 1, CONTEO: 2 },
          { MES: 6, CONTEO: 4 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { GENERO: "otro", CONTEO: 1 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { CODIGO: "adulto_mayor_60_mas", CONTEO: 1 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { ESTADO: "Nuevo León", CONTEO: 1 },
        ],
      });

    const result = await repository.getAnual(2026);

    expect(result.periodo).toEqual({
      desde: "2026-01-01",
      hasta: "2026-12-31",
    });
    expect(result.anio).toBe(2026);
    expect(result.por_mes).toHaveLength(12);
    expect(result.por_mes[0]).toEqual({
      mes: 1,
      servicios_otorgados: 5,
      nuevos_beneficiarios: 2,
    });
    expect(result.por_mes[5]).toEqual({
      mes: 6,
      servicios_otorgados: 8,
      nuevos_beneficiarios: 4,
    });
    expect(result.por_mes[11]).toEqual({
      mes: 12,
      servicios_otorgados: 0,
      nuevos_beneficiarios: 0,
    });

    expect(connection.execute).toHaveBeenCalledTimes(6);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getInventario debe mapear tarjetas, categorías, movimientos, historial y bajo stock", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            ARTICULOS_ACTIVOS: 12,
            PRODUCTOS_BAJO_STOCK: 3,
            VALOR_INVENTARIO: 123.456,
            ENTRADAS_UNIDADES: 20,
            SALIDAS_UNIDADES: 5,
            MOVIMIENTOS_REGISTRADOS: 7,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            ID_CATEGORIA: 1,
            DESCRIPCION: "Medicamento",
            PRODUCTOS: 4,
            UNIDADES: 100,
            VALOR: 99.999,
          },
          {
            id_categoria: 2,
            descripcion: null,
            productos: 1,
            unidades: 5,
            valor: "50.555",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            FECHA: "2026-06-01",
            ENTRADAS: 10,
            SALIDAS: 2,
            MOVIMIENTOS: 3,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            ID_MOVIMIENTO: 1,
            FECHA: "2026-06-01",
            CLAVE: "MED001",
            NOMBRE: "Paracetamol",
            TIPO_MOVIMIENTO: "salida",
            CANTIDAD: 2,
            CANT_ANTERIOR: 10,
            CANT_NUEVA: 8,
            MOTIVO: "Uso",
            USUARIO: "Admin",
          },
          {
            ID_MOVIMIENTO: 2,
            FECHA: "2026-06-02",
            CLAVE: "MED002",
            NOMBRE: "Gasas",
            TIPO_MOVIMIENTO: "otro",
            CANTIDAD: 5,
            CANT_ANTERIOR: 0,
            CANT_NUEVA: 5,
            MOTIVO: "Compra",
            USUARIO: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            ID_INVENTARIO: 9,
            CLAVE: "MED003",
            NOMBRE: "Alcohol",
            CANTIDAD: 1,
            UNIDAD_MEDIDA: "pz",
            DESCRIPCION_CATEGORIA: "Curación",
          },
        ],
      });

    const result = await repository.getInventario("2026-06-01", "2026-06-03");

    expect(result.periodo).toEqual({
      desde: "2026-06-01",
      hasta: "2026-06-03",
    });
    expect(result.articulos_activos).toBe(12);
    expect(result.productos_bajo_stock).toBe(3);
    expect(result.valor_inventario).toBe(123.46);
    expect(result.entradas_unidades).toBe(20);
    expect(result.salidas_unidades).toBe(5);
    expect(result.movimientos_registrados).toBe(7);

    expect(result.productos_por_categoria).toEqual([
      {
        id_categoria: 1,
        descripcion: "Medicamento",
        productos: 4,
        unidades: 100,
        valor: 100,
      },
      {
        id_categoria: 2,
        descripcion: "Sin categoría",
        productos: 1,
        unidades: 5,
        valor: 50.56,
      },
    ]);

    expect(result.movimientos_por_dia).toEqual([
      {
        fecha: "2026-06-01",
        entradas: 10,
        salidas: 2,
        movimientos: 3,
      },
      {
        fecha: "2026-06-02",
        entradas: 0,
        salidas: 0,
        movimientos: 0,
      },
      {
        fecha: "2026-06-03",
        entradas: 0,
        salidas: 0,
        movimientos: 0,
      },
    ]);

    expect(result.historial).toEqual([
      {
        id_movimiento: 1,
        fecha: "2026-06-01",
        clave: "MED001",
        nombre: "Paracetamol",
        tipo_movimiento: "salida",
        cantidad: 2,
        cant_anterior: 10,
        cant_nueva: 8,
        motivo: "Uso",
        usuario: "Admin",
      },
      {
        id_movimiento: 2,
        fecha: "2026-06-02",
        clave: "MED002",
        nombre: "Gasas",
        tipo_movimiento: "entrada",
        cantidad: 5,
        cant_anterior: 0,
        cant_nueva: 5,
        motivo: "Compra",
        usuario: "—",
      },
    ]);

    expect(result.lista_productos_bajo_stock).toEqual([
      {
        id_inventario: 9,
        clave: "MED003",
        nombre: "Alcohol",
        cantidad: 1,
        unidad_medida: "pz",
        descripcion_categoria: "Curación",
      },
    ]);

    expect(connection.execute).toHaveBeenCalledTimes(5);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getInventario debe usar valores cero cuando Oracle regresa datos vacíos o no numéricos", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            ARTICULOS_ACTIVOS: "abc",
            PRODUCTOS_BAJO_STOCK: undefined,
            VALOR_INVENTARIO: null,
            ENTRADAS_UNIDADES: "x",
            SALIDAS_UNIDADES: "y",
            MOVIMIENTOS_REGISTRADOS: "z",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await repository.getInventario("2026-06-01", "2026-06-02");

    expect(result.articulos_activos).toBe(0);
    expect(result.productos_bajo_stock).toBe(0);
    expect(result.valor_inventario).toBe(0);
    expect(result.entradas_unidades).toBe(0);
    expect(result.salidas_unidades).toBe(0);
    expect(result.movimientos_registrados).toBe(0);
    expect(result.productos_por_categoria).toEqual([]);
    expect(result.historial).toEqual([]);
    expect(result.lista_productos_bajo_stock).toEqual([]);
    expect(result.movimientos_por_dia).toEqual([
      {
        fecha: "2026-06-01",
        entradas: 0,
        salidas: 0,
        movimientos: 0,
      },
      {
        fecha: "2026-06-02",
        entradas: 0,
        salidas: 0,
        movimientos: 0,
      },
    ]);

    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("debe cerrar la conexión aunque falle una consulta", async () => {
    const error = new Error("Error de Oracle");

    connection.execute.mockRejectedValueOnce(error);

    await expect(repository.getAllTimes()).rejects.toThrow("Error de Oracle");

    expect(connection.close).toHaveBeenCalledTimes(1);
  });
});