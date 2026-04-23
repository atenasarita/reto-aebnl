import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import { IReciboRepository } from "../interfaces/reciboRepository.js";
import { ReciboCompleto, ItemInventarioRecibo, FinancieroRecibo } from "../types/recibos.types.js";

const oracle = new OracleConnection();

async function getConnection(): Promise<oracledb.Connection> {
  return oracle.getConnection();
}

// Columnas comunes para las consultas de recibos
const SELECT_COLS = `
    so.ID_SERVICIO_OTORGADO,
    id_.NOMBRES || ' ' || id_.APELLIDO_PATERNO  AS BENEFICIARIO,
    cs.NOMBRE                                   AS SERVICIO,
    TO_CHAR(so.FECHA, 'YYYY-MM-DD')             AS FECHA,
    so.HORA,
    sf.ID_SERVICIO_FINANCIERO,
    sf.MONTO_SERVICIO,
    sf.MONTO_INVENTARIO,
    sf.DESCUENTO,
    sf.CUOTA_TOTAL,
    sf.MONTO_PAGADO,
    sf.METODO_PAGO`;

const FROM_JOINS = `
  FROM SERVICIOS_OTORGADOS so
  JOIN BENEFICIARIO               b   ON b.ID_BENEFICIARIO       = so.ID_BENEFICIARIO
  JOIN IDENTIFICADORES            id_ ON id_.ID_BENEFICIARIO     = b.ID_BENEFICIARIO
  JOIN CATALOGO_SERVICIOS         cs  ON cs.ID_CATALOGO_SERVICIO = so.ID_CATALOGO_SERVICIO
  LEFT JOIN SERVICIOS_FINANCIEROS sf  ON sf.ID_SERVICIO_OTORGADO = so.ID_SERVICIO_OTORGADO`;

// Recibos por dia
const SQL_SERVICIOS_POR_FECHA = `
  SELECT ${SELECT_COLS}
  ${FROM_JOINS}
  WHERE TRUNC(so.FECHA) = TO_DATE(:fecha, 'YYYY-MM-DD')
  ORDER BY so.HORA ASC
`;

// Recibos por mes
const SQL_SERVICIOS_POR_MES = `
  SELECT ${SELECT_COLS}
  ${FROM_JOINS}
  WHERE TRUNC(so.FECHA, 'MM') = TRUNC(TO_DATE(:fecha, 'YYYY-MM'), 'MM')
  ORDER BY so.FECHA ASC, so.HORA ASC
`;

// Buscar servicio por ID
const SQL_SERVICIO_POR_ID = `
  SELECT ${SELECT_COLS}
  ${FROM_JOINS}
  WHERE so.ID_SERVICIO_OTORGADO = :id
`;

// Items de inventario de un servicio
const SQL_ITEMS_INVENTARIO = `
  SELECT
    vi.ID_VENTA_INVENTARIO,
    vi.ID_INVENTARIO,
    i.NOMBRE       AS NOMBRE_ARTICULO,
    vi.CANTIDAD,
    vi.PRECIO_UNITARIO,
    vi.SUBTOTAL
  FROM VENTA_INVENTARIO vi
  JOIN INVENTARIO i ON i.ID_INVENTARIO = vi.ID_INVENTARIO
  WHERE vi.ID_SERVICIO_OTORGADO = :id
`;

// Ayudas de mapeo de filas a objetos
function rowToFinanciero(row: Record<string, unknown>): FinancieroRecibo | null {
  if (!row["ID_SERVICIO_FINANCIERO"]) return null;
  return {
    id_servicio_financiero: Number(row["ID_SERVICIO_FINANCIERO"]),
    monto_servicio:         Number(row["MONTO_SERVICIO"]   ?? 0),
    monto_inventario:       Number(row["MONTO_INVENTARIO"] ?? 0),
    descuento:              Number(row["DESCUENTO"]        ?? 0),
    cuota_total:            Number(row["CUOTA_TOTAL"]      ?? 0),
    monto_pagado:           Number(row["MONTO_PAGADO"]     ?? 0),
    metodo_pago:            row["METODO_PAGO"] as FinancieroRecibo["metodo_pago"],
  };
}

function rowToReciboCompleto(
  row: Record<string, unknown>,
  items: ItemInventarioRecibo[]
): ReciboCompleto {
  return {
    id_servicio_otorgado: Number(row["ID_SERVICIO_OTORGADO"]),
    beneficiario:         String(row["BENEFICIARIO"] ?? ""),
    servicio:             String(row["SERVICIO"]     ?? ""),
    fecha:                String(row["FECHA"]        ?? ""),
    hora:                 String(row["HORA"]         ?? ""),
    items_inventario:     items,
    financiero:           rowToFinanciero(row),
  };
}

async function fetchItems(
  conn: oracledb.Connection,
  idServicio: number
): Promise<ItemInventarioRecibo[]> {
  const result = await conn.execute(
    SQL_ITEMS_INVENTARIO,
    { id: idServicio },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return ((result.rows ?? []) as Record<string, unknown>[]).map((r) => ({
    id_venta_inventario: Number(r["ID_VENTA_INVENTARIO"]),
    id_inventario:       Number(r["ID_INVENTARIO"]),
    nombre_articulo:     String(r["NOMBRE_ARTICULO"] ?? ""),
    cantidad:            Number(r["CANTIDAD"]),
    precio_unitario:     Number(r["PRECIO_UNITARIO"]),
    subtotal:            Number(r["SUBTOTAL"]),
  }));
}

async function ejecutarConsulta(
  sql: string,
  binds: oracledb.BindParameters
): Promise<ReciboCompleto[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const rows   = (result.rows ?? []) as Record<string, unknown>[];
    return Promise.all(
      rows.map(async (row): Promise<ReciboCompleto> => {
        const id    = Number(row["ID_SERVICIO_OTORGADO"]);
        const items = await fetchItems(conn, id);
        return rowToReciboCompleto(row, items);
      })
    );
  } finally {
    await conn.close();
  }
}

// Repositorio
export class ReciboRepository implements IReciboRepository {

  /** Recibos de un día */
  async listarPorFecha(fecha: string): Promise<ReciboCompleto[]> {
    return ejecutarConsulta(SQL_SERVICIOS_POR_FECHA, { fecha });
  }

  /**Recibos del mes */
  async listarPorMes(fecha: string): Promise<ReciboCompleto[]> {
    return ejecutarConsulta(SQL_SERVICIOS_POR_MES, { fecha });
  }

  /** Recibo individual por ID de servicio otorgado */
  async obtenerPorId(idServicioOtorgado: number): Promise<ReciboCompleto | null> {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        SQL_SERVICIO_POR_ID,
        { id: idServicioOtorgado },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = (result.rows ?? []) as Record<string, unknown>[];
      if (rows.length === 0) return null;
      const row   = rows[0];
      const id    = Number(row["ID_SERVICIO_OTORGADO"]);
      const items = await fetchItems(conn, id);
      return rowToReciboCompleto(row, items);
    } finally {
      await conn.close();
    }
  }
}