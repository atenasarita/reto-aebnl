import type { Genero } from "./beneficiarios.types";

export interface ReportePeriodo {
  desde: string;
  hasta: string;
}

// 1. Reporte Globales 
export interface ReporteAllTimes {
  beneficiarios_activos: number;
  beneficiarios_inactivos: number;
  beneficiarios_por_genero: DistribucionPorGenero[];
  beneficiarios_por_etapa_vida: DistribucionEtapaVida[];
  beneficiarios_por_estado: DistribucionBeneficiariosEstado[];
  beneficiarios_por_tipo_espina: BeneficiariosPorTipoEspina[];
}

// 2. Reporte con rango de fechas
export interface ReporteRangoFechas {
  periodo: ReportePeriodo;
  citas_periodo: number;
  nuevos_beneficiarios: number;
  beneficiarios_atendidos: number;
  servicios_periodo: number;
  beneficiarios_por_genero: DistribucionPorGenero[];
  beneficiarios_por_etapa_vida: DistribucionEtapaVida[];
  beneficiarios_por_estado: DistribucionBeneficiariosEstado[];
  beneficiarios_por_tipo_espina: BeneficiariosPorTipoEspina[];
}

// 3. Reporte mensual: enfocado en servicios y atención por mes
export interface ReporteMensual {
  periodo: ReportePeriodo;
  mes: number;
  anio: number;
  nuevos_beneficiarios: number;
  beneficiarios_atendidos: number;
  servicios_periodo: number;
  servicios_por_dia: ServiciosPorDia[];
  beneficiarios_por_genero: DistribucionPorGenero[];
  beneficiarios_por_etapa_vida: DistribucionEtapaVida[];
  beneficiarios_por_estado: DistribucionBeneficiariosEstado[];
}

export interface ServiciosPorDia {
  fecha: string;
  dia: number;
  conteo: number;
}

export interface DistribucionPorGenero {
  genero: Genero;
  conteo: number;
  porcentaje: number;
}

export type CodigoEtapaVida =
  | "infancia_0_12"
  | "adolescencia_13_17"
  | "adultez_18_59"
  | "adulto_mayor_60_mas";

export interface DistribucionEtapaVida {
  codigo: CodigoEtapaVida;
  etiqueta: string;
  conteo: number;
}

export interface DistribucionBeneficiariosEstado {
  estado: string;
  conteo: number;
  porcentaje: number;
}

export interface BeneficiariosPorTipoEspina {
  id_espina: number;
  nombre: string;
  conteo: number;
}


