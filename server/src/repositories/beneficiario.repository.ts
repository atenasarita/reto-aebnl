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
    SELECT_BENEFICIARIO_BY_FOLIO,
    SELECT_BENEFICIARIO_BY_ID,
    SELECT_BENEFICIARIOS,
    UPDATE_BENEFICIARIO_ESTADO,
    UPDATE_MEMBRESIA_ESTADO,
    UPDATE_BENEFICIARIO_ESTADO_EXPIRED_MEMBRESIAS,
    selectTipoEspinasByBeneficiarioIds,
} from './beneficiario.queries';
import {
    BeneficiarioDetalle,
    CreateBeneficiarioInput,
    CreateDireccionInput,
    CreateIdentificadoresInput,
    CreateDatosMedicosInput,
    Identificadores,
    Datos_medicos,
    Direccion,
    Beneficiario,
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
    DOMICILIO_CALLE: string | null;
    DOMICILIO_CP: string | null;
    DOMICILIO_CIUDAD: string | null;
    DOMICILIO_ESTADO: string | null;
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
            },
            direccion: {
                id_direccion: 0,
                id_beneficiario: row.ID_BENEFICIARIO,
                domicilio_calle: domicilioCalle,
                domicilio_cp: domicilioCp,
                domicilio_ciudad: domicilioCiudad,
                domicilio_estado: domicilioEstado,
            },
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
                id_datos_medicos: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: false },
        );

        const outBinds = result.outBinds as { id_datos_medicos: number[] | number };
        const idDatosMedicos = getOutBindNumber(outBinds.id_datos_medicos);

        return {
            id_datos_medicos: idDatosMedicos,
            id_beneficiario,
            contacto_nombre: input.contacto_nombre,
            contacto_telefono: input.contacto_telefono,
            contacto_parentesco: input.contacto_parentesco,
            alergias: input.alergias,
            tipo_sanguineo: input.tipo_sanguineo,
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
        const meses = 6; // Duración fija de 6 meses para la membresía, se puede ajustar según sea necesario
        const fechaInicio = startOfDay(input.fecha_inicio ?? new Date());
        const fechaFin = addDays(addMonthsKeepingCalendar(fechaInicio, meses), -1);
        const precioTotal = Number((input.precio_mensual * input.meses).toFixed(2));
        const estadoMembresia = fechaFin >= startOfDay(new Date()) ? 'activa' : 'vencida';

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
}