import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import {
  CrearDonadorInput,
  DonadorConFondo,
  FondoSaldo,
  MovimientoFondoDonacion,
  OrigenDonacionTipo,
  RegistrarAbonoInput,
  RegistrarEgresoInput,
} from '../types/fondoDonaciones.types';
import {
  INSERT_DONADOR,
  INSERT_FONDO_DONADOR,
  INSERT_MOVIMIENTO_FONDO,
  SELECT_DONADOR_FONDO,
  SELECT_DONADOR_POR_TIPO_NOMBRE,
  SELECT_DONADORES_CON_FONDO,
  SELECT_FONDO_DONADOR_FOR_UPDATE,
  SELECT_MOVIMIENTOS_FONDO,
  SELECT_MOVIMIENTOS_FONDO_POR_DONADOR,
  SELECT_NEXT_ID_DONADOR,
  SELECT_NEXT_ID_FONDO,
  SELECT_SALDO_AGREGADO,
  UPDATE_FONDO_DONADOR_SALDO,
} from './fondoDonaciones.queries';

type SaldoAgregadoRow = {
  SALDO: number;
  FECHA_ACTUALIZACION: string | null;
};

type DonadorRow = {
  ID_DONADOR: number;
  TIPO_ORIGEN: string;
  NOMBRE: string;
  ID_FONDO: number;
  SALDO: number;
  FECHA_ACTUALIZACION: string;
};

type FondoLockRow = {
  ID_FONDO: number;
  ID_DONADOR: number;
  SALDO: number;
  TIPO_ORIGEN: string;
  NOMBRE: string;
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
  ID_DONADOR: number | null;
  ID_FONDO: number | null;
  DONADOR_NOMBRE: string | null;
  DONADOR_TIPO: string | null;
  ID_SERVICIO_OTORGADO: number | null;
  FOLIO_SERVICIO: number | null;
  NOMBRE_SERVICIO: string | null;
  ID_USUARIO: number | null;
  FECHA: string;
  MOTIVO: string | null;
};

function mapDonador(row: DonadorRow): DonadorConFondo {
  return {
    id_donador: row.ID_DONADOR,
    id_fondo: row.ID_FONDO,
    tipo_origen: row.TIPO_ORIGEN as OrigenDonacionTipo,
    nombre: row.NOMBRE,
    saldo: Number(row.SALDO),
    fecha_actualizacion: row.FECHA_ACTUALIZACION ?? '',
  };
}

