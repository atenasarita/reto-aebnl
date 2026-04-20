import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import { dashboardQueries } from "./dashboard.queries";

type EstadoPreregistro = "pendiente" | "aceptado" | "rechazado";

async function getConnection(): Promise<oracledb.Connection> {
  const oracle = new OracleConnection();
  return oracle.getConnection();
}

export class DashboardRepository {
  async getAgendaHoy() {
    let conn: oracledb.Connection | undefined;

    try {
      conn = await getConnection();

      const result = await conn.execute(
        dashboardQueries.getAgendaHoy,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as any[];

      return rows.map((row) => ({
        id_cita: row.ID_CITA,
        fecha: row.FECHA,
        hora: row.HORA,
        estatus: row.ESTATUS,
        id_beneficiario: row.ID_BENEFICIARIO,
        id_especialista: row.ID_ESPECIALISTA,
        nombre_completo: row.NOMBRE_COMPLETO,
        folio: row.FOLIO,
        especialista_nombre: row.ESPECIALISTA_NOMBRE,
        servicio_nombre: row.SERVICIO_NOMBRE,
        motivo: row.MOTIVO,
        notas: row.NOTAS,
      }));
    } finally {
      if (conn) await conn.close();
    }
  }

  async getPreregistroPendientes() {
    let conn: oracledb.Connection | undefined;

    try {
      conn = await getConnection();

      const result = await conn.execute(
        dashboardQueries.getPreregistroPendientes,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as any[];

      return rows.map((row) => ({
        id_preregistro: row.ID_PREREGISTRO,
        nombres: row.NOMBRES,
        apellido_paterno: row.APELLIDO_PATERNO,
        apellido_materno: row.APELLIDO_MATERNO,
        nombre_completo: row.NOMBRE_COMPLETO,
        curp: row.CURP,
        genero: row.GENERO,
        fecha_nacimiento: row.FECHA_NACIMIENTO,
        estado: row.ESTADO,
        id_beneficiario: row.ID_BENEFICIARIO,
      }));
    } finally {
      if (conn) await conn.close();
    }
  }

  async updatePreregistroEstado(params: {
    id_preregistro: number;
    estado: EstadoPreregistro;
  }) {
    const { id_preregistro, estado } = params;

    let conn: oracledb.Connection | undefined;

    try {
      conn = await getConnection();

      const preRes = await conn.execute(
        dashboardQueries.getPreregistroById,
        { id_preregistro },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const preregistro = (preRes.rows?.[0] as any) ?? null;

      if (!preregistro) {
        throw new Error("Preregistro no encontrado");
      }

      if (estado === "rechazado") {
        await conn.execute(
          dashboardQueries.updatePreregistroEstadoOnly,
          { id_preregistro, estado },
          { autoCommit: true }
        );

        return {
          ok: true,
          estado: "rechazado",
        };
      }

      const folioTemporal = "TMP000000000";

      const insertBeneficiarioResult = await conn.execute(
        dashboardQueries.insertBeneficiario,
        {
          folio: folioTemporal,
          genero: preregistro.GENERO ?? preregistro.genero ?? "otro",
          id_beneficiario: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
        },
        { autoCommit: false }
      );

      const id_beneficiario =
        (insertBeneficiarioResult.outBinds as any)?.id_beneficiario?.[0];

      if (!id_beneficiario) {
        throw new Error("No se pudo crear el beneficiario");
      }

      await conn.execute(
        dashboardQueries.updateBeneficiarioFolio,
        { id_beneficiario },
        { autoCommit: false }
      );

      await conn.execute(
        dashboardQueries.insertIdentificadores,
        {
          id_beneficiario,
          curp: preregistro.CURP ?? preregistro.curp ?? "",
          nombres: preregistro.NOMBRES ?? preregistro.nombres ?? "",
          apellido_paterno:
            preregistro.APELLIDO_PATERNO ?? preregistro.apellido_paterno ?? "",
          apellido_materno:
            preregistro.APELLIDO_MATERNO ?? preregistro.apellido_materno ?? "",
          fecha_nacimiento:
            preregistro.FECHA_NACIMIENTO ?? preregistro.fecha_nacimiento,
          estado_nacimiento:
            preregistro.ESTADO_NACIMIENTO ??
            preregistro.estado_nacimiento ??
            "N/A",
          fotografia: preregistro.FOTOGRAFIA ?? preregistro.fotografia ?? "",
          telefono: preregistro.TELEFONO ?? preregistro.telefono ?? "",
          email: preregistro.EMAIL ?? preregistro.email ?? "",
        },
        { autoCommit: false }
      );

      const espRes = await conn.execute(
        dashboardQueries.getPreregistroEspinas,
        { id_preregistro },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const tipoEspinas: number[] = (espRes.rows ?? [])
        .map((r: any) => Number(r.ID_ESPINA ?? r.id_espina))
        .filter(Boolean);

      for (const id_espina of tipoEspinas) {
        await conn.execute(
          dashboardQueries.insertBeneficiarioEspina,
          { id_beneficiario, id_espina },
          { autoCommit: false }
        );
      }

      await conn.execute(
        dashboardQueries.updatePreregistroAceptado,
        {
          id_preregistro,
          id_beneficiario,
        },
        { autoCommit: false }
      );

      await conn.commit();

      return {
        ok: true,
        estado: "aceptado",
        id_beneficiario,
      };
    } catch (error) {
      try {
        if (conn) await conn.rollback();
      } catch {}

      throw error;
    } finally {
      if (conn) await conn.close();
    }
  }
}

export default DashboardRepository;