import { z } from 'zod';

export const createUsuarioSchema = z.object({
  usuario: z.string().trim().min(1, 'usuario es requerido'),
  rol: z.enum(['administrador', 'operador']),
  nombres: z.string().trim().min(1, 'nombres es requerido'),
  apellido_paterno: z.string().trim().min(1, 'apellido_paterno es requerido'),
  apellido_materno: z.string().trim().min(1, 'apellido_materno es requerido'),
  contrasena: z.string().min(6, 'contrasena debe tener al menos 6 caracteres'),
});

export const loginUsuarioSchema = z.object({
  usuario: z.string().trim().min(1, 'usuario es requerido'),
  contrasena: z.string().min(1, 'contrasena es requerida'),
});
