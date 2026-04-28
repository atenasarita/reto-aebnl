import { Request, Response } from "express";
import ReportesController from "../controllers/reportes.controller";

function esFechaValida(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

export class ReportesHandler {
  constructor(private readonly controller: ReportesController) {}

  getAllTimes = async (_req: Request, res: Response) => {
    try {
      const data = await this.controller.getAllTimes();
      return res.json(data);
    } catch (err: unknown) {
      console.error("[reportes] all-times:", err);
      return res.status(500).json({ message: "Error al obtener reporte global." });
    }
  };

  getRangoFechas = async (req: Request, res: Response) => {
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
      const data = await this.controller.getRangoFechas(desde, hasta);
      return res.json(data);
    } catch (err: unknown) {
      console.error("[reportes] rango-fechas:", err);
      return res.status(500).json({ message: "Error al obtener reporte por rango de fechas." });
    }
  };

  getMensual = async (req: Request, res: Response) => {
    const mesRaw = Number(req.query.mes);
    const anioRaw = Number(req.query.anio);
    if (!Number.isInteger(mesRaw) || mesRaw < 1 || mesRaw > 12) {
      return res
        .status(400)
        .json({ message: "Parámetro 'mes' inválido. Usa un entero entre 1 y 12." });
    }
    if (!Number.isInteger(anioRaw) || anioRaw < 1900 || anioRaw > 2100) {
      return res
        .status(400)
        .json({ message: "Parámetro 'anio' inválido. Usa un año entre 1900 y 2100." });
    }

    try {
      const data = await this.controller.getMensual(mesRaw, anioRaw);
      return res.json(data);
    } catch (err: unknown) {
      console.error("[reportes] mensual:", err);
      return res.status(500).json({ message: "Error al obtener reporte mensual." });
    }
  };
}

export default ReportesHandler;
