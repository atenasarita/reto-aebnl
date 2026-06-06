import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const mockGetConnection = jest.fn();

jest.unstable_mockModule(
  "oracledb",
  () => ({
    __esModule: true,
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

const { ReciboRepository } = await import(
  '../../server/src/repositories/recibo.repository.ts'
);

type ExecuteResult = {
  rows: Record<string, unknown>[];
};

type ExecuteMock = jest.MockedFunction<
  (sql: string, binds: Record<string, unknown>, options?: Record<string, unknown>) => Promise<ExecuteResult>
>;

type CloseMock = jest.MockedFunction<() => Promise<void>>;

type MockConn = {
  execute: ExecuteMock;
  close: CloseMock;
};

function createConnection({
  serviceRows = [],
  itemRowsByServiceId = {},
  failOnMainQuery = false,
  failOnItemsQuery = false,
}: {
  serviceRows?: Record<string, unknown>[];
  itemRowsByServiceId?: Record<number, Record<string, unknown>[]>;
  failOnMainQuery?: boolean;
  failOnItemsQuery?: boolean;
} = {}): MockConn {
  const execute = jest.fn(async (sql: string, binds: Record<string, unknown>) => {
    if (String(sql).includes('VENTA_INVENTARIO')) {
      if (failOnItemsQuery) {
        throw new Error('Error al consultar inventario');
      }

      const id = Number(binds.id);
      return {
        rows: itemRowsByServiceId[id] ?? [],
      };
    }

    if (failOnMainQuery) {
      throw new Error('Error al consultar recibos');
    }

    return {
      rows: serviceRows,
    };
  });

  const close = jest.fn(async () => undefined);

  return {
    execute,
    close,
  };
}

const reciboRowConFinanciero = {
  ID_SERVICIO_OTORGADO: 100,
  BENEFICIARIO: 'Ana López',
  SERVICIO: 'Consulta médica',
  FECHA: '2026-06-05',
  HORA: '09:30',
  ID_SERVICIO_FINANCIERO: 500,
  MONTO_SERVICIO: 300,
  MONTO_INVENTARIO: 120,
  DESCUENTO: 20,
  CUOTA_TOTAL: 400,
  MONTO_PAGADO: 400,
  MONTO_DONACION: 50,
  METODO_PAGO: 'EFECTIVO',
};

const reciboRowSinFinanciero = {
  ID_SERVICIO_OTORGADO: 101,
  BENEFICIARIO: 'Carlos Pérez',
  SERVICIO: 'Terapia',
  FECHA: '2026-06-06',
  HORA: '10:00',
  ID_SERVICIO_FINANCIERO: null,
  MONTO_SERVICIO: null,
  MONTO_INVENTARIO: null,
  DESCUENTO: null,
  CUOTA_TOTAL: null,
  MONTO_PAGADO: null,
  MONTO_DONACION: null,
  METODO_PAGO: null,
};

const itemInventarioRow = {
  ID_VENTA_INVENTARIO: 900,
  ID_INVENTARIO: 20,
  NOMBRE_ARTICULO: 'Sonda',
  CANTIDAD: 2,
  PRECIO_UNITARIO: 60,
  SUBTOTAL: 120,
};

describe('ReciboRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listarPorFecha consulta recibos por día, mapea financiero, inventario y cierra conexión', async () => {
    const conn = createConnection({
      serviceRows: [reciboRowConFinanciero],
      itemRowsByServiceId: {
        100: [itemInventarioRow],
      },
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    const result = await repository.listarPorFecha('2026-06-05');

    expect(mockGetConnection).toHaveBeenCalledTimes(1);

    expect(conn.execute).toHaveBeenCalledTimes(2);

    expect(conn.execute.mock.calls[0][0]).toContain(
      "TRUNC(so.FECHA) = TO_DATE(:fecha, 'YYYY-MM-DD')"
    );

    expect(conn.execute.mock.calls[0][1]).toEqual({
      fecha: '2026-06-05',
    });

    expect(conn.execute.mock.calls[1][0]).toContain('VENTA_INVENTARIO');

    expect(conn.execute.mock.calls[1][1]).toEqual({
      id: 100,
    });

    expect(result).toEqual([
      {
        id_servicio_otorgado: 100,
        beneficiario: 'Ana López',
        servicio: 'Consulta médica',
        fecha: '2026-06-05',
        hora: '09:30',
        items_inventario: [
          {
            id_venta_inventario: 900,
            id_inventario: 20,
            nombre_articulo: 'Sonda',
            cantidad: 2,
            precio_unitario: 60,
            subtotal: 120,
          },
        ],
        financiero: {
          id_servicio_financiero: 500,
          monto_servicio: 300,
          monto_inventario: 120,
          descuento: 20,
          cuota_total: 400,
          monto_pagado: 400,
          monto_donacion: 50,
          metodo_pago: 'EFECTIVO',
        },
      },
    ]);

    expect(conn.close).toHaveBeenCalledTimes(1);
  });

  test('listarPorMes usa el bind fecha y consulta recibos del mes', async () => {
    const conn = createConnection({
      serviceRows: [],
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    const result = await repository.listarPorMes('2026-06');

    expect(result).toEqual([]);

    expect(conn.execute).toHaveBeenCalledTimes(1);

    expect(conn.execute.mock.calls[0][0]).toContain(
      "TRUNC(so.FECHA, 'MM') = TRUNC(TO_DATE(:fecha, 'YYYY-MM'), 'MM')"
    );

    expect(conn.execute.mock.calls[0][1]).toEqual({
      fecha: '2026-06',
    });

    expect(conn.close).toHaveBeenCalledTimes(1);
  });

  test('listarRecibosRango usa los binds desde y hasta', async () => {
    const conn = createConnection({
      serviceRows: [],
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    const result = await repository.listarRecibosRango(
      '2026-06-01',
      '2026-06-30'
    );

    expect(result).toEqual([]);

    expect(conn.execute).toHaveBeenCalledTimes(1);

    expect(conn.execute.mock.calls[0][0]).toContain(
      "TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')"
    );

    expect(conn.execute.mock.calls[0][1]).toEqual({
      desde: '2026-06-01',
      hasta: '2026-06-30',
    });

    expect(conn.close).toHaveBeenCalledTimes(1);
  });

  test('obtenerPorId regresa null cuando no existe el recibo', async () => {
    const conn = createConnection({
      serviceRows: [],
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    const result = await repository.obtenerPorId(999);

    expect(result).toBeNull();

    expect(conn.execute).toHaveBeenCalledTimes(1);

    expect(conn.execute.mock.calls[0][0]).toContain(
      'WHERE so.ID_SERVICIO_OTORGADO = :id'
    );

    expect(conn.execute.mock.calls[0][1]).toEqual({
      id: 999,
    });

    expect(conn.close).toHaveBeenCalledTimes(1);
  });

  test('obtenerPorId mapea recibo sin financiero y sin items de inventario', async () => {
    const conn = createConnection({
      serviceRows: [reciboRowSinFinanciero],
      itemRowsByServiceId: {
        101: [],
      },
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    const result = await repository.obtenerPorId(101);

    expect(conn.execute).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      id_servicio_otorgado: 101,
      beneficiario: 'Carlos Pérez',
      servicio: 'Terapia',
      fecha: '2026-06-06',
      hora: '10:00',
      items_inventario: [],
      financiero: null,
    });

    expect(conn.close).toHaveBeenCalledTimes(1);
  });

  test('listarPorFecha convierte valores null o undefined a valores seguros', async () => {
    const rowConCamposVacios = {
      ID_SERVICIO_OTORGADO: 200,
      BENEFICIARIO: null,
      SERVICIO: undefined,
      FECHA: null,
      HORA: undefined,
      ID_SERVICIO_FINANCIERO: 700,
      MONTO_SERVICIO: undefined,
      MONTO_INVENTARIO: null,
      DESCUENTO: undefined,
      CUOTA_TOTAL: null,
      MONTO_PAGADO: undefined,
      MONTO_DONACION: null,
      METODO_PAGO: 'TRANSFERENCIA',
    };

    const conn = createConnection({
      serviceRows: [rowConCamposVacios],
      itemRowsByServiceId: {
        200: [],
      },
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    const result = await repository.listarPorFecha('2026-06-05');

    expect(result).toEqual([
      {
        id_servicio_otorgado: 200,
        beneficiario: '',
        servicio: '',
        fecha: '',
        hora: '',
        items_inventario: [],
        financiero: {
          id_servicio_financiero: 700,
          monto_servicio: 0,
          monto_inventario: 0,
          descuento: 0,
          cuota_total: 0,
          monto_pagado: 0,
          monto_donacion: 0,
          metodo_pago: 'TRANSFERENCIA',
        },
      },
    ]);

    expect(conn.close).toHaveBeenCalledTimes(1);
  });

  test('cierra la conexión aunque falle la consulta principal', async () => {
    const conn = createConnection({
      failOnMainQuery: true,
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    await expect(repository.listarPorFecha('2026-06-05')).rejects.toThrow(
      'Error al consultar recibos'
    );

    expect(conn.close).toHaveBeenCalledTimes(1);
  });

  test('cierra la conexión aunque falle la consulta de items de inventario', async () => {
    const conn = createConnection({
      serviceRows: [reciboRowConFinanciero],
      failOnItemsQuery: true,
    });

    mockGetConnection.mockResolvedValueOnce(conn as never);

    const repository = new ReciboRepository();

    await expect(repository.obtenerPorId(100)).rejects.toThrow(
      'Error al consultar inventario'
    );

    expect(conn.close).toHaveBeenCalledTimes(1);
  });
});