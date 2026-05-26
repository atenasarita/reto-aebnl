import { Router } from 'express';
import { InventarioHandler } from '../handlers/inventario.handler';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
    createInventarioSchema,
    registrarMovimientoInventarioApiSchema,
    updateInventarioSchema,
} from '../schemas/inventario.schemas';

const router = Router();
const inventarioHandler = new InventarioHandler();

router.get('/', authenticateJWT, inventarioHandler.getInventario);
router.get('/categorias', authenticateJWT, inventarioHandler.listObjetoCategorias);
router.get('/escasez', authenticateJWT, inventarioHandler.getProductosEscasos);
router.post('/', authenticateJWT, validateBody(createInventarioSchema), inventarioHandler.createInventario);
router.patch(
    '/:id_inventario',
    authenticateJWT,
    validateBody(updateInventarioSchema),
    inventarioHandler.updateInventario,
);
router.delete('/:id_inventario', authenticateJWT, inventarioHandler.deleteInventario);
router.post(
    '/movimientos',
    authenticateJWT,
    validateBody(registrarMovimientoInventarioApiSchema),
    inventarioHandler.registrarMovimientoInventario,
);

export default router;