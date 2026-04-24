import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import { ConflictError, NotFoundError } from '../errors/appError';
import { BeneficiarioRepository } from '../interfaces/beneficiarioRepository';
import { addDays, addMonthsKeepingCalendar, startOfDay } from '../utils/date.utils';
import { generateNextBeneficiarioFolio } from '../utils/beneficiarioFolio';
import { getOutBindNumber } from '../utils/oracle.utils';
import {
    INSERT_BENEFICIARIO,
    INSERT_BENEFICIARIO_ESPINA,
    INSERT_DATOS_MEDICOS_RETURNING,
    INSERT_DIRECCION_RETURNING,
    INSERT_IDENTIFICADORES_RETURNING,
    INSERT_MEMBRESIA,
    INSERT_PADRE,
    SELECT_BENEFICIARIO_BY_FOLIO,
    SELECT_BENEFICIARIO_BY_ID,
    SELECT_BENEFICIARIOS,
    SELECT_BENEFICIARIOS_WITH_MEMBRESIAS_ENDING_SOON,
    UPDATE_BENEFICIARIO_ESTADO,
    UPDATE_MEMBRESIA_ESTADO,
    UPDATE_BENEFICIARIO_ESTADO_EXPIRED_MEMBRESIAS,
    selectTipoEspinasByBeneficiarioIds,
    SELECT_PADRES_BY_BENEFICIARIO_ID
} from './beneficiario.queries';
import {
    BeneficiarioDetalle,
    BeneficiarioConMembresiaProxVencer,
    CreateBeneficiarioInput,
    CreateDireccionInput,
    CreateIdentificadoresInput,
    CreateDatosMedicosInput,
    Identificadores,
    Datos_medicos,
    Direccion,
    Beneficiario,
    Padre
} from '../types/beneficiarios.types';
import { CreateMembresiaInput } from '../types/membresias.types';

type BeneficiarioDetalleRow = {
    ID_BENEFICIARIO: number;
    FOLIO: string;
    FECHA_INGRESO: string;
    GENERO: 'masculino' | 'femenino' | 'otro' | null;
    ESTADO: 'activo' | 'inactivo';
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
    VALVULA: number | null;
    HOSPITAL: string | null;
    DOMICILIO_CALLE: string | null;
    DOMICILIO_CP: string | null;
    DOMICILIO_CIUDAD: string | null;
    DOMICILIO_ESTADO: string | null;
    DIAS_PARA_VENCER: number | null;
    ID_MEMBRESIA: number | null;
    PRECIO: number | null;
    FECHA_INICIO: string | null;
    FECHA_FIN: string | null;
    MEMBRESIA_ESTADO: string | null;
    METODO_PAGO: string | null;
};

type BeneficiarioConMembresiaRow = BeneficiarioDetalleRow & {
    ID_MEMBRESIA: number;
    MEMBRESIA_PRECIO: number;
    MEMBRESIA_FECHA_INICIO: string;
    MEMBRESIA_FECHA_FIN: string;
    MEMBRESIA_ESTADO: string;
    MEMBRESIA_METODO_PAGO: string;
};

function mapOracleConflictError(error: unknown, fallbackMessage: string): never {
    const err = error as { code?: string };
    if (err?.code === 'ORA-00001') {
        throw new ConflictError(fallbackMessage);
    }

    throw error;
}

export class OracleBeneficiarioRepository implements BeneficiarioRepository {
    private readonly oracleConnection: OracleConnection;
    private static readonly BLOOD_TYPES: ReadonlyArray<Datos_medicos['tipo_sanguineo']> = [
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
    ];

    constructor(oracleConnection: OracleConnection = new OracleConnection()) {
        this.oracleConnection = oracleConnection;
    }

    private toRequiredString(value: string | null): string {
        return value ?? '';
    }

    private toRequiredDate(value: string | null): Date {
        return value ? new Date(value) : new Date(0);
    }

    private toBloodType(value: string | null): Datos_medicos['tipo_sanguineo'] {
        if (value && OracleBeneficiarioRepository.BLOOD_TYPES.includes(value as Datos_medicos['tipo_sanguineo'])) {
            return value as Datos_medicos['tipo_sanguineo'];
        }

        return 'O+';
    }

