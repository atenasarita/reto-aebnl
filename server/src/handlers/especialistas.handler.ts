import { Request, Response } from 'express';
import { EspecialistasController } from '../controllers/especialistas.controller';


export class EspecialistasHandler{
    especialistasController: EspecialistasController;
  
    constructor(especialistasController: EspecialistasController) {
      this.especialistasController = especialistasController;
    }

    getEspecialistasByEspecialidad = async (req: Request, res: Response) => {
  try {
    const { id_especialidad } = req.params;

    if (!id_especialidad) {
      return res.status(400).json({
        ok: false,
        message: 'id_especialidad es requerido',
      });
    }

    const data = await this.especialistasController.getEspecialistasByEspecialidad(
      Number(id_especialidad)
    );

    res.status(200).json({
      ok: true,
      data,
    });

  } catch (error) {
    console.error('Error en getEspecialistasByEspecialidad:', error);

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo los especialistas',
    });
  }
};
}