import { Request, Response } from 'express';
import { ServiciosController } from '../controllers/servicios.controller';


export class ServiciosHandler{
    serviciosController: ServiciosController;
  
    constructor(serviciosController: ServiciosController) {
      this.serviciosController = serviciosController;
    }

    getTiposServicio = async (req: Request, res: Response) => {
      try {
        const data = await this.serviciosController.getTiposServicio();

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
}