    private mapBeneficiarioDetalleRow(row: BeneficiarioDetalleRow): BeneficiarioDetalle {
        const nombres = this.toRequiredString(row.NOMBRES);
        const apellidoPaterno = this.toRequiredString(row.APELLIDO_PATERNO);
        const apellidoMaterno = this.toRequiredString(row.APELLIDO_MATERNO);
        const fechaNacimiento = this.toRequiredDate(row.FECHA_NACIMIENTO);
        const estadoNacimiento = this.toRequiredString(row.ESTADO_NACIMIENTO);
        const fotografia = this.toRequiredString(row.FOTOGRAFIA);
        const telefono = this.toRequiredString(row.TELEFONO);
        const email = this.toRequiredString(row.EMAIL);
        const contactoNombre = this.toRequiredString(row.CONTACTO_NOMBRE);
        const contactoTelefono = this.toRequiredString(row.CONTACTO_TELEFONO);
        const contactoParentesco = this.toRequiredString(row.CONTACTO_PARENTESCO);
        const alergias = this.toRequiredString(row.ALERGIAS);
        const tipoSanguineo = this.toBloodType(row.TIPO_SANGUINEO);
        const valvula = row.VALVULA === 1;
        const hospital = this.toRequiredString(row.HOSPITAL);
        const domicilioCalle = this.toRequiredString(row.DOMICILIO_CALLE);
        const domicilioCp = this.toRequiredString(row.DOMICILIO_CP);
        const domicilioCiudad = this.toRequiredString(row.DOMICILIO_CIUDAD);
        const domicilioEstado = this.toRequiredString(row.DOMICILIO_ESTADO);

        return {
            id_beneficiario: row.ID_BENEFICIARIO,
            folio: row.FOLIO,
            fecha_ingreso: row.FECHA_INGRESO,
            genero: row.GENERO ?? 'otro',
            estado: row.ESTADO,
            tipo_espina: [],
            identificadores: {
                id_identificadores: 0,
                id_beneficiario: row.ID_BENEFICIARIO,
                CURP: this.toRequiredString(row.CURP),
                nombres,
                apellido_paterno: apellidoPaterno,
                apellido_materno: apellidoMaterno,
                fecha_nacimiento: fechaNacimiento,
                estado_nacimiento: estadoNacimiento,
                fotografia,
                telefono,
                email,
            },
            datos_medicos: {
                id_datos_medicos: 0,
                id_beneficiario: row.ID_BENEFICIARIO,
                contacto_nombre: contactoNombre,
                contacto_telefono: contactoTelefono,
                contacto_parentesco: contactoParentesco,
                alergias,
                tipo_sanguineo: tipoSanguineo,
                valvula: valvula,
                hospital: hospital,
            },
            direccion: {
                id_direccion: 0,
                id_beneficiario: row.ID_BENEFICIARIO,
                domicilio_calle: domicilioCalle,
                domicilio_cp: domicilioCp,
                domicilio_ciudad: domicilioCiudad,
                domicilio_estado: domicilioEstado,
            },
            dias_para_vencer: row.DIAS_PARA_VENCER,
            membresia: row.ID_MEMBRESIA ? {
                id_membresia: row.ID_MEMBRESIA,
                precio: row.PRECIO!,
                fecha_inicio: row.FECHA_INICIO!,
                fecha_fin: row.FECHA_FIN!,
                estado: row.MEMBRESIA_ESTADO!,
                metodo_pago: row.METODO_PAGO!,
            } : null,
        };
    }

