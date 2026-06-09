import oracledb from "oracledb";
import { OracleConnection } from "../db/oracle";
import {citasQueries} from "./citas.queries";
import { CitasRepository } from "../interfaces/citasRepository";
import { CitaDetalle, CreateCitaInput, EstatusCita } from "../types/citas.types";
import { especialistasQueries } from "./especialistas.queries";
import { ConflictError } from '../errors/appError'; 

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

    private limpiarFecha(fecha: string | Date): string {
        return String(fecha).split("T")[0];
    }

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

    private async verificarEmpalme(
        connection: oracledb.Connection,
        id_especialista: number,
        fecha: string,
        hora: string,
        id_cita?: number | null
        ): Promise<void> {
        const result = await connection.execute(
            citasQueries.checkEmpalme,
            {
            id_especialista,
            fecha,
            hora,
            id_cita: id_cita ?? null,
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const rows = result.rows as Array<{ total: number }>;
        if (rows[0]?.total > 0) {
            throw new ConflictError(
                `El especialista ya tiene una cita programada el ${fecha} a las ${hora}.`
            );
        }
    }

    async createCita(input: CreateCitaInput):Promise<{ message: string }> {
        let connection;

        try {
            connection = await this.oracleConnection.getConnection();

            const fechaLimpia = this.limpiarFecha(input.fecha);
            //Verificar empalme
            await this.verificarEmpalme(connection, input.id_especialista, fechaLimpia, input.hora);

            await connection.execute(
                citasQueries.insertCita,
                {
                    id_beneficiario: input.id_beneficiario,
                    fecha: fechaLimpia,
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
            const fechaLimpia = this.limpiarFecha(input.fecha);
            // Verificar empalme, excluyendo la cita actual
            await this.verificarEmpalme(connection, input.id_especialista, fechaLimpia, input.hora, id_cita);

            const result = await connection.execute(
                especialistasQueries.updateCita,
                {
                    id_cita,
                    fecha: fechaLimpia,
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