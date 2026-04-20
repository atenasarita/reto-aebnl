import { Request, Response } from "express";
import DashboardController from "../controllers/dashboard.controller";

export class DashboardHandler {
  constructor(private controller: DashboardController) {}

  getAgendaHoy = async (_req: Request, res: Response) => {
    try {
      const data = await this.controller.getAgendaHoy();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message ?? "Error en servidor" });
    }
  };

  getPreregistroPendientes = async (_req: Request, res: Response) => {
    try {
      const data = await this.controller.getPreregistroPendientes();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message ?? "Error en servidor" });
    }
  };

  updatePreregistroEstado = async (req: Request, res: Response) => {
    try {
      const idPreregistro = Number(req.params.id);
      const { estado } = req.body;

      if (!idPreregistro || Number.isNaN(idPreregistro)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const result = await this.controller.updatePreregistroEstado(
        idPreregistro,
        estado
      );

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message ?? "Error en servidor" });
    }
  };
}

export default DashboardHandler;