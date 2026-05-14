import { Request, Response, NextFunction } from "express";
import { CatalogosRepository } from "../repositories/catalogos.repository";
import { OracleCitasRepository } from "../repositories/citas.repository";

const catalogosRepo = new CatalogosRepository();
const citasRepo     = new OracleCitasRepository();

// GET /api/especialistas 
export const getEspecialistas = async (
  _req: Request, res: Response, next: NextFunction
) => {
  try {
    const data = await catalogosRepo.getEspecialistas();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// GET /api/catalogo-servicios 
export const getCatalogoServicios = async (
  _req: Request, res: Response, next: NextFunction
) => {
  try {
    const data = await catalogosRepo.getCatalogoServicios();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// GET /api/beneficiarios?q=texto 
export const searchBeneficiarios = async (
  req: Request, res: Response, next: NextFunction
) => {
  const q = (req.query.q as string ?? "").trim();
  if (!q || q.length < 2) {
    res.json([]);
    return;
  }
  try {
    const data = await catalogosRepo.searchBeneficiarios(q);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// PUT /api/citas/:id
export const updateCita = async (
  req: Request, res: Response, next: NextFunction
) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID de cita inválido." });
    return;
  }
  try {
    const result = await citasRepo.updateCita(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};