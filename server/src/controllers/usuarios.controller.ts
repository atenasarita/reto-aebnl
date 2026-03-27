import { UsuarioRepository } from '../interfaces/usuarioRepository';
import { CreateUsuarioInput, LoginUsuarioInput, LoginResponse, Usuario } from '../types/usuarios.types';
import { createAccessToken } from '../utils/jwt';

export class UsuariosController {
    repository: UsuarioRepository;

    constructor(repository: UsuarioRepository) {
        this.repository = repository;
    }

    async createUsuario(user: CreateUsuarioInput): Promise<Usuario> {
        return this.repository.createUsuario(user);
    }

    async loginUsuario(user: LoginUsuarioInput): Promise<LoginResponse> {
        const usuario = await this.repository.loginUsuario(user);

        const token = createAccessToken({
            id_usuario: usuario.id_usuario,
            usuario: usuario.usuario,
            rol: usuario.rol,
        });

        return { token, usuario };
    }
    
}
