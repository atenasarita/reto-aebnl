import { Router } from 'express';
import { UsuariosController } from '../controllers/usuarios.controller';
import { OracleDBService } from '../services/createUsuario.service';
import { UsuariosHandler } from '../handlers/usuariosHandler';


const router = Router();

const oracleDBService = new OracleDBService();
const usuariosController = new UsuariosController(oracleDBService);
const usuariosHandler = new UsuariosHandler(usuariosController);


router.post('/usuarios', usuariosHandler.createUsuario);
router.post('/usuarios/login', usuariosHandler.loginUsuario);


export default router;
