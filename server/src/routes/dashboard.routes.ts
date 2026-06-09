import { Router } from "express";
import DashboardRepository from "../repositories/dashboard.repository";
import DashboardController from "../controllers/dashboard.controller";
import DashboardHandler from "../handlers/dashboard.handler";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

const staffAuth = [authenticateJWT, authorizeRoles("administrador", "operador")] as const;

const repository = new DashboardRepository();
const controller = new DashboardController(repository);
const handler = new DashboardHandler(controller);

router.get("/dashboard/agenda-hoy", ...staffAuth, handler.getAgendaHoy);
router.get(
  "/dashboard/preregistro-pendientes",
  ...staffAuth,
  handler.getPreregistroPendientes
);
router.patch(
  "/dashboard/preregistro/:id/estado",
  ...staffAuth,
  handler.updatePreregistroEstado
);

export default router;