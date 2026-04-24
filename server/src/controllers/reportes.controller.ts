import {
  BeneficiarioIngresoRow,
  CitaPeriodoRow,
  ReporteAnalyticsDashboard,
  ReporteFinancieroMes,
  ReporteResumen,
} from "../types/reportes.types";
import { IReportesRepository } from "../interfaces/reportesRepository";

export class ReportesController {
  constructor(private readonly repository: IReportesRepository) {}

  getResumen(): Promise<ReporteResumen> {
    return this.repository.getResumen();
  }

  getFinancieroMes(mes: string): Promise<ReporteFinancieroMes> {
    return this.repository.getFinancieroMes(mes);
  }

  getBeneficiariosPorIngreso(desde: string, hasta: string): Promise<BeneficiarioIngresoRow[]> {
    return this.repository.getBeneficiariosPorIngreso(desde, hasta);
  }

  getCitasPorPeriodo(desde: string, hasta: string): Promise<CitaPeriodoRow[]> {
    return this.repository.getCitasPorPeriodo(desde, hasta);
  }

  getAnalytics(desde: string, hasta: string): Promise<ReporteAnalyticsDashboard> {
    return this.repository.getAnalytics(desde, hasta);
  }
}

export default ReportesController;
