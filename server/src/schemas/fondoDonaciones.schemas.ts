import { z } from 'zod';
import { UMBRAL_DONACION_REVISION } from '../types/fondoDonaciones.types';

export const origenDonacionTipoSchema = z.enum(['marca', 'familia']);

export const registrarAbonoFondoSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  origen_tipo: origenDonacionTipoSchema,
  origen_nombre: z.string().trim().min(1, 'El nombre del origen es requerido').max(100),
  concepto: z.string().trim().min(1, 'El concepto es requerido').max(500),
});

export const registrarServicioFinanzasSchema = z.object({
  monto_pagado: z.number().nonnegative().optional(),
  monto_donacion: z.number().nonnegative().optional(),
  cuota_total: z.number().nonnegative(),
}).refine(
  (data) => {
    const pagado = data.monto_pagado ?? 0;
    const donacion = data.monto_donacion ?? 0;
    return pagado + donacion <= data.cuota_total + 0.001;
  },
  { message: 'La suma de aportación familiar y donación no puede exceder el total a pagar' }
);

export { UMBRAL_DONACION_REVISION };
