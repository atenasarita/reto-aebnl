export interface TokenPayload {
  id_usuario: number;
  usuario: string;
  rol: 'administrador' | 'operador';
  jti?: string;
  exp?: number;
  iat?: number;
}
