import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import {citasQueries} from "./citas.queries";
import { CitasRepository } from "../interfaces/citasRepository";
import { CitaDetalle, CreateCitaInput, EstatusCita } from "../types/citas.types";
import { especialistasQueries } from "./especialistas.queries";

export interface UpdateCitaInput {
    fecha: string;
    hora: string;
    id_especialista: number;
    id_catalogo_servicio: number;
    motivo?: string | null;
    notas?: string | null;
    estatus?: EstatusCita;
}

export class OracleCitasRepository implements CitasRepository {
    constructor(private readonly oracleConnection = new OracleConnection()){}

    async getCitas(): Promise<CitaDetalle[]>{
        let connection;

        try {
            connection = await this.oracleConnection.getConnection();

            const result = await connection.execute(
                citasQueries.getCitas,
                {},
                {outFormat: oracledb.OUT_FORMAT_OBJECT}
            );
            return (result.rows ?? []) as CitaDetalle[];
        } finally {
            if(connection) await connection.close();
        }
    }

    async createCita(input: CreateCitaInput):Promise<{ message: string }> {
        let connection;

        try {
            connection = await this.oracleConnection.getConnection();

            await connection.execute(
                citasQueries.insertCita,
                {
                    id_beneficiario: input.id_beneficiario,
                    fecha: new Date(input.fecha),
                    hora: input.hora,
                    id_especialista: input.id_especialista,
                    id_catalogo_servicio: input.id_catalogo_servicio,
                    motivo: input.motivo ?? null,
                    notas: input.notas ?? null,
                    estatus: input.estatus ?? 'programada' as EstatusCita,
                },
                {autoCommit: true}
            );
            return { message: 'Cita creada correctamente'};
        } finally {
            if(connection) await connection.close();
        }
    }

    async updateCita(id_cita: number, input: UpdateCitaInput): Promise<{ message: string }> {
        let connection;

        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                especialistasQueries.updateCita,
                {
                    id_cita,
                    fecha: new Date(input.fecha),
                    hora: input.hora,
                    id_especialista: input.id_especialista,
                    id_catalogo_servicio: input.id_catalogo_servicio,
                    motivo: input.motivo ?? null,
                    notas: input.notas ?? null,
                    estatus: input.estatus ?? ("programada" as EstatusCita),
                },
                { autoCommit: true }
            );
            if ((result.rowsAffected ?? 0) === 0) {
                throw new Error("Cita no encontrada.");
            }
            return { message: "Cita actualizada correctamente" };
        } finally {
            if (connection)await connection.close();
        }
    }
}