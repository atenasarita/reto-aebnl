import { Router } from 'express';
import { EspecialistasHandler } from '../handlers/especialistas.handler';
import { EspecialistasController } from '../controllers/especialistas.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { EspecialistasRepository } from '../repositories/especialistas.repository';

const router = Router();

const especialistasRepository = new EspecialistasRepository();
const especialistasController = new EspecialistasController(especialistasRepository);
const especialistasHandler = new EspecialistasHandler(especialistasController);

router.get(
  '/registro_servicios/especialistas/:id_especialidad', authenticateJWT, authorizeRoles('administrador', 'operador'), especialistasHandler.getEspecialistasByEspecialidad
);

export default router;