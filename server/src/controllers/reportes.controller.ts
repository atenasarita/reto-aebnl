import {
  ReporteAllTimes,
  ReporteAnual,
  ReporteInventario,
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

  getAnual(anio: number): Promise<ReporteAnual> {
    return this.repository.getAnual(anio);
  }

  getInventario(desde: string, hasta: string): Promise<ReporteInventario> {
    return this.repository.getInventario(desde, hasta);
  }
}

export default ReportesController;
