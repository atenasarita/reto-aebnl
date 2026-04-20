import { z } from 'zod';

export const inventarioActivoSchema = z.enum(['0', '1']);

export const tipoMovimientoInventarioSchema = z.enum(['entrada', 'salida']);

export const createObjeto_categoriaSchema = z.object({
  descripcion: z.string().trim().nullable(),
});

export const createInventarioSchema = z.object({
  clave: z.string().trim().min(1, 'clave es requerida').max(10),
  nombre: z.string().trim().min(1, 'nombre es requerido').max(20),
  id_categoria: z.number().int().positive(),
  unidad_medida: z.string().trim().min(1, 'unidad_medida es requerida').max(20),
  precio: z.number().nonnegative(),
  cantidad: z.number().int().nonnegative().optional(),
  activo: inventarioActivoSchema.default('1'),
});

export const createVenta_inventarioSchema = z.object({
  id_servicio_otorgado: z.number().int().positive(),
  id_inventario: z.number().int().positive(),
  cantidad: z.number().int().nonnegative(),
  precio_unitario: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const registrarMovimientoInventarioApiSchema = z.object({
  id_inventario: z.number().int().positive(),
  tipo_movimiento: tipoMovimientoInventarioSchema,
  cantidad: z.number().int().positive(),
  motivo: z.string().trim().min(1, 'motivo es requerido').max(20),
  fecha: z.coerce.date().optional(),
  id_servicio_otorgado: z.number().int().positive().nullable().optional(),
});

