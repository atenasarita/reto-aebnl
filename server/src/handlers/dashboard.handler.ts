import { NextFunction, Request, Response } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

export class DashboardHandler {
  private readonly controller: DashboardController;

  constructor(controller: DashboardController) {
    this.controller = controller;
  }

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

  updatePreregistroEstado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idPreregistro = Number(req.params.id);
      const estado = String(req.body.estado || '').toLowerCase().trim();

      if (!idPreregistro || !estado) {
        return res.status(400).json({ message: 'Datos incompletos' });
      }

      const estadosValidos = ['aceptado', 'rechazado'];

      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }

      const result = await this.controller.updatePreregistroEstado(idPreregistro, estado);

      if (!result.updated) {
        return res.status(404).json({ message: 'Preregistro no encontrado' });
      }

      return res.status(200).json({
        message: 'Estado actualizado correctamente',
      });
    } catch (error) {
      return next(error);
    }
  };
}