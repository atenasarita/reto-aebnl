import { Router } from 'express';
import { FondoDonacionesHandler } from '../handlers/fondoDonaciones.handler';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { registrarAbonoFondoSchema } from '../schemas/fondoDonaciones.schemas';

const router = Router();
const handler = new FondoDonacionesHandler();

router.get(
  '/saldo',
  authenticateJWT,
  authorizeRoles('administrador', 'operador'),
  handler.getSaldo
);

router.get(
  '/movimientos',
  authenticateJWT,
  authorizeRoles('administrador', 'operador'),
  handler.listarMovimientos
);

router.post(
  '/abonos',
  authenticateJWT,
  authorizeRoles('administrador', 'operador'),
  validateBody(registrarAbonoFondoSchema),
  handler.registrarAbono
);

export default router;
