import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { InventarioHandler } from '../handlers/inventario.handler';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { OracleInventarioRepository } from '../repositories/inventario.repository';
import { createObjeto_categoriaSchema, createInventarioSchema, createVenta_inventarioSchema, createMovimientos_inventarioSchema } from '../schemas/inventario.schemas';

const router = Router();

const inventarioRepository = new OracleInventarioRepository();
const inventarioController = new InventarioController(inventarioRepository);
const inventarioHandler = new InventarioHandler(inventarioController);

router.get('/inventario', authenticateJWT, authorizeRoles('administrador', 'operador'), inventarioHandler.getInventario);


export default router;