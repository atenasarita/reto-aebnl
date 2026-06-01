export type TipoMovimientoFondo = 'abono' | 'egreso';
export type OrigenDonacionTipo = 'marca' | 'familia';

export interface FondoSaldo {
  id_fondo: number;
  saldo: number;
  fecha_actualizacion: string;
}

export interface MovimientoFondoDonacion {
  id_movimiento: number;
  tipo_movimiento: TipoMovimientoFondo;
  monto: number;
  saldo_anterior: number;
  saldo_nuevo: number;
  origen_tipo: OrigenDonacionTipo | null;
  origen_nombre: string | null;
  concepto: string | null;
  id_servicio_otorgado: number | null;
  folio_servicio: number | null;
  servicio_nombre: string | null;
  id_usuario: number | null;
  fecha: string;
  motivo: string | null;
}

export interface RegistrarAbonoInput {
  monto: number;
  origen_tipo: OrigenDonacionTipo;
  origen_nombre: string;
  concepto: string;
  id_usuario: number;
}

export interface RegistrarEgresoInput {
  monto: number;
  id_servicio_otorgado: number;
  id_usuario: number;
  motivo?: string;
}
