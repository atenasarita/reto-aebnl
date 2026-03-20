import { UsuariosDBService } from '../interfaces/dbService';
import { CreateUsuarioInput, LoginUsuarioInput, Usuario } from '../types/usuarios.types';

export class UsuariosController {
    dbService: UsuariosDBService;

    constructor(dbService: UsuariosDBService) {
        this.dbService = dbService;
    }

    async createUsuario(user: CreateUsuarioInput): Promise<Usuario> {
        return this.dbService.createUsuario(user);
    }

    async loginUsuario(user: LoginUsuarioInput): Promise<Usuario> {
        return this.dbService.loginUsuario(user);
    }
    
}