    private async getTipoEspinasByBeneficiarioIds(
        connection: oracledb.Connection,
        ids: number[],
    ): Promise<Map<number, BeneficiarioDetalle['tipo_espina']>> {
        const espinasByBeneficiario = new Map<number, BeneficiarioDetalle['tipo_espina']>();

        if (ids.length === 0) {
            return espinasByBeneficiario;
        }

        const placeholders = ids.map((_, index) => `:id${index}`).join(', ');
        const binds = ids.reduce<Record<string, number>>((acc, id, index) => {
            acc[`id${index}`] = id;
            return acc;
        }, {});

        const result = await connection.execute(
            selectTipoEspinasByBeneficiarioIds(placeholders),
            binds,
            { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );

        const rows = (result.rows ?? []) as Array<{
            ID_BENEFICIARIO: number;
            ID_ESPINA: number;
            NOMBRE: string;
        }>;

        for (const row of rows) {
            const espinas = espinasByBeneficiario.get(row.ID_BENEFICIARIO) ?? [];
            espinas.push({ id_espina: row.ID_ESPINA, nombre: row.NOMBRE });
            espinasByBeneficiario.set(row.ID_BENEFICIARIO, espinas);
        }

        return espinasByBeneficiario;
    }

    private async queryBeneficiarioDetalleRows(
        connection: oracledb.Connection,
        sql: string,
        binds: Record<string, string | number> = {},
    ): Promise<BeneficiarioDetalleRow[]> {
        const result = await connection.execute(
            sql,
            binds,
            { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );

        return (result.rows ?? []) as BeneficiarioDetalleRow[];
    }

    private async hydrateBeneficiariosWithEspinas(
        connection: oracledb.Connection,
        rows: BeneficiarioDetalleRow[],
    ): Promise<BeneficiarioDetalle[]> {
        const beneficiarios = rows.map((row) => this.mapBeneficiarioDetalleRow(row));
        const espinasByBeneficiario = await this.getTipoEspinasByBeneficiarioIds(
            connection,
            beneficiarios.map((item) => item.id_beneficiario),
        );

        return beneficiarios.map((item) => ({
            ...item,
            tipo_espina: espinasByBeneficiario.get(item.id_beneficiario) ?? [],
        }));
    }

    async getBeneficiarios(): Promise<BeneficiarioDetalle[]> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            await this.refreshExpiredMembresiasWithConnection(connection);
            const rows = await this.queryBeneficiarioDetalleRows(connection, SELECT_BENEFICIARIOS);
            return this.hydrateBeneficiariosWithEspinas(connection, rows);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getBeneficiarioById(id_beneficiario: number): Promise<BeneficiarioDetalle> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            await this.refreshExpiredMembresiasWithConnection(connection);

            const rows = await this.queryBeneficiarioDetalleRows(
                connection,
                SELECT_BENEFICIARIO_BY_ID,
                { id_beneficiario },
            );

            if (rows.length === 0) {
                throw new NotFoundError('Beneficiario no encontrado.');
            }

            const beneficiarios = await this.hydrateBeneficiariosWithEspinas(connection, rows);
            return beneficiarios[0];
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getBeneficiarioByFolio(folio: string): Promise<BeneficiarioDetalle> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            await this.refreshExpiredMembresiasWithConnection(connection);

            const rows = await this.queryBeneficiarioDetalleRows(connection, SELECT_BENEFICIARIO_BY_FOLIO, { folio });

            if (rows.length === 0) {
                throw new NotFoundError('Beneficiario no encontrado.');
            }

            const beneficiarios = await this.hydrateBeneficiariosWithEspinas(connection, rows);
            return beneficiarios[0];
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getBeneficiariosWithMembresiaEndingSoon(): Promise<BeneficiarioConMembresiaProxVencer[]> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();

            const result = await connection.execute(
                SELECT_BENEFICIARIOS_WITH_MEMBRESIAS_ENDING_SOON,
                {},
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );

            const rows = (result.rows ?? []) as BeneficiarioConMembresiaRow[];

            if (rows.length === 0) {
                return [];
            }

            const beneficiarios = await this.hydrateBeneficiariosWithEspinas(
                connection,
                rows.map((row) => ({
                    ID_BENEFICIARIO: row.ID_BENEFICIARIO,
                    FOLIO: row.FOLIO,
                    FECHA_INGRESO: row.FECHA_INGRESO,
                    GENERO: row.GENERO,
                    ESTADO: row.ESTADO,
                    CURP: row.CURP,
                    NOMBRES: row.NOMBRES,
                    APELLIDO_PATERNO: row.APELLIDO_PATERNO,
                    APELLIDO_MATERNO: row.APELLIDO_MATERNO,
                    FECHA_NACIMIENTO: row.FECHA_NACIMIENTO,
                    ESTADO_NACIMIENTO: row.ESTADO_NACIMIENTO,
                    FOTOGRAFIA: row.FOTOGRAFIA,
                    TELEFONO: row.TELEFONO,
                    EMAIL: row.EMAIL,
                    CONTACTO_NOMBRE: row.CONTACTO_NOMBRE,
                    CONTACTO_TELEFONO: row.CONTACTO_TELEFONO,
                    CONTACTO_PARENTESCO: row.CONTACTO_PARENTESCO,
                    ALERGIAS: row.ALERGIAS,
                    TIPO_SANGUINEO: row.TIPO_SANGUINEO,
                    VALVULA: row.VALVULA,
                    HOSPITAL: row.HOSPITAL,
                    DOMICILIO_CALLE: row.DOMICILIO_CALLE,
                    DOMICILIO_CP: row.DOMICILIO_CP,
                    DOMICILIO_CIUDAD: row.DOMICILIO_CIUDAD,
                    DOMICILIO_ESTADO: row.DOMICILIO_ESTADO,
                    DIAS_PARA_VENCER: row.DIAS_PARA_VENCER,
                    ID_MEMBRESIA: row.ID_MEMBRESIA,
                    PRECIO: row.PRECIO,
                    FECHA_INICIO: row.FECHA_INICIO,
                    FECHA_FIN: row.FECHA_FIN,
                    MEMBRESIA_ESTADO: row.MEMBRESIA_ESTADO,
                    METODO_PAGO: row.METODO_PAGO,
                })),
            );

            return beneficiarios.map((beneficiario, index) => ({
                ...beneficiario,
                membresia: {
                    id_membresia: rows[index].ID_MEMBRESIA,
                    precio: rows[index].MEMBRESIA_PRECIO,
                    fecha_inicio: rows[index].MEMBRESIA_FECHA_INICIO,
                    fecha_fin: rows[index].MEMBRESIA_FECHA_FIN,
                    estado: rows[index].MEMBRESIA_ESTADO,
                    metodo_pago: rows[index].MEMBRESIA_METODO_PAGO,
                },
            }));
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getMembresiasProximas(): Promise<BeneficiarioConMembresiaProxVencer[]> {
        return await this.getBeneficiariosWithMembresiaEndingSoon();
    }

    async createBeneficiario(input: CreateBeneficiarioInput): Promise<Beneficiario> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();

            const folio = input.folio ?? (await generateNextBeneficiarioFolio(connection));
            const estado: Beneficiario['estado'] = 'inactivo';

            const result = await connection.execute(
                INSERT_BENEFICIARIO,
                {
                    folio,
                    fecha_ingreso: input.fecha_ingreso,
                    genero: input.genero,
                    estado,
                    id_beneficiario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                },
                { autoCommit: false },
            );

            const outBinds = result.outBinds as { id_beneficiario: number[] | number };
            const idBeneficiario = getOutBindNumber(outBinds.id_beneficiario);

            await this.insertTipoEspinas(connection, idBeneficiario, input.tipo_espinas);
            await this.insertIdentificadores(connection, idBeneficiario, input.identificadores);
            await this.insertDatosMedicos(connection, idBeneficiario, input.datos_medicos);
            await this.insertDireccion(connection, idBeneficiario, input.direccion);

            let estadoFinal: Beneficiario['estado'] = estado;
            if (input.membresia) {
                estadoFinal = await this.insertMembresia(connection, idBeneficiario, input.membresia);
            }
            await this.updateBeneficiarioEstado(connection, idBeneficiario, estadoFinal);

            await connection.commit();

            return {
                id_beneficiario: idBeneficiario,
                folio,
                fecha_ingreso: input.fecha_ingreso,
                genero: input.genero,
                tipo_espinas: input.tipo_espinas,
                estado: estadoFinal,
            };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            mapOracleConflictError(error, 'Ya existe un registro con datos unicos de beneficiario.');
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async createIdentificadores(id_beneficiario: number, input: CreateIdentificadoresInput): Promise<Identificadores> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const identificadores = await this.insertIdentificadores(connection, id_beneficiario, input);
            await connection.commit();
            return identificadores;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            mapOracleConflictError(error, 'La CURP o el identificador del beneficiario ya existe.');
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async createDatosMedicos(id_beneficiario: number, input: CreateDatosMedicosInput): Promise<Datos_medicos> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const datosMedicos = await this.insertDatosMedicos(connection, id_beneficiario, input);
            await connection.commit();
            return datosMedicos;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            mapOracleConflictError(error, 'Ya existe informacion medica para este beneficiario.');
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async createDireccion(id_beneficiario: number, input: CreateDireccionInput): Promise<Direccion> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const direccion = await this.insertDireccion(connection, id_beneficiario, input);
            await connection.commit();
            return direccion;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            mapOracleConflictError(error, 'Ya existe direccion para este beneficiario.');
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    private async insertIdentificadores(
        connection: oracledb.Connection,
        id_beneficiario: number,
        input: CreateIdentificadoresInput,
    ): Promise<Identificadores> {
        const result = await connection.execute(
            INSERT_IDENTIFICADORES_RETURNING,
            {
                id_beneficiario,
                CURP: input.CURP,
                nombres: input.nombres,
                apellido_paterno: input.apellido_paterno,
                apellido_materno: input.apellido_materno,
                fecha_nacimiento: input.fecha_nacimiento,
                estado_nacimiento: input.estado_nacimiento,
                fotografia: input.fotografia ?? null,
                telefono: input.telefono ?? null,
                email: input.email ?? null,
                id_identificadores: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: false },
        );

        const outBinds = result.outBinds as { id_identificadores: number[] | number };
        const idIdentificadores = getOutBindNumber(outBinds.id_identificadores);

        return {
            id_identificadores: idIdentificadores,
            id_beneficiario,
            CURP: input.CURP,
            nombres: input.nombres,
            apellido_paterno: input.apellido_paterno,
            apellido_materno: input.apellido_materno,
            fecha_nacimiento: input.fecha_nacimiento,
            estado_nacimiento: input.estado_nacimiento,
            fotografia: input.fotografia ?? '',
            telefono: input.telefono ?? '',
            email: input.email ?? '',
        };
    }

    private async insertDatosMedicos(
        connection: oracledb.Connection,
        id_beneficiario: number,
        input: CreateDatosMedicosInput,
    ): Promise<Datos_medicos> {
        const result = await connection.execute(
            INSERT_DATOS_MEDICOS_RETURNING,
            {
                id_beneficiario,
                contacto_nombre: input.contacto_nombre,
                contacto_telefono: input.contacto_telefono,
                contacto_parentesco: input.contacto_parentesco,
                alergias: input.alergias,
                tipo_sanguineo: input.tipo_sanguineo,
                valvula: input.valvula ? 1 : 0,
                hospital: input.hospital ?? null,
                id_datos_medicos: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: false },
        );

        const outBinds = result.outBinds as { id_datos_medicos: number[] | number };
        const idDatosMedicos = getOutBindNumber(outBinds.id_datos_medicos);

        if (input.padres && input.padres.length > 0) {
            for (const padre of input.padres) {
                await connection.execute(
                    INSERT_PADRE,
                    {
                        id_datos_medicos: idDatosMedicos,
                        tipo_padre: padre.tipo_padre,
                        nombre_completo: padre.nombre_completo ?? null,
                        fecha_nacimiento: padre.fecha_nacimiento ? new Date(padre.fecha_nacimiento) : null,
                        email: padre.email ?? null,
                        telefono: padre.telefono ?? null,
                        telefono_casa: padre.telefono_casa ?? null,
                        telefono_trabajo: padre.telefono_trabajo ?? null,
                    },
                    { autoCommit: false }
                );
            }
        }

        return {
            id_datos_medicos: idDatosMedicos,
            id_beneficiario,
            contacto_nombre: input.contacto_nombre,
            contacto_telefono: input.contacto_telefono,
            contacto_parentesco: input.contacto_parentesco,
            alergias: input.alergias,
            tipo_sanguineo: input.tipo_sanguineo,
            valvula: input.valvula,
            hospital: input.hospital ?? '',
        };
    }

    private async insertDireccion(
        connection: oracledb.Connection,
        id_beneficiario: number,
        input: CreateDireccionInput,
    ): Promise<Direccion> {
        const result = await connection.execute(
            INSERT_DIRECCION_RETURNING,
            {
                id_beneficiario,
                domicilio_calle: input.domicilio_calle,
                domicilio_cp: input.domicilio_cp,
                domicilio_ciudad: input.domicilio_ciudad,
                domicilio_estado: input.domicilio_estado,
                id_direccion: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: false },
        );

        const outBinds = result.outBinds as { id_direccion: number[] | number };
        const idDireccion = getOutBindNumber(outBinds.id_direccion);

        return {
            id_direccion: idDireccion,
            id_beneficiario,
            domicilio_calle: input.domicilio_calle,
            domicilio_cp: input.domicilio_cp,
            domicilio_ciudad: input.domicilio_ciudad,
            domicilio_estado: input.domicilio_estado,
        };
    }

    private async insertMembresia(
        connection: oracledb.Connection,
        id_beneficiario: number,
        input: CreateMembresiaInput,
    ): Promise<Beneficiario['estado']> {
        const meses = input.meses;
        const fechaInicio = startOfDay(input.fecha_inicio ?? new Date());
        const fechaFin = addDays(addMonthsKeepingCalendar(fechaInicio, meses), -1);
        const precioTotal = Number((input.precio_mensual * input.meses).toFixed(2));
        const estadoMembresia = fechaFin >= startOfDay(new Date()) ? 'activa' : 'vencida';
        // console.log('input.fecha_inicio:', input.fecha_inicio);
        // console.log('fechaInicio:', fechaInicio);
        // console.log('fechaFin:', fechaFin);

        await connection.execute(
            INSERT_MEMBRESIA,
            {
                id_beneficiario,
                precio: precioTotal,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                estado: estadoMembresia,
                metodo_pago: input.metodo_pago,
            },
            { autoCommit: false },
        );

        return estadoMembresia === 'activa' ? 'activo' : 'inactivo';
    }

    private async updateBeneficiarioEstado(
        connection: oracledb.Connection,
        id_beneficiario: number,
        estado: Beneficiario['estado'],
    ): Promise<void> {
        await connection.execute(
            UPDATE_BENEFICIARIO_ESTADO,
            {
                id_beneficiario,
                estado,
            },
            { autoCommit: false },
        );
    }

    private async refreshExpiredMembresiasWithConnection(connection: oracledb.Connection): Promise<void> {
        await connection.execute(
            UPDATE_MEMBRESIA_ESTADO,
            {},
            { autoCommit: false },
        );

        await connection.execute(
            UPDATE_BENEFICIARIO_ESTADO_EXPIRED_MEMBRESIAS,
            {},
            { autoCommit: false },
        );

        await connection.commit();
    }

    public async refreshExpiredMembresias(): Promise<void> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            await this.refreshExpiredMembresiasWithConnection(connection);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    private async insertTipoEspinas(
        connection: oracledb.Connection,
        id_beneficiario: number,
        tipo_espinas: number[],
    ): Promise<void> {
        for (const id_espina of tipo_espinas) {
            await connection.execute(
                INSERT_BENEFICIARIO_ESPINA,
                {
                    id_beneficiario,
                    id_espina,
                },
                { autoCommit: false },
            );
        }
    }

    async getPadresByBeneficiarioId(id_beneficiario: number): Promise<Padre[]> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute<{
                ID_PADRE: number;
                ID_DATOS_MEDICOS: number;
                TIPO_PADRE: string;
                NOMBRE_COMPLETO: string | null;
                FECHA_NACIMIENTO: string | null;
                EMAIL: string | null;
                TELEFONO: string | null;
                TELEFONO_CASA: string | null;
                TELEFONO_TRABAJO: string | null;
            }>(
                SELECT_PADRES_BY_BENEFICIARIO_ID,
                { id_beneficiario },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!result.rows) {
                return [];
            }

            return result.rows.map(row => ({
                id_padre: row.ID_PADRE,
                id_datos_medicos: row.ID_DATOS_MEDICOS,
                tipo_padre: row.TIPO_PADRE,
                nombre_completo: row.NOMBRE_COMPLETO,
                fecha_nacimiento: row.FECHA_NACIMIENTO,
                email: row.EMAIL,
                telefono: row.TELEFONO,
                telefono_casa: row.TELEFONO_CASA,
                telefono_trabajo: row.TELEFONO_TRABAJO
            }));

        } catch (error) {
            console.error('Error in getPadresByBeneficiarioId:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getSiguienteFolio(): Promise<string> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            return await generateNextBeneficiarioFolio(connection);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}