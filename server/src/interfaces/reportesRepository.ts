import {
  ReporteAllTimes,
  ReporteRangoFechas,
} from "../types/reportes.types";

export interface IReportesRepository {
  getAllTimes(): Promise<ReporteAllTimes>;
  getRangoFechas(desde: string, hasta: string): Promise<ReporteRangoFechas>;
}
