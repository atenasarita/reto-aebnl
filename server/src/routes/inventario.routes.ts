import { Router } from 'express';
import { InventarioHandler } from '../handlers/inventario.handler';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const inventarioHandler = new InventarioHandler();

router.get('/', authenticateJWT, inventarioHandler.getInventario);
router.get('/categorias', authenticateJWT, inventarioHandler.listObjetoCategorias);
router.get('/escasez', authenticateJWT, inventarioHandler.getProductosEscasos);
router.post('/', authenticateJWT, inventarioHandler.createInventario);
router.post('/movimientos', authenticateJWT, inventarioHandler.registrarMovimientoInventario);

export default router;