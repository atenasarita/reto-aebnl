import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import { IReportesRepository } from "../interfaces/reportesRepository";
import {
  BeneficiarioIngresoRow,
  CodigoEtapaVida,
  CitaPeriodoRow,
  DesgloseServiciosPorMes,
  DistribucionEtapaVida,
  DistribucionPorGenero,
  FinancieroMesPorMetodo,
  FinancieroMesTotales,
  PersonasAtendidasPorMes,
  ReporteAnalyticsDashboard,
  ReporteFinancieroMes,
  ReporteResumen,
  ReporteTarjetasAnalytics,
  TendenciaMetrica,
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

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getTendencia(actual: number, anterior: number): TendenciaMetrica {
  if (actual > anterior) return "sube";
  if (actual < anterior) return "baja";
  return "sin_cambios";
}

function variacionPct(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual === 0 ? 0 : null;
  return round2(((actual - anterior) / anterior) * 100);
}

export class ReportesRepository implements IReportesRepository {
  async getResumen(): Promise<ReporteResumen> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        reportesQueries.resumen,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const row = (result.rows?.[0] as Record<string, unknown>) ?? {};
      return {
        beneficiarios_activos: num(row.BENEFICIARIOS_ACTIVOS ?? row.beneficiarios_activos),
        beneficiarios_inactivos: num(row.BENEFICIARIOS_INACTIVOS ?? row.beneficiarios_inactivos),
        preregistros_pendientes: num(row.PREREGISTROS_PENDIENTES ?? row.preregistros_pendientes),
        preregistros_aceptados: num(row.PREREGISTROS_ACEPTADOS ?? row.preregistros_aceptados),
        preregistros_rechazados: num(row.PREREGISTROS_RECHAZADOS ?? row.preregistros_rechazados),
        membresias_activas: num(row.MEMBRESIAS_ACTIVAS ?? row.membresias_activas),
        membresias_vencidas: num(row.MEMBRESIAS_VENCIDAS ?? row.membresias_vencidas),
        inventario_bajo_stock: num(row.INVENTARIO_BAJO_STOCK ?? row.inventario_bajo_stock),
        inventario_articulos_activos: num(
          row.INVENTARIO_ARTICULOS_ACTIVOS ?? row.inventario_articulos_activos
        ),
        citas_mes_actual: num(row.CITAS_MES_ACTUAL ?? row.citas_mes_actual),
        servicios_mes_actual: num(row.SERVICIOS_MES_ACTUAL ?? row.servicios_mes_actual),
      };
    } finally {
      if (conn) await conn.close();
    }
  }

  async getFinancieroMes(mes: string): Promise<ReporteFinancieroMes> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();

      const totRes = await conn.execute(
        reportesQueries.financieroMesTotales,
        { mes },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const trow = (totRes.rows?.[0] as Record<string, unknown>) ?? {};
      const totales: FinancieroMesTotales = {
        num_servicios: num(trow.NUM_SERVICIOS ?? trow.num_servicios),
        total_monto_servicio: num(trow.TOTAL_MONTO_SERVICIO ?? trow.total_monto_servicio),
        total_monto_inventario: num(trow.TOTAL_MONTO_INVENTARIO ?? trow.total_monto_inventario),
        total_descuentos: num(trow.TOTAL_DESCUENTOS ?? trow.total_descuentos),
        total_cuota: num(trow.TOTAL_CUOTA ?? trow.total_cuota),
        total_pagado: num(trow.TOTAL_PAGADO ?? trow.total_pagado),
      };

      const mpRes = await conn.execute(
        reportesQueries.financieroMesPorMetodoPago,
        { mes },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const mrows = (mpRes.rows ?? []) as Record<string, unknown>[];
      const por_metodo_pago: FinancieroMesPorMetodo[] = mrows.map((r) => ({
        metodo_pago: String(r.METODO_PAGO ?? r.metodo_pago ?? ""),
        num_recibos: num(r.NUM_RECIBOS ?? r.num_recibos),
        total_cuota: num(r.TOTAL_CUOTA ?? r.total_cuota),
        total_pagado: num(r.TOTAL_PAGADO ?? r.total_pagado),
      }));

      return { totales, por_metodo_pago };
    } finally {
      if (conn) await conn.close();
    }
  }

  async getBeneficiariosPorIngreso(desde: string, hasta: string): Promise<BeneficiarioIngresoRow[]> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        reportesQueries.beneficiariosPorIngreso,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = (result.rows ?? []) as Record<string, unknown>[];
      return rows.map((row) => ({
        id_beneficiario: num(row.ID_BENEFICIARIO ?? row.id_beneficiario),
        folio: String(row.FOLIO ?? row.folio ?? ""),
        nombre_completo: String(row.NOMBRE_COMPLETO ?? row.nombre_completo ?? "").trim(),
        fecha_ingreso: String(row.FECHA_INGRESO ?? row.fecha_ingreso ?? ""),
        estado: String(row.ESTADO ?? row.estado ?? ""),
      }));
    } finally {
      if (conn) await conn.close();
    }
  }

  async getCitasPorPeriodo(desde: string, hasta: string): Promise<CitaPeriodoRow[]> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        reportesQueries.citasPorPeriodo,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = (result.rows ?? []) as Record<string, unknown>[];
      return rows.map((row) => ({
        id_cita: num(row.ID_CITA ?? row.id_cita),
        fecha: String(row.FECHA ?? row.fecha ?? ""),
        hora: String(row.HORA ?? row.hora ?? ""),
        estatus: String(row.ESTATUS ?? row.estatus ?? ""),
        folio: String(row.FOLIO ?? row.folio ?? ""),
        nombre_beneficiario: String(row.NOMBRE_BENEFICIARIO ?? row.nombre_beneficiario ?? "").trim(),
        servicio_nombre: row.SERVICIO_NOMBRE != null ? String(row.SERVICIO_NOMBRE) : null,
        especialista_nombre:
          row.ESPECIALISTA_NOMBRE != null ? String(row.ESPECIALISTA_NOMBRE) : null,
      }));
    } finally {
      if (conn) await conn.close();
    }
  }

  async getAnalytics(desde: string, hasta: string): Promise<ReporteAnalyticsDashboard> {
    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnection();

      const desdeDate = new Date(`${desde}T00:00:00.000Z`);
      const hastaDate = new Date(`${hasta}T00:00:00.000Z`);
      const duracionDias = Math.floor((hastaDate.getTime() - desdeDate.getTime()) / 86400000) + 1;

      const prevHastaDate = addDays(desdeDate, -1);
      const prevDesdeDate = addDays(prevHastaDate, -(duracionDias - 1));
      const prevDesde = formatDateISO(prevDesdeDate);
      const prevHasta = formatDateISO(prevHastaDate);

      const tarjetasRes = await conn.execute(
        reportesQueries.analyticsTarjetas,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const prevTarjetasRes = await conn.execute(
        reportesQueries.analyticsTarjetas,
        { desde: prevDesde, hasta: prevHasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const mesRes = await conn.execute(
        reportesQueries.analyticsPersonasAtendidasPorMes,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const generoRes = await conn.execute(
        reportesQueries.analyticsDistribucionGenero,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const edadRes = await conn.execute(
        reportesQueries.analyticsDistribucionEtapaVida,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const desgloseRes = await conn.execute(
        reportesQueries.analyticsDesgloseServiciosPorMes,
        { desde, hasta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const row = (tarjetasRes.rows?.[0] as Record<string, unknown>) ?? {};
      const prevRow = (prevTarjetasRes.rows?.[0] as Record<string, unknown>) ?? {};

      const totalAtendidos = num(row.TOTAL_ATENDIDOS);
      const nuevosRegistros = num(row.NUEVOS_REGISTROS);
      const serviciosActivos = num(row.SERVICIOS_ACTIVOS);
      const citasPeriodo = num(row.CITAS_PERIODO);
      const serviciosOtorgadosPeriodo = num(row.SERVICIOS_OTORGADOS_PERIODO);
      const cumplimientoPct =
        citasPeriodo > 0 ? round2((serviciosOtorgadosPeriodo / citasPeriodo) * 100) : 0;

      const prevTotalAtendidos = num(prevRow.TOTAL_ATENDIDOS);
      const prevNuevosRegistros = num(prevRow.NUEVOS_REGISTROS);
      const prevServiciosActivos = num(prevRow.SERVICIOS_ACTIVOS);
      const prevCitasPeriodo = num(prevRow.CITAS_PERIODO);
      const prevServiciosOtorgadosPeriodo = num(prevRow.SERVICIOS_OTORGADOS_PERIODO);
      const prevCumplimientoPct =
        prevCitasPeriodo > 0
          ? round2((prevServiciosOtorgadosPeriodo / prevCitasPeriodo) * 100)
          : 0;

      const tarjetas: ReporteTarjetasAnalytics = {
        total_atendidos: totalAtendidos,
        total_atendidos_variacion_pct: variacionPct(totalAtendidos, prevTotalAtendidos),
        total_atendidos_tendencia: getTendencia(totalAtendidos, prevTotalAtendidos),
        nuevos_registros: nuevosRegistros,
        nuevos_registros_variacion_pct: variacionPct(nuevosRegistros, prevNuevosRegistros),
        nuevos_registros_tendencia: getTendencia(nuevosRegistros, prevNuevosRegistros),
        servicios_activos: serviciosActivos,
        servicios_activos_tendencia: getTendencia(serviciosActivos, prevServiciosActivos),
        cumplimiento_pct: cumplimientoPct,
        cumplimiento_variacion_pct: variacionPct(cumplimientoPct, prevCumplimientoPct),
        cumplimiento_tendencia: getTendencia(cumplimientoPct, prevCumplimientoPct),
      };

      const personasRows = (mesRes.rows ?? []) as Record<string, unknown>[];
      const personas_atendidas_por_mes: PersonasAtendidasPorMes[] = personasRows.map((r) => ({
        mes: String(r.MES ?? ""),
        cantidad: num(r.CANTIDAD),
      }));

      const generoRows = (generoRes.rows ?? []) as Record<string, unknown>[];
      const generoMap = new Map<string, number>(
        generoRows.map((r) => [String(r.GENERO ?? "otro"), num(r.CONTEO)])
      );
      const generoTotal = ["femenino", "masculino", "otro"].reduce(
        (acc, key) => acc + (generoMap.get(key) ?? 0),
        0
      );
      const distribucion_genero: DistribucionPorGenero[] = ([
        "femenino",
        "masculino",
        "otro",
      ] as const).map((genero) => {
        const conteo = generoMap.get(genero) ?? 0;
        return {
          genero,
          conteo,
          porcentaje: generoTotal > 0 ? round2((conteo / generoTotal) * 100) : 0,
        };
      });

      const edadRows = (edadRes.rows ?? []) as Record<string, unknown>[];
      const etapaMap = new Map<CodigoEtapaVida, number>(
        edadRows.map((r) => [String(r.CODIGO) as CodigoEtapaVida, num(r.CONTEO)])
      );
      const etapas: Array<{ codigo: CodigoEtapaVida; etiqueta: string }> = [
        { codigo: "infancia_0_12", etiqueta: "Infancia (0-12 años)" },
        { codigo: "adolescencia_13_17", etiqueta: "Adolescencia (13-17 años)" },
        { codigo: "adultez_18_59", etiqueta: "Adultez (18-59 años)" },
        { codigo: "adulto_mayor_60_mas", etiqueta: "Adulto mayor (60+ años)" },
      ];
      const distribucion_etapa_vida: DistribucionEtapaVida[] = etapas.map((etapa) => ({
        codigo: etapa.codigo,
        etiqueta: etapa.etiqueta,
        conteo: etapaMap.get(etapa.codigo) ?? 0,
      }));

      const desgloseRows = (desgloseRes.rows ?? []) as Record<string, unknown>[];
      const desglose_servicios_por_mes: DesgloseServiciosPorMes[] = desgloseRows.map((r) => ({
        mes: String(r.MES ?? ""),
        consultas: num(r.CONSULTAS),
        terapias: num(r.TERAPIAS),
        apoyo_social: num(r.APOYO_SOCIAL),
        estado: "COMPLETADO",
      }));

      return {
        periodo: { desde, hasta },
        tarjetas,
        personas_atendidas_por_mes,
        distribucion_genero,
        distribucion_etapa_vida,
        desglose_servicios_por_mes,
      };
    } finally {
      if (conn) await conn.close();
    }
  }
}

export default ReportesRepository;
