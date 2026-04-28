import {
  ReporteAllTimes,
  ReporteMensual,
  ReporteRangoFechas,
} from "../types/reportes.types";
import { IReportesRepository } from "../interfaces/reportesRepository";

export class ReportesController {
  constructor(private readonly repository: IReportesRepository) {}

  getAllTimes(): Promise<ReporteAllTimes> {
    return this.repository.getAllTimes();
  }

  getRangoFechas(desde: string, hasta: string): Promise<ReporteRangoFechas> {
    return this.repository.getRangoFechas(desde, hasta);
  }

  getMensual(mes: number, anio: number): Promise<ReporteMensual> {
    return this.repository.getMensual(mes, anio);
  }
}

export default ReportesController;
