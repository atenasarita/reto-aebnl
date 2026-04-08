import { NextFunction, Request, Response } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

export class DashboardHandler {
  constructor(private readonly controller: DashboardController) {}

  getAgendaHoy = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const agenda = await this.controller.getAgendaHoy();
      return res.status(200).json(agenda);
    } catch (error) {
      return next(error);
    }
  };

  getPreregistroPendiente = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const preregistro = await this.controller.getPreregistroPendiente();
      return res.status(200).json(preregistro);
    } catch (error) {
      return next(error);
    }
  };
}
