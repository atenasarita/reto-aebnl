import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardHandler } from '../handlers/dashboard.handler';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

const repository = new DashboardRepository();
const controller = new DashboardController(repository);
const handler = new DashboardHandler(controller);

router.get(
  '/dashboard/agenda-hoy',
  authenticateJWT,
  handler.getAgendaHoy
);

router.get(
  '/dashboard/preregistro-pendientes',
  authenticateJWT,
  handler.getPreregistroPendiente
);

router.patch(
  '/dashboard/preregistro/:id/estado',
  authenticateJWT,
  handler.updatePreregistroEstado
);

export default router;