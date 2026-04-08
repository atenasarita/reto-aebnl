import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import { IPreregistroRepository } from "../interfaces/preregistroRepository";
import { CrearPreregistroBody, PreregistroRow } from "../types/preregistros.types";

const oracle = new OracleConnection();

async function getConnection(): Promise<oracledb.Connection> {
  return oracle.getConnection();
}

export class PreregistroRepository implements IPreregistroRepository {
  // Crear nuevo preregistro
  async crear(data: CrearPreregistroBody): Promise<PreregistroRow> {
    const conn = await getConnection();

    try {
      const result = await conn.execute(
        `INSERT INTO PREREGISTRO (
            NOMBRES,
            APELLIDO_PATERNO,
            APELLIDO_MATERNO,
            FECHA_NACIMIENTO,
            GENERO,
            CURP,
            ESTADO
         ) VALUES (
            :nombres,
            :apellido_paterno,
            :apellido_materno,
            TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD'),
            :genero,
            :curp,
            'pendiente'
         ) RETURNING ID_PREREGISTRO INTO :id_preregistro`,
        {
          nombres: data.nombres,
          apellido_paterno: data.apellido_paterno,
          apellido_materno: data.apellido_materno,
          fecha_nacimiento: data.fecha_nacimiento,
          genero: data.genero ?? null,
          curp: data.curp,
          id_preregistro: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      );

      const newId = (result.outBinds as any).id_preregistro[0];

      for (const id of data.espinaBifida) {
        await conn.execute(
          `INSERT INTO PREREGISTRO_ESPINA 
         (ID_PREREGISTRO, ID_ESPINA, OTROS)
         VALUES (:id_preregistro, :id_espina, :otro)`,
          {
            id_preregistro: newId,
            id_espina: id,
            otro: id === 9 ? data.diagnostico_otro : null,
          }
        );
      }
      await conn.commit();

      return this.obtenerPorId(newId) as Promise<PreregistroRow>;

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      await conn.close();
    }
  }

  // Obtener a la persona por ID
  async obtenerPorId(id: number): Promise<PreregistroRow | null> {
    const conn = await getConnection();

    try {
      const result = await conn.execute<PreregistroRow>(
        `SELECT
            ID_PREREGISTRO,
            NOMBRES,
            APELLIDO_PATERNO,
            APELLIDO_MATERNO,
            FECHA_NACIMIENTO,
            GENERO,
            CURP,
            ID_BENEFICIARIO,
            ESTADO
         FROM PREREGISTRO
         WHERE ID_PREREGISTRO = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return (result.rows?.[0] as PreregistroRow) ?? null;

    } finally {
      await conn.close();
    }
  }

  // Listar a todos los preregsistrados
  async listar(): Promise<PreregistroRow[]> {
    const conn = await getConnection();

    try {
      const result = await conn.execute<PreregistroRow>(
        `SELECT
            ID_PREREGISTRO,
            NOMBRES,
            APELLIDO_PATERNO,
            APELLIDO_MATERNO,
            FECHA_NACIMIENTO,
            GENERO,
            CURP,
            ID_BENEFICIARIO,
            ESTADO
         FROM PREREGISTRO
         ORDER BY ID_PREREGISTRO DESC`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return (result.rows ?? []) as PreregistroRow[];

    } finally {
      await conn.close();
    }
  }
}