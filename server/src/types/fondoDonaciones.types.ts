export type TipoMovimientoFondo = 'abono' | 'egreso';
export type OrigenDonacionTipo = 'marca' | 'familia';

export interface FondoSaldo {
  saldo: number;
  fecha_actualizacion: string;
}

export interface DonadorConFondo {
  id_donador: number;
  id_fondo: number;
  tipo_origen: OrigenDonacionTipo;
  nombre: string;
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
  id_donador: number | null;
  id_fondo: number | null;
  donador_nombre: string | null;
  id_servicio_otorgado: number | null;
  folio_servicio: number | null;
  servicio_nombre: string | null;
  id_usuario: number | null;
  fecha: string;
  motivo: string | null;
}

export interface RegistrarAbonoInput {
  monto: number;
  id_donador: number;
  concepto: string;
  id_usuario: number;
}

export interface CrearDonadorInput {
  tipo_origen: OrigenDonacionTipo;
  nombre: string;
}

export interface RegistrarEgresoInput {
  monto: number;
  id_fondo: number;
  id_donador: number;
  id_servicio_otorgado: number;
  id_usuario: number;
  motivo?: string;
}
