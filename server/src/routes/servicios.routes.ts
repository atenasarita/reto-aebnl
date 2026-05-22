import { Router } from 'express';
import { ServiciosHandler } from '../handlers/servicios.handler';
import { ServiciosController } from '../controllers/servicios.controller';  
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { ServicioRepository } from '../repositories/servicios.repository';


const router = Router();
const servicioRepository = new ServicioRepository();
const servicioController = new ServiciosController(servicioRepository);
const serviciosHandler = new ServiciosHandler(servicioController);

router.get('/registro_servicios/tipos', authenticateJWT, authorizeRoles('administrador', 'operador'), serviciosHandler.getTiposServicio);
router.post('/registro_servicios', authenticateJWT, authorizeRoles('administrador', 'operador'), serviciosHandler.registrarServicio);

export default router;