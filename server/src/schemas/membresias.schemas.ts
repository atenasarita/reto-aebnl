import { z } from 'zod';

const dateOnlySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

export const createMembresiaSchema = z.object({
  meses: z.number().int().positive().max(36),
  precio_mensual: z.number().nonnegative(),
  fecha_inicio: dateOnlySchema.optional(),
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'donacion']),
});

