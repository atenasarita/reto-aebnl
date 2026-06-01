import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import {
  FondoSaldo,
  MovimientoFondoDonacion,
  RegistrarAbonoInput,
  RegistrarEgresoInput,
} from '../types/fondoDonaciones.types';
import {
  INSERT_MOVIMIENTO_FONDO,
  SELECT_FONDO_FOR_UPDATE,
  SELECT_MOVIMIENTOS_FONDO,
  SELECT_SALDO_FONDO,
  UPDATE_FONDO_SALDO,
} from './fondoDonaciones.queries';

type FondoRow = {
  ID_FONDO: number;
  SALDO: number;
  FECHA_ACTUALIZACION?: string;
};

type MovimientoRow = {
  ID_MOVIMIENTO: number;
  TIPO_MOVIMIENTO: string;
  MONTO: number;
  SALDO_ANTERIOR: number;
  SALDO_NUEVO: number;
  ORIGEN_TIPO: string | null;
  ORIGEN_NOMBRE: string | null;
  CONCEPTO: string | null;
  ID_SERVICIO_OTORGADO: number | null;
  FOLIO_SERVICIO: number | null;
  NOMBRE_SERVICIO: string | null;
  ID_USUARIO: number | null;
  FECHA: string;
  MOTIVO: string | null;
};

function mapMovimiento(row: MovimientoRow): MovimientoFondoDonacion {
  const idServicio = row.ID_SERVICIO_OTORGADO ?? row.FOLIO_SERVICIO;
  const folioServicio = idServicio != null ? Number(idServicio) : null;

  return {
    id_movimiento: row.ID_MOVIMIENTO,
    tipo_movimiento: row.TIPO_MOVIMIENTO.toLowerCase() as MovimientoFondoDonacion['tipo_movimiento'],
    monto: Number(row.MONTO),
    saldo_anterior: Number(row.SALDO_ANTERIOR),
    saldo_nuevo: Number(row.SALDO_NUEVO),
    origen_tipo: (row.ORIGEN_TIPO as MovimientoFondoDonacion['origen_tipo']) ?? null,
    origen_nombre: row.ORIGEN_NOMBRE,
    concepto: row.CONCEPTO,
    id_servicio_otorgado: folioServicio,
    folio_servicio: folioServicio,
    servicio_nombre: row.NOMBRE_SERVICIO,
    id_usuario: row.ID_USUARIO,
    fecha: row.FECHA,
    motivo: row.MOTIVO,
  };
}

export class FondoDonacionesRepository {
  private readonly oracleConnection: OracleConnection;

  constructor(oracleConnection: OracleConnection = new OracleConnection()) {
    this.oracleConnection = oracleConnection;
  }

  /** Bloquea y lee el fondo dentro de una transacción existente. */
  async lockFondo(connection: oracledb.Connection): Promise<{ id_fondo: number; saldo: number }> {
    const result = await connection.execute(
      SELECT_FONDO_FOR_UPDATE,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (result.rows ?? []) as FondoRow[];
    if (!rows.length) {
      throw new Error('Fondo de donaciones no inicializado. Ejecute el script SQL de despliegue.');
    }

    return {
      id_fondo: rows[0].ID_FONDO,
      saldo: Number(rows[0].SALDO),
    };
  }

  /** Registra egreso atómico usando la conexión de la transacción del caller. */
  async registrarEgresoEnTransaccion(
    connection: oracledb.Connection,
    input: RegistrarEgresoInput
  ): Promise<void> {
    if (input.monto <= 0) return;

    const { id_fondo, saldo } = await this.lockFondo(connection);
    const saldoNuevo = saldo - input.monto;

    if (saldoNuevo < 0) {
      throw new Error(
        `Saldo insuficiente en fondo de donaciones. Disponible: ${saldo.toFixed(2)}, solicitado: ${input.monto.toFixed(2)}`
      );
    }

    const folioLabel = `#${input.id_servicio_otorgado}`;
    await connection.execute(INSERT_MOVIMIENTO_FONDO, {
      tipo_movimiento: 'egreso',
      monto: input.monto,
      saldo_anterior: saldo,
      saldo_nuevo: saldoNuevo,
      origen_tipo: null,
      origen_nombre: null,
      concepto: `Folio ${folioLabel}`,
      id_servicio_otorgado: input.id_servicio_otorgado,
      id_usuario: input.id_usuario,
      motivo: input.motivo ?? `Pago de servicio folio ${folioLabel}`,
      id_movimiento: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    });

    await connection.execute(UPDATE_FONDO_SALDO, {
      saldo: saldoNuevo,
      id_fondo,
    });
  }

  async getSaldo(): Promise<FondoSaldo> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();
      const result = await connection.execute(
        SELECT_SALDO_FONDO,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as FondoRow[];
      if (!rows.length) {
        throw new Error('Fondo de donaciones no inicializado.');
      }

      return {
        id_fondo: rows[0].ID_FONDO,
        saldo: Number(rows[0].SALDO),
        fecha_actualizacion: rows[0].FECHA_ACTUALIZACION ?? '',
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async listarMovimientos(limite = 100): Promise<MovimientoFondoDonacion[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();
      const result = await connection.execute(
        SELECT_MOVIMIENTOS_FONDO,
        { limite },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return ((result.rows ?? []) as MovimientoRow[]).map(mapMovimiento);
    } finally {
      if (connection) await connection.close();
    }
  }

  async registrarAbono(input: RegistrarAbonoInput): Promise<MovimientoFondoDonacion> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const { id_fondo, saldo } = await this.lockFondo(connection);
      const saldoNuevo = saldo + input.monto;

      const result = await connection.execute(
        INSERT_MOVIMIENTO_FONDO,
        {
          tipo_movimiento: 'abono',
          monto: input.monto,
          saldo_anterior: saldo,
          saldo_nuevo: saldoNuevo,
          origen_tipo: input.origen_tipo,
          origen_nombre: input.origen_nombre,
          concepto: input.concepto,
          id_servicio_otorgado: null,
          id_usuario: input.id_usuario,
          motivo: 'Abono al fondo de donaciones',
          id_movimiento: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        }
      );

      await connection.execute(UPDATE_FONDO_SALDO, {
        saldo: saldoNuevo,
        id_fondo,
      });

      await connection.commit();

      const outBinds = result.outBinds as { id_movimiento: number[] };
      const idMovimiento = outBinds.id_movimiento[0];

      return {
        id_movimiento: idMovimiento,
        tipo_movimiento: 'abono',
        monto: input.monto,
        saldo_anterior: saldo,
        saldo_nuevo: saldoNuevo,
        origen_tipo: input.origen_tipo,
        origen_nombre: input.origen_nombre,
        concepto: input.concepto,
        id_servicio_otorgado: null,
        folio_servicio: null,
        servicio_nombre: null,
        id_usuario: input.id_usuario,
        fecha: new Date().toISOString(),
        motivo: 'Abono al fondo de donaciones',
      };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
}
