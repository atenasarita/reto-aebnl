import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import { SELECT_TIPOS_SERVICIO } from './servicios.queries';

type TipoServicioRow = {
  ID_CATALOGO_SERVICIO: number;
  NOMBRE: string;
  CATEGORIA: string;
  PRECIO: number;
};

export class ServicioRepository {
  private readonly oracleConnection: OracleConnection;

  constructor(oracleConnection: OracleConnection = new OracleConnection()) {
    this.oracleConnection = oracleConnection;
  }

  async getTiposServicio() {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const result = await connection.execute(
        SELECT_TIPOS_SERVICIO,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as TipoServicioRow[];

      return rows.map((row) => ({
        id: row.ID_CATALOGO_SERVICIO,
        nombre: row.NOMBRE,
        categoria: row.CATEGORIA,
        precio: row.PRECIO,
      }));

    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}