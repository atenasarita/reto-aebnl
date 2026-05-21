import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import { IReportesRepository } from "../interfaces/reportesRepository";
import {
  BeneficiariosPorTipoEspina,
  CodigoEtapaVida,
  DistribucionBeneficiariosEstado,
  DistribucionEtapaVida,
  DistribucionPorGenero,
  InventarioHistorialMovimiento,
  InventarioMovimientosPorDia,
  InventarioProductoBajoStock,
  InventarioProductoPorCategoria,
  MesMetricasAnual,
  ReporteAllTimes,
  ReporteAnual,
  ReporteInventario,
  ReporteMensual,
  ReporteRangoFechas,
  ServiciosPorDia,
} from "../types/reportes.types";
import { reportesQueries } from "./reportes.queries";

async function getConnection(): Promise<oracledb.Connection> {
  const oracle = new OracleConnection();
  return oracle.getConnection();
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function mapDistribucionGenero(rows: Record<string, unknown>[]): DistribucionPorGenero[] {
  const generoMap = new Map<string, number>(rows.map((r) => [String(r.GENERO ?? "otro"), num(r.CONTEO)]));
  const total = ["femenino", "masculino", "otro"].reduce((acc, key) => acc + (generoMap.get(key) ?? 0), 0);

  return (["femenino", "masculino", "otro"] as const).map((genero) => {
    const conteo = generoMap.get(genero) ?? 0;
    return {
      genero,
      conteo,
      porcentaje: total > 0 ? round2((conteo / total) * 100) : 0,
    };
  });
}

function mapDistribucionEtapaVida(rows: Record<string, unknown>[]): DistribucionEtapaVida[] {
  const etapaMap = new Map<CodigoEtapaVida, number>(
    rows.map((r) => [String(r.CODIGO) as CodigoEtapaVida, num(r.CONTEO)])
  );
  const etapas: Array<{ codigo: CodigoEtapaVida; etiqueta: string }> = [
    { codigo: "infancia_0_12", etiqueta: "Infancia (0-12 años)" },
    { codigo: "adolescencia_13_17", etiqueta: "Adolescencia (13-17 años)" },
    { codigo: "adultez_18_59", etiqueta: "Adultez (18-59 años)" },
    { codigo: "adulto_mayor_60_mas", etiqueta: "Adulto mayor (60+ años)" },
  ];

  return etapas.map((etapa) => ({
    codigo: etapa.codigo,
    etiqueta: etapa.etiqueta,
    conteo: etapaMap.get(etapa.codigo) ?? 0,
  }));
}

function mapDistribucionEstado(rows: Record<string, unknown>[]): DistribucionBeneficiariosEstado[] {
  const total = rows.reduce((acc, r) => acc + num(r.CONTEO), 0);
  return rows.map((r) => {
    const conteo = num(r.CONTEO ?? r.conteo);
    return {
      estado: String(r.ESTADO ?? r.estado ?? "sin_estado"),
      conteo,
      porcentaje: total > 0 ? round2((conteo / total) * 100) : 0,
    };
  });
}

function mapTipoEspina(rows: Record<string, unknown>[]): BeneficiariosPorTipoEspina[] {
  return rows.map((r) => ({
    id_espina: num(r.ID_ESPINA ?? r.id_espina),
    nombre: String(r.NOMBRE ?? r.nombre ?? ""),
    conteo: num(r.CONTEO ?? r.conteo),
  }));
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function rangoMes(mes: number, anio: number): { desde: string; hasta: string; diasEnMes: number } {
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const desde = `${anio}-${pad2(mes)}-01`;
  const hasta = `${anio}-${pad2(mes)}-${pad2(diasEnMes)}`;
  return { desde, hasta, diasEnMes };
}

function rangoAnio(anio: number): { desde: string; hasta: string } {
  return { desde: `${anio}-01-01`, hasta: `${anio}-12-31` };
}

function mapPorMesAnual(
  servRows: Record<string, unknown>[],
  nuevosRows: Record<string, unknown>[]
): MesMetricasAnual[] {
  const servMap = new Map<number, number>();
  for (const r of servRows) {
    const m = num(r.MES ?? r.mes);
    if (m >= 1 && m <= 12) servMap.set(m, num(r.CONTEO ?? r.conteo));
  }
  const nuevosMap = new Map<number, number>();
  for (const r of nuevosRows) {
    const m = num(r.MES ?? r.mes);
    if (m >= 1 && m <= 12) nuevosMap.set(m, num(r.CONTEO ?? r.conteo));
  }
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    return {
      mes,
      servicios_otorgados: servMap.get(mes) ?? 0,
      nuevos_beneficiarios: nuevosMap.get(mes) ?? 0,
    };
  });
}

