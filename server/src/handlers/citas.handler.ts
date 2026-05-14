import {Request, Response, NextFunction} from 'express';
import { OracleCitasRepository } from '../repositories/citas.repository';

const citasRepository = new OracleCitasRepository();

export const getCitas = async(_req:Request, res:Response, next: NextFunction) => {
    try {
        const citas = await citasRepository.getCitas();
        res.json(citas);
    } catch (error){
        next(error);
    }
};

export const createCita = async(req:Request, res:Response, next: NextFunction) => {
    try {
        const result = await citasRepository.createCita(req.body);
        res.status(201).json(result);
    } catch(error){
        next(error);
    }
};

export const updateCita = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await citasRepository.updateCita(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};