function mapMovimiento(row: MovimientoRow): MovimientoFondoDonacion {
  const idServicio = row.ID_SERVICIO_OTORGADO ?? row.FOLIO_SERVICIO;
  const folioServicio = idServicio != null ? Number(idServicio) : null;
  const origenTipo = (row.ORIGEN_TIPO ?? row.DONADOR_TIPO) as OrigenDonacionTipo | null;
  const origenNombre = row.ORIGEN_NOMBRE ?? row.DONADOR_NOMBRE;

  return {
    id_movimiento: row.ID_MOVIMIENTO,
    tipo_movimiento: row.TIPO_MOVIMIENTO.toLowerCase() as MovimientoFondoDonacion['tipo_movimiento'],
    monto: Number(row.MONTO),
    saldo_anterior: Number(row.SALDO_ANTERIOR),
    saldo_nuevo: Number(row.SALDO_NUEVO),
    origen_tipo: origenTipo,
    origen_nombre: origenNombre,
    concepto: row.CONCEPTO,
    id_donador: row.ID_DONADOR,
    id_fondo: row.ID_FONDO,
    donador_nombre: row.DONADOR_NOMBRE,
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

  private async lockFondoDonador(
    connection: oracledb.Connection,
    idFondo: number
  ): Promise<FondoLockRow> {
    const result = await connection.execute(
      SELECT_FONDO_DONADOR_FOR_UPDATE,
      { id_fondo: idFondo },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (result.rows ?? []) as FondoLockRow[];
    if (!rows.length) {
      throw new Error('Fondo de donación no encontrado.');
    }

    return rows[0];
  }

  private async obtenerIdDonador(
    connection: oracledb.Connection,
    tipo: OrigenDonacionTipo,
    nombre: string
  ): Promise<number | null> {
    const result = await connection.execute(
      SELECT_DONADOR_POR_TIPO_NOMBRE,
      { tipo_origen: tipo, nombre: nombre.trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (result.rows ?? []) as { ID_DONADOR: number }[];
    return rows.length ? rows[0].ID_DONADOR : null;
  }

  private async nextId(
    connection: oracledb.Connection,
    query: string
  ): Promise<number> {
    const result = await connection.execute(
      query,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const rows = (result.rows ?? []) as { NEXT_ID: number }[];
    return Number(rows[0].NEXT_ID);
  }

  private async crearFondoDonador(
    connection: oracledb.Connection,
    idDonador: number
  ): Promise<number> {
    const idFondo = await this.nextId(connection, SELECT_NEXT_ID_FONDO);
    await connection.execute(INSERT_FONDO_DONADOR, {
      id_fondo: idFondo,
      id_donador: idDonador,
    });
    return idFondo;
  }

  private async crearDonadorConFondo(
    connection: oracledb.Connection,
    tipo: OrigenDonacionTipo,
    nombre: string
  ): Promise<{ id_donador: number; id_fondo: number }> {
    const idDonador = await this.nextId(connection, SELECT_NEXT_ID_DONADOR);

    await connection.execute(INSERT_DONADOR, {
      id_donador: idDonador,
      tipo_origen: tipo,
      nombre: nombre.trim(),
    });

    const idFondo = await this.crearFondoDonador(connection, idDonador);

    return { id_donador: idDonador, id_fondo: idFondo };
  }

  private async obtenerDonadorFondo(
    connection: oracledb.Connection,
    idDonador: number
  ): Promise<DonadorRow> {
    const result = await connection.execute(
      SELECT_DONADOR_FONDO,
      { id_donador: idDonador },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (result.rows ?? []) as DonadorRow[];
    if (!rows.length) {
      throw new Error('Marca o familia no encontrada.');
    }

    return rows[0];
  }

  async crearDonador(input: CrearDonadorInput): Promise<DonadorConFondo> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const existente = await this.obtenerIdDonador(
        connection,
        input.tipo_origen,
        input.nombre
      );

      if (existente) {
        throw new Error('Ya existe una marca o familia con ese nombre.');
      }

      const creado = await this.crearDonadorConFondo(
        connection,
        input.tipo_origen,
        input.nombre
      );

      await connection.commit();

      return {
        id_donador: creado.id_donador,
        id_fondo: creado.id_fondo,
        tipo_origen: input.tipo_origen,
        nombre: input.nombre.trim(),
        saldo: 0,
        fecha_actualizacion: new Date().toISOString(),
      };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  async registrarEgresoEnTransaccion(
    connection: oracledb.Connection,
    input: RegistrarEgresoInput
  ): Promise<void> {
    if (input.monto <= 0) return;

    const fondo = await this.lockFondoDonador(connection, input.id_fondo);
    const saldo = Number(fondo.SALDO);
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
      origen_tipo: fondo.TIPO_ORIGEN,
      origen_nombre: fondo.NOMBRE,
      concepto: `Folio ${folioLabel}`,
      id_servicio_otorgado: input.id_servicio_otorgado,
      id_usuario: input.id_usuario,
      motivo: input.motivo ?? `Pago de servicio folio ${folioLabel}`,
      id_donador: input.id_donador,
      id_fondo: input.id_fondo,
      id_movimiento: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    });

    await connection.execute(UPDATE_FONDO_DONADOR_SALDO, {
      saldo: saldoNuevo,
      id_fondo: input.id_fondo,
    });
  }

  async getSaldo(): Promise<FondoSaldo> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();
      const result = await connection.execute(
        SELECT_SALDO_AGREGADO,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as SaldoAgregadoRow[];

      return {
        saldo: Number(rows[0]?.SALDO ?? 0),
        fecha_actualizacion: rows[0]?.FECHA_ACTUALIZACION ?? '',
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async listarDonadores(): Promise<DonadorConFondo[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();
      const result = await connection.execute(
        SELECT_DONADORES_CON_FONDO,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return ((result.rows ?? []) as DonadorRow[]).map(mapDonador);
    } finally {
      if (connection) await connection.close();
    }
  }

  async listarMovimientos(
    limite = 100,
    idDonador?: number | null
  ): Promise<MovimientoFondoDonacion[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();
      const query =
        idDonador != null && idDonador > 0
          ? SELECT_MOVIMIENTOS_FONDO_POR_DONADOR
          : SELECT_MOVIMIENTOS_FONDO;
      const binds =
        idDonador != null && idDonador > 0
          ? { limite, id_donador: idDonador }
          : { limite };

      const result = await connection.execute(query, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      return ((result.rows ?? []) as MovimientoRow[]).map(mapMovimiento);
    } finally {
      if (connection) await connection.close();
    }
  }

  async registrarAbono(input: RegistrarAbonoInput): Promise<MovimientoFondoDonacion> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const donador = await this.obtenerDonadorFondo(connection, input.id_donador);
      const fondo = await this.lockFondoDonador(connection, donador.ID_FONDO);
      const saldo = Number(fondo.SALDO);
      const saldoNuevo = saldo + input.monto;

      const result = await connection.execute(INSERT_MOVIMIENTO_FONDO, {
        tipo_movimiento: 'abono',
        monto: input.monto,
        saldo_anterior: saldo,
        saldo_nuevo: saldoNuevo,
        origen_tipo: donador.TIPO_ORIGEN,
        origen_nombre: donador.NOMBRE,
        concepto: input.concepto,
        id_servicio_otorgado: null,
        id_usuario: input.id_usuario,
        motivo: 'Abono al fondo de donaciones',
        id_donador: donador.ID_DONADOR,
        id_fondo: donador.ID_FONDO,
        id_movimiento: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      });

      await connection.execute(UPDATE_FONDO_DONADOR_SALDO, {
        saldo: saldoNuevo,
        id_fondo: donador.ID_FONDO,
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
        origen_tipo: donador.TIPO_ORIGEN as OrigenDonacionTipo,
        origen_nombre: donador.NOMBRE,
        concepto: input.concepto,
        id_donador: donador.ID_DONADOR,
        id_fondo: donador.ID_FONDO,
        donador_nombre: donador.NOMBRE,
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