function parseYmd(s: string): { y: number; m: number; d: number } {
  const parts = s.split("-").map(Number);
  return { y: parts[0] ?? 0, m: parts[1] ?? 0, d: parts[2] ?? 0 };
}

function addOneDayYmd(y: number, m: number, d: number): string {
  const dt = new Date(y, m - 1, d + 1);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

function eachDayInclusive(desde: string, hasta: string): string[] {
  const out: string[] = [];
  let cur = desde;
  let guard = 0;
  const maxDays = 4000;
  while (cur <= hasta && guard++ < maxDays) {
    out.push(cur);
    if (cur === hasta) break;
    const { y, m, d } = parseYmd(cur);
    cur = addOneDayYmd(y, m, d);
  }
  return out;
}

function mapServiciosPorDia(
  rows: Record<string, unknown>[],
  desde: string,
  diasEnMes: number
): ServiciosPorDia[] {
  const conteos = new Map<string, number>();
  rows.forEach((r) => {
    const fechaRaw = r.FECHA ?? r.fecha;
    if (!fechaRaw) return;
    let fechaStr: string;
    if (fechaRaw instanceof Date) {
      fechaStr = `${fechaRaw.getFullYear()}-${pad2(fechaRaw.getMonth() + 1)}-${pad2(
        fechaRaw.getDate()
      )}`;
    } else {
      fechaStr = String(fechaRaw).slice(0, 10);
    }
    conteos.set(fechaStr, num(r.CONTEO ?? r.conteo));
  });

  const [anioStr, mesStr] = desde.split("-");
  const anio = Number(anioStr);
  const mes = Number(mesStr);
  const result: ServiciosPorDia[] = [];
  for (let d = 1; d <= diasEnMes; d++) {
    const fechaStr = `${anio}-${pad2(mes)}-${pad2(d)}`;
    result.push({
      fecha: fechaStr,
      dia: d,
      conteo: conteos.get(fechaStr) ?? 0,
    });
  }
  return result;
}

function mapInventarioMovimientosPorRango(
  rows: Record<string, unknown>[],
  desde: string,
  hasta: string
): InventarioMovimientosPorDia[] {
  const byFecha = new Map<
    string,
    { entradas: number; salidas: number; movimientos: number }
  >();
  rows.forEach((r) => {
    const fecha = String(r.FECHA ?? r.fecha ?? "").slice(0, 10);
    if (!fecha) return;
    byFecha.set(fecha, {
      entradas: num(r.ENTRADAS ?? r.entradas),
      salidas: num(r.SALIDAS ?? r.salidas),
      movimientos: num(r.MOVIMIENTOS ?? r.movimientos),
    });
  });

  return eachDayInclusive(desde, hasta).map((fecha) => {
    const row = byFecha.get(fecha);
    return {
      fecha,
      entradas: row?.entradas ?? 0,
      salidas: row?.salidas ?? 0,
      movimientos: row?.movimientos ?? 0,
    };
  });
}

function mapInventarioPorCategoria(rows: Record<string, unknown>[]): InventarioProductoPorCategoria[] {
  return rows.map((r) => ({
    id_categoria: num(r.ID_CATEGORIA ?? r.id_categoria),
    descripcion: String(r.DESCRIPCION ?? r.descripcion ?? "Sin categoría"),
    productos: num(r.PRODUCTOS ?? r.productos),
    unidades: num(r.UNIDADES ?? r.unidades),
    valor: round2(num(r.VALOR ?? r.valor)),
  }));
}

function mapInventarioHistorial(rows: Record<string, unknown>[]): InventarioHistorialMovimiento[] {
  return rows.map((r) => {
    const tipoRaw = String(r.TIPO_MOVIMIENTO ?? r.tipo_movimiento ?? "entrada").toLowerCase();
    const tipo: "entrada" | "salida" = tipoRaw === "salida" ? "salida" : "entrada";
    return {
      id_movimiento: num(r.ID_MOVIMIENTO ?? r.id_movimiento),
      fecha: String(r.FECHA ?? r.fecha ?? ""),
      clave: String(r.CLAVE ?? r.clave ?? ""),
      nombre: String(r.NOMBRE ?? r.nombre ?? ""),
      tipo_movimiento: tipo,
      cantidad: num(r.CANTIDAD ?? r.cantidad),
      cant_anterior: num(r.CANT_ANTERIOR ?? r.cant_anterior),
      cant_nueva: num(r.CANT_NUEVA ?? r.cant_nueva),
      motivo: String(r.MOTIVO ?? r.motivo ?? ""),
      usuario: String(r.USUARIO ?? r.usuario ?? "—"),
    };
  });
}

function mapInventarioBajoStock(rows: Record<string, unknown>[]): InventarioProductoBajoStock[] {
  return rows.map((r) => ({
    id_inventario: num(r.ID_INVENTARIO ?? r.id_inventario),
    clave: String(r.CLAVE ?? r.clave ?? ""),
    nombre: String(r.NOMBRE ?? r.nombre ?? ""),
    cantidad: num(r.CANTIDAD ?? r.cantidad),
    unidad_medida: String(r.UNIDAD_MEDIDA ?? r.unidad_medida ?? ""),
    descripcion_categoria: String(r.DESCRIPCION_CATEGORIA ?? r.descripcion_categoria ?? ""),
  }));
}

function mapServiciosPorRango(rows: Record<string, unknown>[], desde: string, hasta: string): ServiciosPorDia[] {
  const conteos = new Map<string, number>();
  rows.forEach((r) => {
    const fechaRaw = r.FECHA ?? r.fecha;
    if (!fechaRaw) return;
    let fechaStr: string;
    if (fechaRaw instanceof Date) {
      fechaStr = `${fechaRaw.getFullYear()}-${pad2(fechaRaw.getMonth() + 1)}-${pad2(fechaRaw.getDate())}`;
    } else {
      fechaStr = String(fechaRaw).slice(0, 10);
    }
    conteos.set(fechaStr, num(r.CONTEO ?? r.conteo));
  });

  const days = eachDayInclusive(desde, hasta);
  return days.map((fechaStr, index) => ({
    fecha: fechaStr,
    dia: index + 1,
    conteo: conteos.get(fechaStr) ?? 0,
  }));
}

export class ReportesRepository implements IReportesRepository {
  async getAllTimes(): Promise<ReporteAllTimes> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();

      const totalesRes = await conn.execute(
        reportesQueries.analyticsTotalesBeneficiarios,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const generoRes = await conn.execute(
        reportesQueries.allTimesDistribucionGenero,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const etapaRes = await conn.execute(
        reportesQueries.allTimesDistribucionEtapaVida,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const estadoRes = await conn.execute(
        reportesQueries.analyticsDistribucionBeneficiariosEstado,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const espinaRes = await conn.execute(
        reportesQueries.analyticsBeneficiariosPorTipoEspina,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const totalesRow = (totalesRes.rows?.[0] as Record<string, unknown>) ?? {};
      const generoRows = (generoRes.rows ?? []) as Record<string, unknown>[];
      const etapaRows = (etapaRes.rows ?? []) as Record<string, unknown>[];
      const estadoRows = (estadoRes.rows ?? []) as Record<string, unknown>[];
      const espinaRows = (espinaRes.rows ?? []) as Record<string, unknown>[];

      return {
        beneficiarios_activos: num(totalesRow.ACTIVOS ?? totalesRow.activos),
        beneficiarios_inactivos: num(totalesRow.INACTIVOS ?? totalesRow.inactivos),
        beneficiarios_por_genero: mapDistribucionGenero(generoRows),
        beneficiarios_por_etapa_vida: mapDistribucionEtapaVida(etapaRows),
        beneficiarios_por_estado: mapDistribucionEstado(estadoRows),
        beneficiarios_por_tipo_espina: mapTipoEspina(espinaRows),
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async getRangoFechas(desde: string, hasta: string): Promise<ReporteRangoFechas> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();

      const tarjetasRes = await conn.execute(
        reportesQueries.analyticsTarjetas,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const serviciosDiaRes = await conn.execute(
        reportesQueries.analyticsServiciosPorDia,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const generoRes = await conn.execute(
        reportesQueries.analyticsDistribucionGenero,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const etapaRes = await conn.execute(
        reportesQueries.analyticsDistribucionEtapaVida,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const estadoRes = await conn.execute(
        reportesQueries.rangoDistribucionBeneficiariosEstado,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const espinaRes = await conn.execute(
        reportesQueries.rangoBeneficiariosPorTipoEspina,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const tarjetasRow = (tarjetasRes.rows?.[0] as Record<string, unknown>) ?? {};
      const serviciosDiaRows = (serviciosDiaRes.rows ?? []) as Record<string, unknown>[];
      const generoRows = (generoRes.rows ?? []) as Record<string, unknown>[];
      const etapaRows = (etapaRes.rows ?? []) as Record<string, unknown>[];
      const estadoRows = (estadoRes.rows ?? []) as Record<string, unknown>[];
      const espinaRows = (espinaRes.rows ?? []) as Record<string, unknown>[];

      return {
        periodo: { desde, hasta },
        citas_periodo: num(tarjetasRow.CITAS_PERIODO ?? tarjetasRow.citas_periodo),
        nuevos_beneficiarios: num(tarjetasRow.NUEVOS_REGISTROS ?? tarjetasRow.nuevos_registros),
        beneficiarios_atendidos: num(tarjetasRow.TOTAL_ATENDIDOS ?? tarjetasRow.total_atendidos),
        servicios_periodo: num(
          tarjetasRow.SERVICIOS_OTORGADOS_PERIODO ?? tarjetasRow.servicios_otorgados_periodo
        ),
        servicios_por_dia: mapServiciosPorRango(serviciosDiaRows, desde, hasta),
        beneficiarios_por_genero: mapDistribucionGenero(generoRows),
        beneficiarios_por_etapa_vida: mapDistribucionEtapaVida(etapaRows),
        beneficiarios_por_estado: mapDistribucionEstado(estadoRows),
        beneficiarios_por_tipo_espina: mapTipoEspina(espinaRows),
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async getMensual(mes: number, anio: number): Promise<ReporteMensual> {
    const { desde, hasta, diasEnMes } = rangoMes(mes, anio);

    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();

      const tarjetasRes = await conn.execute(
        reportesQueries.analyticsTarjetas,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const serviciosDiaRes = await conn.execute(
        reportesQueries.analyticsServiciosPorDia,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const generoRes = await conn.execute(
        reportesQueries.analyticsDistribucionGenero,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const etapaRes = await conn.execute(
        reportesQueries.analyticsDistribucionEtapaVida,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const estadoRes = await conn.execute(
        reportesQueries.rangoDistribucionBeneficiariosEstado,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const tarjetasRow = (tarjetasRes.rows?.[0] as Record<string, unknown>) ?? {};
      const serviciosDiaRows = (serviciosDiaRes.rows ?? []) as Record<string, unknown>[];
      const generoRows = (generoRes.rows ?? []) as Record<string, unknown>[];
      const etapaRows = (etapaRes.rows ?? []) as Record<string, unknown>[];
      const estadoRows = (estadoRes.rows ?? []) as Record<string, unknown>[];

      return {
        periodo: { desde, hasta },
        mes,
        anio,
        nuevos_beneficiarios: num(tarjetasRow.NUEVOS_REGISTROS ?? tarjetasRow.nuevos_registros),
        beneficiarios_atendidos: num(tarjetasRow.TOTAL_ATENDIDOS ?? tarjetasRow.total_atendidos),
        servicios_periodo: num(
          tarjetasRow.SERVICIOS_OTORGADOS_PERIODO ?? tarjetasRow.servicios_otorgados_periodo
        ),
        servicios_por_dia: mapServiciosPorDia(serviciosDiaRows, desde, diasEnMes),
        beneficiarios_por_genero: mapDistribucionGenero(generoRows),
        beneficiarios_por_etapa_vida: mapDistribucionEtapaVida(etapaRows),
        beneficiarios_por_estado: mapDistribucionEstado(estadoRows),
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async getAnual(anio: number): Promise<ReporteAnual> {
    const { desde, hasta } = rangoAnio(anio);

    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();

      const tarjetasRes = await conn.execute(
        reportesQueries.analyticsTarjetas,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const servMesRes = await conn.execute(
        reportesQueries.analyticsServiciosPorMesAnio,
        { anio },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const nuevosMesRes = await conn.execute(
        reportesQueries.analyticsNuevosBeneficiariosPorMesAnio,
        { anio },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const generoRes = await conn.execute(
        reportesQueries.analyticsDistribucionGenero,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const etapaRes = await conn.execute(
        reportesQueries.analyticsDistribucionEtapaVida,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const estadoRes = await conn.execute(
        reportesQueries.rangoDistribucionBeneficiariosEstado,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const tarjetasRow = (tarjetasRes.rows?.[0] as Record<string, unknown>) ?? {};
      const servMesRows = (servMesRes.rows ?? []) as Record<string, unknown>[];
      const nuevosMesRows = (nuevosMesRes.rows ?? []) as Record<string, unknown>[];
      const generoRows = (generoRes.rows ?? []) as Record<string, unknown>[];
      const etapaRows = (etapaRes.rows ?? []) as Record<string, unknown>[];
      const estadoRows = (estadoRes.rows ?? []) as Record<string, unknown>[];

      return {
        periodo: { desde, hasta },
        anio,
        nuevos_beneficiarios: num(tarjetasRow.NUEVOS_REGISTROS ?? tarjetasRow.nuevos_registros),
        beneficiarios_atendidos: num(tarjetasRow.TOTAL_ATENDIDOS ?? tarjetasRow.total_atendidos),
        servicios_periodo: num(
          tarjetasRow.SERVICIOS_OTORGADOS_PERIODO ?? tarjetasRow.servicios_otorgados_periodo
        ),
        por_mes: mapPorMesAnual(servMesRows, nuevosMesRows),
        beneficiarios_por_genero: mapDistribucionGenero(generoRows),
        beneficiarios_por_etapa_vida: mapDistribucionEtapaVida(etapaRows),
        beneficiarios_por_estado: mapDistribucionEstado(estadoRows),
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async getInventario(desde: string, hasta: string): Promise<ReporteInventario> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();

      const tarjetasRes = await conn.execute(
        reportesQueries.inventarioTarjetas,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const categoriaRes = await conn.execute(
        reportesQueries.inventarioPorCategoria,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const porDiaRes = await conn.execute(
        reportesQueries.inventarioMovimientosPorDia,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const historialRes = await conn.execute(
        reportesQueries.inventarioHistorial,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const bajoStockRes = await conn.execute(
        reportesQueries.inventarioProductosBajoStock,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const tarjetasRow = (tarjetasRes.rows?.[0] as Record<string, unknown>) ?? {};
      const categoriaRows = (categoriaRes.rows ?? []) as Record<string, unknown>[];
      const porDiaRows = (porDiaRes.rows ?? []) as Record<string, unknown>[];
      const historialRows = (historialRes.rows ?? []) as Record<string, unknown>[];
      const bajoStockRows = (bajoStockRes.rows ?? []) as Record<string, unknown>[];

      return {
        periodo: { desde, hasta },
        articulos_activos: num(tarjetasRow.ARTICULOS_ACTIVOS ?? tarjetasRow.articulos_activos),
        productos_bajo_stock: num(
          tarjetasRow.PRODUCTOS_BAJO_STOCK ?? tarjetasRow.productos_bajo_stock
        ),
        valor_inventario: round2(num(tarjetasRow.VALOR_INVENTARIO ?? tarjetasRow.valor_inventario)),
        entradas_unidades: num(tarjetasRow.ENTRADAS_UNIDADES ?? tarjetasRow.entradas_unidades),
        salidas_unidades: num(tarjetasRow.SALIDAS_UNIDADES ?? tarjetasRow.salidas_unidades),
        movimientos_registrados: num(
          tarjetasRow.MOVIMIENTOS_REGISTRADOS ?? tarjetasRow.movimientos_registrados
        ),
        productos_por_categoria: mapInventarioPorCategoria(categoriaRows),
        movimientos_por_dia: mapInventarioMovimientosPorRango(porDiaRows, desde, hasta),
        historial: mapInventarioHistorial(historialRows),
        lista_productos_bajo_stock: mapInventarioBajoStock(bajoStockRows),
      };
    } finally {
      if (conn) await conn.close();
    }
  }
}

export default ReportesRepository;
