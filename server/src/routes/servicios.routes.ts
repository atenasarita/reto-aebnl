import { Router } from 'express';
import { getTiposServicioHandler } from '../handlers/servicios.handler';
import { authenticateJWT } from '../middlewares/auth.middleware';


const router = Router();

router.get('/registro_servicios', 
    authenticateJWT,
    getTiposServicioHandler);

export default router;