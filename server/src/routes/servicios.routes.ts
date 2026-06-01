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
router.get('/registro_servicios/ultimos-estudios/:id_beneficiario', authenticateJWT, authorizeRoles('administrador', 'operador'), serviciosHandler.getFechasUltimosEstudios);

router.post('/registro_servicios', authenticateJWT, authorizeRoles('administrador', 'operador'), serviciosHandler.registrarServicio);
router.get('/servicios/historial', authenticateJWT, authorizeRoles('administrador', 'operador'), serviciosHandler.getHistorial);

// GET  /api/servicios/categorias
router.get('/servicios/categorias', authenticateJWT, authorizeRoles('administrador', 'operador'), serviciosHandler.getCategorias);

// POST /api/servicios/catalogo
router.post('/servicios/catalogo', authenticateJWT, authorizeRoles('administrador', 'operador'), serviciosHandler.crearServicioCatalogo);

export default router;