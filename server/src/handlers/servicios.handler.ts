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

  getFechasUltimosEstudios = async (req: Request, res: Response) => {
    try {
      const id_beneficiario = Number(req.params.id_beneficiario);

      if (!id_beneficiario || Number.isNaN(id_beneficiario)) {
        return res.status(400).json({
          ok: false,
          message: 'ID de beneficiario inválido',
        });
      }

      const data = await this.serviciosController.getFechasUltimosEstudios(id_beneficiario);

      return res.status(200).json({ ok: true, data });

    } catch (error) {
      console.error('Error en getFechasUltimosEstudios:', error);

      return res.status(500).json({
        ok: false,
        message: 'Error obteniendo fechas de últimos estudios',
      });
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

  getHistorial = async (req: Request, res: Response) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 200);
      const page  = Math.max(Number(req.query.page)  || 0, 0);
      const result = await this.serviciosController.getHistorial(limit, page);
      res.status(200).json({ ok: true, ...result });
    } catch (error) {
      console.error('Error en getHistorial:', error);
      res.status(500).json({ ok: false, message: 'Error obteniendo historial de servicios' });
    }
  };

  getCategorias = async (_req: Request, res: Response) => {
    try {
      const data = await this.serviciosController.getCategorias();
      res.status(200).json({ ok: true, data });
    } catch (error) {
      console.error('Error en getCategorias:', error);
      res.status(500).json({ ok: false, message: 'Error obteniendo categorías' });
    }
  };
  
  crearServicioCatalogo = async (req: Request, res: Response) => {
    try {
      const { nombre, categoria, precio } = req.body;
  
      if (!nombre?.trim()) {
        return res.status(400).json({ ok: false, message: 'El nombre es requerido' });
      }
      if (!categoria?.trim()) {
        return res.status(400).json({ ok: false, message: 'La categoría es requerida' });
      }
      if (precio == null || isNaN(Number(precio)) || Number(precio) < 0) {
        return res.status(400).json({ ok: false, message: 'El precio debe ser un número mayor o igual a 0' });
      }
  
      const data = await this.serviciosController.crearServicioCatalogo({
        nombre:    nombre.trim(),
        categoria: categoria.trim(),
        precio:    Number(precio),
      });
  
      return res.status(201).json({ ok: true, data });
    } catch (error) {
      console.error('Error en crearServicioCatalogo:', error);
      return res.status(500).json({ ok: false, message: 'Error al crear servicio en catálogo' });
    }
  };
}