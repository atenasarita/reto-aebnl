export type EstadoMembresia = 'activa' | 'vencida';
export type MetodoPagoMembresia = 'efectivo' | 'tarjeta' | 'donacion';

export interface Membresia {
  id_membresia: number;
  id_beneficiario: number;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoMembresia;
  metodo_pago: MetodoPagoMembresia;
}

export interface CreateMembresiaInput {
  meses: number;
  precio_mensual: number;
  fecha_inicio?: string;
  metodo_pago: MetodoPagoMembresia;
}
