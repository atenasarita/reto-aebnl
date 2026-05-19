import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import { SELECT_ESPECIALISTA_BY_ESPECIALIDAD } from './especialistas.queries';

type EspecialistaRow = {
  ID_ESPECIALISTA: number;
  NOMBRE_COMPLETO: string;
  ESPECIALIDAD: number;
};

export class EspecialistasRepository {
  private readonly oracleConnection: OracleConnection;

  constructor(oracleConnection: OracleConnection = new OracleConnection()) {
    this.oracleConnection = oracleConnection;
  }

  async getEspecialistasByEspecialidad(idEspecialidad: number) {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const result = await connection.execute(
        SELECT_ESPECIALISTA_BY_ESPECIALIDAD,
        { id_especialidad: idEspecialidad },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as EspecialistaRow[];

      return rows.map((row) => ({
        id: row.ID_ESPECIALISTA,
        nombre: row.NOMBRE_COMPLETO,
        especialidad: row.ESPECIALIDAD,
      }));

    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}