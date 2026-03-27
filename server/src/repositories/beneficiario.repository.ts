import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import { NotFoundError } from "../errors/appError";
import { BeneficiarioRepository } from "../interfaces/beneficiarioRepository";
import { BeneficiarioDetalle } from "../types/beneficiarios.types";

export class OracleBeneficiarioRepository implements BeneficiarioRepository {
  private readonly oracleConnection: OracleConnection;

  constructor(oracleConnection: OracleConnection = new OracleConnection()) {
    this.oracleConnection = oracleConnection;
  }

  async getBeneficiarioByFolio(folio: string): Promise<BeneficiarioDetalle> {
    let connection: oracledb.Connection | undefined;

    try {
      console.log("Entrando a getBeneficiarioByFolio con folio:", folio);

      connection = await this.oracleConnection.getConnection();
      console.log("Conexion Oracle exitosa");

      const sql = `
        SELECT
          b.id_beneficiario,
          b.folio,
          TO_CHAR(b.fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso,
          b.genero,
          b.estado,
          eb.id_espina,
          eb.nombre AS tipo_espina_nombre,

          i.curp,
          i.nombres,
          i.apellido_paterno,
          i.apellido_materno,
          TO_CHAR(i.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
          i.estado_nacimiento,
          i.fotografia,
          i.telefono,
          i.email,

          dm.contacto_nombre,
          dm.contacto_telefono,
          dm.contacto_parentesco,
          dm.alergias,
          dm.tipo_sanguineo,

          d.domicilio_calle,
          d.domicilio_cp,
          d.domicilio_ciudad,
          d.domicilio_estado

        FROM Beneficiario b
        LEFT JOIN Espina_bidifa eb
          ON b.tipo_espina = eb.id_espina
        LEFT JOIN Identificadores i
          ON b.id_beneficiario = i.id_beneficiario
        LEFT JOIN Datos_medicos dm
          ON b.id_beneficiario = dm.id_beneficiario
        LEFT JOIN direccion d
          ON b.id_beneficiario = d.id_beneficiario
        WHERE b.folio = :folio
      `;

      console.log("Ejecutando query...");

      const result = await connection.execute(
        sql,
        { folio },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      console.log("Resultado SQL:", result.rows);

      const row = result.rows?.[0] as
        | {
            ID_BENEFICIARIO: number;
            FOLIO: string;
            FECHA_INGRESO: string;
            GENERO: "masculino" | "femenino" | "otro" | null;
            ESTADO: "activo" | "inactivo";
            ID_ESPINA: number | null;
            TIPO_ESPINA_NOMBRE: string | null;

            CURP: string | null;
            NOMBRES: string | null;
            APELLIDO_PATERNO: string | null;
            APELLIDO_MATERNO: string | null;
            FECHA_NACIMIENTO: string | null;
            ESTADO_NACIMIENTO: string | null;
            FOTOGRAFIA: string | null;
            TELEFONO: string | null;
            EMAIL: string | null;

            CONTACTO_NOMBRE: string | null;
            CONTACTO_TELEFONO: string | null;
            CONTACTO_PARENTESCO: string | null;
            ALERGIAS: string | null;
            TIPO_SANGUINEO: string | null;

            DOMICILIO_CALLE: string | null;
            DOMICILIO_CP: string | null;
            DOMICILIO_CIUDAD: string | null;
            DOMICILIO_ESTADO: string | null;
          }
        | undefined;

      if (!row) {
        throw new NotFoundError("Beneficiario no encontrado.");
      }

      return {
        id_beneficiario: row.ID_BENEFICIARIO,
        folio: row.FOLIO,
        fecha_ingreso: row.FECHA_INGRESO,
        genero: row.GENERO,
        estado: row.ESTADO,
        tipo_espina: {
          id_espina: row.ID_ESPINA,
          nombre: row.TIPO_ESPINA_NOMBRE,
        },
        identificadores: {
          curp: row.CURP,
          nombres: row.NOMBRES,
          apellido_paterno: row.APELLIDO_PATERNO,
          apellido_materno: row.APELLIDO_MATERNO,
          fecha_nacimiento: row.FECHA_NACIMIENTO,
          estado_nacimiento: row.ESTADO_NACIMIENTO,
          fotografia: row.FOTOGRAFIA,
          telefono: row.TELEFONO,
          email: row.EMAIL,
        },
        datos_medicos: {
          contacto_nombre: row.CONTACTO_NOMBRE,
          contacto_telefono: row.CONTACTO_TELEFONO,
          contacto_parentesco: row.CONTACTO_PARENTESCO,
          alergias: row.ALERGIAS,
          tipo_sanguineo: row.TIPO_SANGUINEO,
        },
        direccion: {
          domicilio_calle: row.DOMICILIO_CALLE,
          domicilio_cp: row.DOMICILIO_CP,
          domicilio_ciudad: row.DOMICILIO_CIUDAD,
          domicilio_estado: row.DOMICILIO_ESTADO,
        },
      };
    } catch (error) {
      console.error("Error real en getBeneficiarioByFolio:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}