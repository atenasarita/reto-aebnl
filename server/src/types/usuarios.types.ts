
export interface Usuario {
    id_usuario: number;
    usuario: string;
    rol: 'administrador' | 'operador';
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
}

export interface Usuarios_seguriadad {
    id_seguridad: number;
    id_usuario: number;
    contrasena_hash: string;
}

export interface CreateUsuarioInput {
    usuario: string;
    rol: 'administrador' | 'operador';
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    contrasena: string;
}

export interface LoginUsuarioInput { 
    usuario: string;
    contrasena: string;
}
