import { Request, Response } from 'express';
import { FondoDonacionesController } from '../controllers/fondoDonaciones.controller';

export class FondoDonacionesHandler {
  private readonly controller: FondoDonacionesController;

  constructor(controller: FondoDonacionesController = new FondoDonacionesController()) {
    this.controller = controller;
  }

  getSaldo = async (_req: Request, res: Response) => {
    try {
      const data = await this.controller.getSaldo();
      res.status(200).json({ ok: true, data });
    } catch (error) {
      console.error('Error en getSaldo fondo:', error);
      res.status(500).json({ ok: false, message: 'Error al consultar saldo del fondo' });
    }
  };

  listarMovimientos = async (req: Request, res: Response) => {
    try {
      const limite = Math.min(Number(req.query.limite) || 100, 500);
      const data = await this.controller.listarMovimientos(limite);
      res.status(200).json({ ok: true, data });
    } catch (error) {
      console.error('Error en listarMovimientos fondo:', error);
      res.status(500).json({ ok: false, message: 'Error al listar movimientos del fondo' });
    }
  };

  listarDonadores = async (_req: Request, res: Response) => {
    try {
      const data = await this.controller.listarDonadores();
      res.status(200).json({ ok: true, data });
    } catch (error) {
      console.error('Error en listarDonadores fondo:', error);
      res.status(500).json({ ok: false, message: 'Error al listar donadores' });
    }
  };

  registrarAbono = async (req: Request, res: Response) => {
    try {
      const id_usuario = (req as any).user?.id_usuario;

      if (!id_usuario) {
        return res.status(401).json({ ok: false, message: 'Usuario no autenticado' });
      }

      const data = await this.controller.registrarAbono({
        ...req.body,
        id_usuario,
      });

      return res.status(201).json({ ok: true, data });
    } catch (error: any) {
      const mensaje = error.message ?? '';
      if (mensaje.includes('Ya existe una marca o familia')) {
        return res.status(409).json({ ok: false, message: mensaje });
      }
      console.error('Error en registrarAbono fondo:', error);
      return res.status(500).json({ ok: false, message: 'Error al registrar donación' });
    }
  };

  crearDonador = async (req: Request, res: Response) => {
    try {
      const data = await this.controller.crearDonador(req.body);
      return res.status(201).json({ ok: true, data });
    } catch (error: any) {
      const mensaje = error.message ?? '';
      if (mensaje.includes('Ya existe una marca o familia')) {
        return res.status(409).json({ ok: false, message: mensaje });
      }
      console.error('Error en crearDonador:', error);
      return res.status(500).json({ ok: false, message: 'Error al crear marca o familia' });
    }
  };
}
