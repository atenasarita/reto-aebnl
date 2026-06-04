import { z } from 'zod';

export const origenDonacionTipoSchema = z.enum(['marca', 'familia']);

export const crearDonadorSchema = z.object({
  tipo_origen: origenDonacionTipoSchema,
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100),
});

export const registrarAbonoFondoSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  id_donador: z.number().int().positive('Seleccione una marca o familia'),
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
