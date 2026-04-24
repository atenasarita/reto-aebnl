import { Request, Response } from "express";
import ReportesController from "../controllers/reportes.controller";

function esFechaValida(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function esMesValido(s: string): boolean {
  return /^\d{4}-\d{2}$/.test(s);
}

export class ReportesHandler {
  constructor(private readonly controller: ReportesController) {}

  getResumen = async (_req: Request, res: Response) => {
    try {
      const data = await this.controller.getResumen();
      return res.json(data);
    } catch (err: unknown) {
      console.error("[reportes] resumen:", err);
      return res.status(500).json({ message: "Error al generar el resumen de reportes." });
    }
  };

  getFinancieroMes = async (req: Request, res: Response) => {
    const mes = req.query.mes as string;
    if (!mes || !esMesValido(mes)) {
      return res.status(400).json({ message: "Parámetro mes requerido con formato YYYY-MM." });
    }
    try {
      const data = await this.controller.getFinancieroMes(mes);
      return res.json({ mes, ...data });
    } catch (err: unknown) {
      console.error("[reportes] financiero-mes:", err);
      return res.status(500).json({ message: "Error al obtener el reporte financiero del mes." });
    }
  };

  getBeneficiariosIngreso = async (req: Request, res: Response) => {
    const desde = req.query.desde as string;
    const hasta = req.query.hasta as string;
    if (!desde || !hasta || !esFechaValida(desde) || !esFechaValida(hasta)) {
      return res
        .status(400)
        .json({ message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD." });
    }
    if (Date.parse(desde) > Date.parse(hasta)) {
      return res.status(400).json({ message: "La fecha desde no puede ser posterior a hasta." });
    }
    try {
      const data = await this.controller.getBeneficiariosPorIngreso(desde, hasta);
      return res.json({ desde, hasta, total: data.length, items: data });
    } catch (err: unknown) {
      console.error("[reportes] beneficiarios-ingreso:", err);
      return res.status(500).json({ message: "Error al obtener beneficiarios por fecha de ingreso." });
    }
  };

  getCitasPeriodo = async (req: Request, res: Response) => {
    const desde = req.query.desde as string;
    const hasta = req.query.hasta as string;
    if (!desde || !hasta || !esFechaValida(desde) || !esFechaValida(hasta)) {
      return res
        .status(400)
        .json({ message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD." });
    }
    if (Date.parse(desde) > Date.parse(hasta)) {
      return res.status(400).json({ message: "La fecha desde no puede ser posterior a hasta." });
    }
    try {
      const data = await this.controller.getCitasPorPeriodo(desde, hasta);
      return res.json({ desde, hasta, total: data.length, items: data });
    } catch (err: unknown) {
      console.error("[reportes] citas-periodo:", err);
      return res.status(500).json({ message: "Error al obtener citas del periodo." });
    }
  };

  getAnalytics = async (req: Request, res: Response) => {
    const desde = req.query.desde as string;
    const hasta = req.query.hasta as string;
    if (!desde || !hasta || !esFechaValida(desde) || !esFechaValida(hasta)) {
      return res
        .status(400)
        .json({ message: "Parámetros desde y hasta requeridos con formato YYYY-MM-DD." });
    }
    if (Date.parse(desde) > Date.parse(hasta)) {
      return res.status(400).json({ message: "La fecha desde no puede ser posterior a hasta." });
    }

    try {
      const data = await this.controller.getAnalytics(desde, hasta);
      return res.json(data);
    } catch (err: unknown) {
      console.error("[reportes] analytics:", err);
      return res.status(500).json({ message: "Error al obtener analytics de reportes." });
    }
  };
}

export default ReportesHandler;
