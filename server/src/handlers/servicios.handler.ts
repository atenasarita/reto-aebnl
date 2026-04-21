import { Request, Response } from 'express';
import { TiposServicioController } from '../controllers/servicios.controller';
import { TiposServicioRepository } from '../repositories/servicios.repository';

const controller = new TiposServicioController(new TiposServicioRepository());

export const getTiposServicioHandler = async (req: Request, res: Response) => {
  try {
    const data = await controller.getTiposServicio();

    res.status(200).json({
      ok: true,
      data,
    });

  } catch (error) {
    console.error('Error en getTiposServicio:', error);

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo tipos de servicio',
    });
  }
};