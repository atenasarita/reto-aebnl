import { Request, Response } from 'express';
import { ServiciosController } from '../controllers/servicios.controller';

export class ServiciosHandler {
  serviciosController: ServiciosController;

  constructor(serviciosController: ServiciosController) {
    this.serviciosController = serviciosController;
  }

  getTiposServicio = async (req: Request, res: Response) => {
    try {
      const data = await this.serviciosController.getTiposServicio();
      res.status(200).json({ ok: true, data });
    } catch (error) {
      console.error('Error en getTiposServicio:', error);
      res.status(500).json({ ok: false, message: 'Error obteniendo tipos de servicio' });
    }
  };

  registrarServicio = async (req: Request, res: Response) => {
    try {
      const id_usuario = (req as any).user?.id_usuario;

      if (!id_usuario) {
        return res.status(401).json({ ok: false, message: 'Usuario no autenticado' });
      }

      const data = await this.serviciosController.registrarServicio({
        ...req.body,
        id_usuario,
      });

      return res.status(201).json({ ok: true, data });

    } catch (error: any) {
      const mensaje = error.message ?? '';

      if (mensaje.includes('Stock insuficiente') || mensaje.includes('no encontrado en inventario')) {
        return res.status(409).json({ ok: false, message: mensaje });
      }

      console.error('Error en registrarServicio:', error);
      return res.status(500).json({ ok: false, message: 'Error al registrar servicio' });
    }
  };
}