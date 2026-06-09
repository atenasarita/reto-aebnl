import { Router } from "express";
import { getEspecialistas, getCatalogoServicios, searchBeneficiarios } from "../handlers/catalogos.handler";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

const staffAuth = [authenticateJWT, authorizeRoles("administrador", "operador")] as const;

// GET /api/especialistas
router.get("/especialistas", ...staffAuth, getEspecialistas);

// GET /api/catalogo-servicios
router.get("/catalogo-servicios", ...staffAuth, getCatalogoServicios);

// GET /api/beneficiarios?q=texto
router.get("/buscar-beneficiarios", ...staffAuth, searchBeneficiarios);

export default router;