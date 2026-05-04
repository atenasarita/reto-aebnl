import { Router } from "express";
import { ReportesRepository } from "../repositories/reportes.repository.ts";
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

router.get("/analytics", ...reportesAuth, handler.getAllTimes);
router.get("/analytics/periodo", ...reportesAuth, handler.getRangoFechas);
router.get("/analytics/mensual", ...reportesAuth, handler.getMensual);
router.get("/analytics/anual", ...reportesAuth, handler.getAnual);

export default router;
