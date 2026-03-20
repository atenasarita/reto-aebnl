import { CreateUsuarioInput, LoginUsuarioInput, Usuario } from '../types/usuarios.types';


export interface UsuariosDBService { 
    createUsuario(usuario: CreateUsuarioInput): Promise<Usuario>;
    loginUsuario(usuario: LoginUsuarioInput): Promise<Usuario>;
}

export interface IDBService extends UsuariosDBService {}
