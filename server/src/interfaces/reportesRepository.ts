import {
  BeneficiarioIngresoRow,
  CitaPeriodoRow,
  ReporteAnalyticsDashboard,
  ReporteFinancieroMes,
  ReporteResumen,
} from "../types/reportes.types";

export interface IReportesRepository {
  getResumen(): Promise<ReporteResumen>;
  getFinancieroMes(mes: string): Promise<ReporteFinancieroMes>;
  getBeneficiariosPorIngreso(desde: string, hasta: string): Promise<BeneficiarioIngresoRow[]>;
  getCitasPorPeriodo(desde: string, hasta: string): Promise<CitaPeriodoRow[]>;
  getAnalytics(desde: string, hasta: string): Promise<ReporteAnalyticsDashboard>;
}
