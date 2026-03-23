import { CreateUsuarioInput, LoginUsuarioInput, Usuario } from '../types/usuarios.types';

export interface UsuarioRepository {
  createUsuario(input: CreateUsuarioInput): Promise<Usuario>;
  loginUsuario(input: LoginUsuarioInput): Promise<Usuario>;
}
