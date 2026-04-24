import type { Genero } from "./beneficiarios.types";

// Reportes operativos (conteos globales / finanzas / listados)

export interface ReporteResumen {
  beneficiarios_activos: number;
  beneficiarios_inactivos: number;
  preregistros_pendientes: number;
  preregistros_aceptados: number;
  preregistros_rechazados: number;
  membresias_activas: number;
  membresias_vencidas: number;
  inventario_bajo_stock: number;
  inventario_articulos_activos: number;
  citas_mes_actual: number;
  servicios_mes_actual: number;
}

export interface FinancieroMesTotales {
  num_servicios: number;
  total_monto_servicio: number;
  total_monto_inventario: number;
  total_descuentos: number;
  total_cuota: number;
  total_pagado: number;
}

export interface FinancieroMesPorMetodo {
  metodo_pago: string;
  num_recibos: number;
  total_cuota: number;
  total_pagado: number;
}

export interface ReporteFinancieroMes {
  totales: FinancieroMesTotales;
  por_metodo_pago: FinancieroMesPorMetodo[];
}

export interface BeneficiarioIngresoRow {
  id_beneficiario: number;
  folio: string;
  nombre_completo: string;
  fecha_ingreso: string;
  estado: string;
}

export interface CitaPeriodoRow {
  id_cita: number;
  fecha: string;
  hora: string;
  estatus: string;
  folio: string;
  nombre_beneficiario: string;
  servicio_nombre: string | null;
  especialista_nombre: string | null;
}

export interface ReporteFinancieroMesQuery {
  mes: string;
}

export interface ReporteRangoFechasQuery {
  desde: string;
  hasta: string;
}

/** Rango seleccionado en el dashboard (filtro global). */
export interface ReportePeriodo {
  desde: string;
  hasta: string;
}

/**
 * Variación respecto al periodo anterior de la misma duración (opcional).
 * Ej. +12 → +12 %.
 */
export type TendenciaMetrica = "sube" | "baja" | "sin_cambios";

/** Tarjetas superiores: total atendidos, nuevos registros, servicios activos, cumplimiento. */
export interface ReporteTarjetasAnalytics {
  /** Total de personas atendidas en el periodo. */
  total_atendidos: number;
  total_atendidos_variacion_pct?: number | null;
  total_atendidos_tendencia?: TendenciaMetrica;

  /** Altas de beneficiarios en el periodo (`fecha_ingreso` en rango). */
  nuevos_registros: number;
  nuevos_registros_variacion_pct?: number | null;
  nuevos_registros_tendencia?: TendenciaMetrica;

  /** Tipos de servicio del catálogo con al menos un otorgamiento en el periodo (o la métrica que defina negocio). */
  servicios_activos: number;
  servicios_activos_tendencia?: TendenciaMetrica;

  /** Porcentaje 0–100 (meta operativa / completados, según negocio). */
  cumplimiento_pct: number;
  cumplimiento_variacion_pct?: number | null;
  cumplimiento_tendencia?: TendenciaMetrica;
}

/** Personas atendidas por mes dentro del periodo. */
export interface PersonasAtendidasPorMes {
  mes: string;
  etiqueta?: string;
  cantidad: number;
}

/** Distribución demográfica por género. */
export interface DistribucionPorGenero {
  genero: Genero;
  conteo: number;
  /** 0–100, suma de todas las filas ≈ 100 salvo redondeo. */
  porcentaje: number;
}

/** Códigos de bucket de edad. */
export type CodigoEtapaVida =
  | "infancia_0_12"
  | "adolescencia_13_17"
  | "adultez_18_59"
  | "adulto_mayor_60_mas";

/** Distribución demográfica por etapa de vida. */
export interface DistribucionEtapaVida {
  codigo: CodigoEtapaVida;
  /** Texto para UI, ej. "Infancia (0-12 años)". */
  etiqueta: string;
  conteo: number;
}

/**
 * Desglose de servicios por mes.
 */
export interface DesgloseServiciosPorMes {
  mes: string;
  etiqueta_mes?: string;
  consultas: number;
  terapias: number;
  apoyo_social: number;
  estado?: string;
}

/** Payload completo del reporte Analytics. */
export interface ReporteAnalyticsDashboard {
  periodo: ReportePeriodo;
  tarjetas: ReporteTarjetasAnalytics;
  personas_atendidas_por_mes: PersonasAtendidasPorMes[];
  distribucion_genero: DistribucionPorGenero[];
  distribucion_etapa_vida: DistribucionEtapaVida[];
  desglose_servicios_por_mes: DesgloseServiciosPorMes[];
}
