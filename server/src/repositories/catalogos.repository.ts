import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import { especialistasQueries } from "./especialistas.queries";

export interface EspecialistaItem {
    id_especialista: number;
    nombre_completo: string;
    especialidad: string | null;
}

export interface CatalogoServicioItem {
    id_catalogo_servicio: number;
    nombre: string;
    categoria: string;
    precio: number;
}

export interface BeneficiarioBusqueda {
    id_beneficiario: number;
    folio: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string | null;
    email: string | null;
}

export class CatalogosRepository {
    constructor(
        private readonly oracleConnection: OracleConnection = new OracleConnection()
    ) { }

    async getEspecialistas(): Promise<EspecialistaItem[]> {
        let connection: oracledb.Connection | undefined;
        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                especialistasQueries.getEspecialistas,
                {},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return ((result.rows ?? []) as Record<string, unknown>[]).map((r) => ({
                id_especialista: Number(r["ID_ESPECIALISTA"]),
                nombre_completo: String(r["NOMBRE_COMPLETO"] ?? ""),
                especialidad: r["ESPECIALIDAD"] ? String(r["ESPECIALIDAD"]) : null,
            }));
        } finally {
            if (connection) await connection.close();
        }
    }

    async getCatalogoServicios(): Promise<CatalogoServicioItem[]> {
        let connection: oracledb.Connection | undefined;
        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                especialistasQueries.getCatalogoServicios,
                {},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return ((result.rows ?? []) as Record<string, unknown>[]).map((r) => ({
                id_catalogo_servicio: Number(r["ID_CATALOGO_SERVICIO"]),
                nombre: String(r["NOMBRE"] ?? ""),
                categoria: String(r["CATEGORIA"] ?? ""),
                precio: Number(r["PRECIO"] ?? 0),
            }));
        } finally {
            if (connection) await connection.close();
        }
    }

    async searchBeneficiarios(q: string): Promise<BeneficiarioBusqueda[]> {
        let connection: oracledb.Connection | undefined;
        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                especialistasQueries.searchBeneficiarios,
                { q },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return ((result.rows ?? []) as Record<string, unknown>[]).map((r) => ({
                id_beneficiario: Number(r["ID_BENEFICIARIO"]),
                folio: String(r["FOLIO"] ?? ""),
                nombres: String(r["NOMBRES"] ?? ""),
                apellido_paterno: String(r["APELLIDO_PATERNO"] ?? ""),
                apellido_materno: String(r["APELLIDO_MATERNO"] ?? ""),
                telefono: r["TELEFONO"] ? String(r["TELEFONO"]) : null,
                email: r["EMAIL"] ? String(r["EMAIL"]) : null,
            }));
        } finally {
            if (connection) await connection.close();
        }
    }
}