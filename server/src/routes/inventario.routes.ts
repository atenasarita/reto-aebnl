import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { InventarioHandler } from '../handlers/inventario.handler';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { OracleInventarioRepository } from '../repositories/inventario.repository';
import {
    createInventarioSchema,
    registrarMovimientoInventarioApiSchema,
} from '../schemas/inventario.schemas';

const router = Router();

const inventarioRepository = new OracleInventarioRepository();
const inventarioController = new InventarioController(inventarioRepository);
const inventarioHandler = new InventarioHandler(inventarioController);

router.get('/inventario', authenticateJWT, authorizeRoles('administrador', 'operador'), inventarioHandler.getInventario);

router.get('/inventario/categorias', authenticateJWT, authorizeRoles('administrador', 'operador'), inventarioHandler.getCategorias);

router.post('/inventario', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createInventarioSchema), inventarioHandler.postInventario);

router.post('/inventario/movimientos', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(registrarMovimientoInventarioApiSchema), inventarioHandler.postMovimiento);

export default router;