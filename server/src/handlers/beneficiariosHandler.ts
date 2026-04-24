import { NextFunction, Request, Response } from 'express';
import { BeneficiariosController } from '../controllers/beneficiarios.controller';
import { ValidationError } from '../errors/appError';
import {
  CreateBeneficiarioInput,
  CreateDatosMedicosInput,
  CreateDireccionInput,
  CreateIdentificadoresInput,
} from '../types/beneficiarios.types';
import OracleDB from 'oracledb';

export class BeneficiariosHandler {
  beneficiariosController: BeneficiariosController;

  constructor(beneficiariosController: BeneficiariosController) {
    this.beneficiariosController = beneficiariosController;
  }

  getMembresiasProximas = async (_req: Request, res: Response) => {
    try {
      const data = await this.beneficiariosController.getMembresiasProximas();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        message: 'Error al obtener membresías próximas',
      });
    }
  };

  getBeneficiarios = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const beneficiarios = await this.beneficiariosController.getBeneficiarios();
      return res.status(200).json(beneficiarios);
    } catch (error) {
      return next(error);
    }
  };

  getBeneficiarioById = async (req: Request, res: Response, next: NextFunction) => {
    const id_beneficiario = Number(req.params.id_beneficiario);

    if (!Number.isInteger(id_beneficiario) || id_beneficiario <= 0) {
      return next(new ValidationError('id_beneficiario invalido'));
    }

    try {
      const beneficiario = await this.beneficiariosController.getBeneficiarioById(id_beneficiario);
      return res.status(200).json(beneficiario);
    } catch (error) {
      return next(error);
    }
  };

  getBeneficiarioByFolio = async (req: Request, res: Response, next: NextFunction) => {
    const folio = String(req.params.folio ?? '').trim();

    if (!folio) {
      return next(new ValidationError('folio invalido'));
    }

    try {
      const beneficiario = await this.beneficiariosController.getBeneficiarioByFolio(folio);
      return res.status(200).json(beneficiario);
    } catch (error) {
      return next(error);
    }
  };

  createBeneficiario = async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body as CreateBeneficiarioInput;

    try {
      const beneficiario = await this.beneficiariosController.createBeneficiario(payload);
      return res.status(201).json(beneficiario);
    } catch (error) {
      return next(error);
    }
  };

  createIdentificadores = async (req: Request, res: Response, next: NextFunction) => {
    const id_beneficiario = Number(req.params.id_beneficiario);
    const payload = req.body as CreateIdentificadoresInput;

    if (!Number.isInteger(id_beneficiario) || id_beneficiario <= 0) {
      return next(new ValidationError('id_beneficiario invalido'));
    }

    try {
      const identificadores = await this.beneficiariosController.createIdentificadores(id_beneficiario, payload);
      return res.status(201).json(identificadores);
    } catch (error) {
      return next(error);
    }
  };

  createDatosMedicos = async (req: Request, res: Response, next: NextFunction) => {
    const id_beneficiario = Number(req.params.id_beneficiario);
    const payload = req.body as CreateDatosMedicosInput;

    if (!Number.isInteger(id_beneficiario) || id_beneficiario <= 0) {
      return next(new ValidationError('id_beneficiario invalido'));
    }

    try {
      const datosMedicos = await this.beneficiariosController.createDatosMedicos(id_beneficiario, payload);
      return res.status(201).json(datosMedicos);
    } catch (error) {
      return next(error);
    }
  };

  createDireccion = async (req: Request, res: Response, next: NextFunction) => {
    const id_beneficiario = Number(req.params.id_beneficiario);
    const payload = req.body as CreateDireccionInput;

    if (!Number.isInteger(id_beneficiario) || id_beneficiario <= 0) {
      return next(new ValidationError('id_beneficiario invalido'));
    }

    try {
      const direccion = await this.beneficiariosController.createDireccion(id_beneficiario, payload);
      return res.status(201).json(direccion);
    } catch (error) {
      return next(error);
    }
  };

  getSiguienteFolio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const folio = await this.beneficiariosController.getSiguienteFolio();
      return res.status(200).json({ folio });
    } catch (error) {
      return next(error);
    }
  };

  getPadresByBeneficiarioId = async (req: Request, res: Response, next: NextFunction) => {
    const id_beneficiario = Number(req.params.id_beneficiario);

    if (!Number.isInteger(id_beneficiario) || id_beneficiario <= 0) {
      return next(new ValidationError('id_beneficiario invalido'));
    }

    try {
      const padres = await this.beneficiariosController.getPadresByBeneficiarioId(id_beneficiario);
      return res.status(200).json(padres);
    } catch (error) {
      return next(error);
    }
  };
}