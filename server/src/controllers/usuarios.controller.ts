import { UsuarioRepository } from '../interfaces/usuarioRepository';
import { CreateUsuarioInput, LoginUsuarioInput, Usuario } from '../types/usuarios.types';


export class UsuariosController {
    repository: UsuarioRepository;

    constructor(repository: UsuarioRepository) {
        this.repository = repository;
    }

    async createUsuario(user: CreateUsuarioInput): Promise<Usuario> {
        return this.repository.createUsuario(user);
    }

    async loginUsuario(user: LoginUsuarioInput): Promise<Usuario> {
        return this.repository.loginUsuario(user);
    }
    
}
