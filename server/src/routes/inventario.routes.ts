import { Router } from 'express';
import { InventarioHandler } from '../handlers/inventario.handler';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
    createInventarioSchema,
    registrarMovimientoInventarioApiSchema,
    updateInventarioSchema,
} from '../schemas/inventario.schemas';

const router = Router();
const inventarioHandler = new InventarioHandler();

const staffAuth = [authenticateJWT, authorizeRoles('administrador', 'operador')] as const;

router.get('/', ...staffAuth, inventarioHandler.getInventario);
router.get('/categorias', ...staffAuth, inventarioHandler.listObjetoCategorias);
router.get('/escasez', ...staffAuth, inventarioHandler.getProductosEscasos);
router.post('/', ...staffAuth, validateBody(createInventarioSchema), inventarioHandler.createInventario);
router.patch(
    '/:id_inventario',
    ...staffAuth,
    validateBody(updateInventarioSchema),
    inventarioHandler.updateInventario,
);
router.delete('/:id_inventario', ...staffAuth, inventarioHandler.deleteInventario);
router.post(
    '/movimientos',
    ...staffAuth,
    validateBody(registrarMovimientoInventarioApiSchema),
    inventarioHandler.registrarMovimientoInventario,
);

export default router;