import { Router } from 'express';
import { UsuariosController } from '../controllers/usuarios.controller';
import { OracleUsuarioRepository } from '../repositories/usuario.repository';
import { UsuariosHandler } from '../handlers/usuariosHandler';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createUsuarioSchema, loginUsuarioSchema } from '../schemas/usuarios.schemas';


const router = Router();

const usuarioRepository = new OracleUsuarioRepository();
const usuariosController = new UsuariosController(usuarioRepository);
const usuariosHandler = new UsuariosHandler(usuariosController);


router.post('/usuarios', authenticateJWT, authorizeRoles('administrador'), validateBody(createUsuarioSchema), usuariosHandler.createUsuario);
router.post('/usuarios/login', validateBody(loginUsuarioSchema), usuariosHandler.loginUsuario);


export default router;
