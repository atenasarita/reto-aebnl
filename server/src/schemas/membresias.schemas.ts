import { z } from 'zod';

export const createMembresiaSchema = z.object({
  meses: z.number().int().positive().max(36),
  precio_mensual: z.number().positive(),
  fecha_inicio: z.coerce.date().optional(),
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'donacion']),
});
