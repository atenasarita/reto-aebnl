import {
  ReporteAllTimes,
  ReporteAnual,
  ReporteMensual,
  ReporteRangoFechas,
} from "../types/reportes.types";

export interface IReportesRepository {
  getAllTimes(): Promise<ReporteAllTimes>;
  getRangoFechas(desde: string, hasta: string): Promise<ReporteRangoFechas>;
  getMensual(mes: number, anio: number): Promise<ReporteMensual>;
  getAnual(anio: number): Promise<ReporteAnual>;
}
