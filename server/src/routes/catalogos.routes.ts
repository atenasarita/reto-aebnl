import { Router } from "express";
import { getEspecialistas, getCatalogoServicios, searchBeneficiarios } from "../handlers/catalogos.handler";

const router = Router();

// GET /api/especialistas
router.get("/especialistas", getEspecialistas);

// GET /api/catalogo-servicios
router.get("/catalogo-servicios", getCatalogoServicios);

// GET /api/beneficiarios?q=texto  
router.get("/beneficiarios", searchBeneficiarios);

export default router;