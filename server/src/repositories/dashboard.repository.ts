import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import {
  SELECT_AGENDA_HOY,
  SELECT_PREREGISTRO_PENDIENTE,
  UPDATE_PREREGISTRO_ESTADO,
} from './dashboard.queries';

type AgendaRow = {
  ID_CITA: number;
  FECHA: string;
  HORA: string | null;
  ESTATUS: string | null;
  MOTIVO: string | null;
  NOTAS: string | null;
  ID_BENEFICIARIO: number;
  ID_ESPECIALISTA: number | null;
  FOLIO: string | null;
  NOMBRES: string | null;
  APELLIDO_PATERNO: string | null;
  APELLIDO_MATERNO: string | null;
  FOTOGRAFIA: string | null;
  ESPECIALISTA_NOMBRE: string | null;
  SERVICIO_NOMBRE: string | null;
};

type PreregistroRow = {
  ID_PREREGISTRO: number;
  NOMBRES: string | null;
  APELLIDO_PATERNO: string | null;
  APELLIDO_MATERNO: string | null;
  FECHA_NACIMIENTO: string | null;
  GENERO: string | null;
  CURP: string | null;
  ESTADO: string | null;
  ID_BENEFICIARIO: number | null;
};

export class DashboardRepository {
  private readonly oracleConnection: OracleConnection;

  constructor(oracleConnection: OracleConnection = new OracleConnection()) {
    this.oracleConnection = oracleConnection;
  }

  async getAgendaHoy() {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const result = await connection.execute(SELECT_AGENDA_HOY, {}, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      const rows = (result.rows ?? []) as AgendaRow[];

      return rows.map((row) => ({
        id_cita: row.ID_CITA,
        fecha: row.FECHA,
        hora: row.HORA ?? '',
        estatus: row.ESTATUS ?? '',
        motivo: row.MOTIVO ?? '',
        notas: row.NOTAS ?? '',
        id_beneficiario: row.ID_BENEFICIARIO,
        id_especialista: row.ID_ESPECIALISTA,
        folio: row.FOLIO ?? '',
        nombre_completo: [
          row.NOMBRES ?? '',
          row.APELLIDO_PATERNO ?? '',
          row.APELLIDO_MATERNO ?? '',
        ]
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
        fotografia: row.FOTOGRAFIA ?? '',
        especialista_nombre: row.ESPECIALISTA_NOMBRE ?? '',
        servicio_nombre: row.SERVICIO_NOMBRE ?? '',
      }));
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getPreregistroPendiente() {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const result = await connection.execute(SELECT_PREREGISTRO_PENDIENTE, {}, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      const rows = (result.rows ?? []) as PreregistroRow[];

      return rows.map((row) => ({
        id_preregistro: row.ID_PREREGISTRO,
        nombre_completo: [
          row.NOMBRES ?? '',
          row.APELLIDO_PATERNO ?? '',
          row.APELLIDO_MATERNO ?? '',
        ]
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
        fecha_nacimiento: row.FECHA_NACIMIENTO ?? '',
        genero: row.GENERO ?? '',
        curp: row.CURP ?? '',
        estado: row.ESTADO ?? '',
        id_beneficiario: row.ID_BENEFICIARIO,
      }));
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async updatePreregistroEstado(idPreregistro: number, estado: string) {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const result = await connection.execute(
        UPDATE_PREREGISTRO_ESTADO,
        {
          estado,
          id_preregistro: idPreregistro,
        },
        {
          autoCommit: true,
        }
      );

      return {
        updated: (result.rowsAffected ?? 0) > 0,
      };
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}