import {
  ReporteAllTimes,
  ReporteMensual,
  ReporteRangoFechas,
} from "../types/reportes.types";

export interface IReportesRepository {
  getAllTimes(): Promise<ReporteAllTimes>;
  getRangoFechas(desde: string, hasta: string): Promise<ReporteRangoFechas>;
  getMensual(mes: number, anio: number): Promise<ReporteMensual>;
}
