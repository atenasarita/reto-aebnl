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
  servicios_por_dia: ServiciosPorDia[];
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

/** Métricas agregadas por mes dentro de un año calendario (1–12). */
export interface MesMetricasAnual {
  mes: number;
  servicios_otorgados: number;
  nuevos_beneficiarios: number;
}

// 4. Reporte anual: totales del año + series mensuales + demografía del año
export interface ReporteAnual {
  periodo: ReportePeriodo;
  anio: number;
  nuevos_beneficiarios: number;
  beneficiarios_atendidos: number;
  servicios_periodo: number;
  por_mes: MesMetricasAnual[];
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

/** Reporte de inventario por rango de fechas */
export interface InventarioProductoPorCategoria {
  id_categoria: number;
  descripcion: string;
  productos: number;
  unidades: number;
  valor: number;
}

export interface InventarioMovimientosPorDia {
  fecha: string;
  entradas: number;
  salidas: number;
  movimientos: number;
}

export interface InventarioHistorialMovimiento {
  id_movimiento: number;
  fecha: string;
  clave: string;
  nombre: string;
  tipo_movimiento: "entrada" | "salida";
  cantidad: number;
  cant_anterior: number;
  cant_nueva: number;
  motivo: string;
  usuario: string;
}

export interface InventarioProductoBajoStock {
  id_inventario: number;
  clave: string;
  nombre: string;
  cantidad: number;
  unidad_medida: string;
  descripcion_categoria: string;
}

export interface ReporteInventario {
  periodo: ReportePeriodo;
  articulos_activos: number;
  productos_bajo_stock: number;
  valor_inventario: number;
  entradas_unidades: number;
  salidas_unidades: number;
  movimientos_registrados: number;
  productos_por_categoria: InventarioProductoPorCategoria[];
  movimientos_por_dia: InventarioMovimientosPorDia[];
  historial: InventarioHistorialMovimiento[];
  lista_productos_bajo_stock: InventarioProductoBajoStock[];
}


