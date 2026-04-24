import { Router } from "express";
import ReportesRepository from "../repositories/reportes.repository";
import ReportesController from "../controllers/reportes.controller";
import ReportesHandler from "../handlers/reportes.handler";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

const repository = new ReportesRepository();
const controller = new ReportesController(repository);
const handler = new ReportesHandler(controller);

const reportesAuth = [
  authenticateJWT,
  authorizeRoles("administrador", "operador"),
];

router.get("/resumen", ...reportesAuth, handler.getResumen);

router.get("/financiero-mes", ...reportesAuth, handler.getFinancieroMes);

router.get("/beneficiarios-ingreso", ...reportesAuth, handler.getBeneficiariosIngreso);

router.get("/citas-periodo", ...reportesAuth, handler.getCitasPeriodo);
router.get("/analytics", ...reportesAuth, handler.getAnalytics);

export default router;
