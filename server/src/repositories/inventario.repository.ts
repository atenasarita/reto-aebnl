import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import { ConflictError, NotFoundError, ValidationError } from '../errors/appError';
import { InventarioRepository } from '../interfaces/inventarioRepository';
import {
    CreateInventarioInput,
    GetInventarioResponse,
    Inventario,
    InventarioActivo,
    Movimientos_inventario,
    Objeto_categoria,
    RegistrarMovimientoInventarioInput,
    UpdateInventarioInput,
} from '../types/inventario.types';
import {
    INSERT_INVENTARIO,
    INSERT_MOVIMIENTO_INVENTARIO,
    SELECT_CANTIDAD_INVENTARIO_FOR_UPDATE,
    SELECT_INVENTARIO,
    SELECT_INVENTARIO_BY_ID,
    SELECT_CLAVES_INVENTARIO_ACTIVAS_POR_CATEGORIA,
    SELECT_OBJETO_CATEGORIA_BY_ID_FOR_UPDATE,
    SELECT_OBJETO_CATEGORIAS,
    SELECT_PRODUCTOS_ESCASOS,
    SOFT_DELETE_INVENTARIO,
    UPDATE_INVENTARIO,
    UPDATE_INVENTARIO_CANTIDAD,
} from './inventario.queries';
import {
    formatearClaveInventario,
    prefijoClaveDesdeCategoria,
    siguienteNumeroClaveInventario,
} from '../utils/inventarioClave';
import { getOutBindNumber } from '../utils/oracle.utils';

type CantidadRow = { CANTIDAD: number };

type CategoriaRow = {
    ID_CATEGORIA: number;
    DESCRIPCION: string | null;
};

type ClaveRow = { CLAVE: string };

type InventarioRow = {
    ID_INVENTARIO: number;
    CLAVE: string;
    NOMBRE: string;
    ID_CATEGORIA: number;
    UNIDAD_MEDIDA: string;
    PRECIO: number;
    CANTIDAD: number;
    ACTIVO: InventarioActivo;
};

export class OracleInventarioRepository implements InventarioRepository {
    private readonly oracleConnection: OracleConnection;

    constructor(oracleConnection: OracleConnection = new OracleConnection()) {
        this.oracleConnection = oracleConnection;
    }

    async getInventario(): Promise<GetInventarioResponse> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                SELECT_INVENTARIO,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );
            return result.rows as unknown as GetInventarioResponse;
        } catch (error) {
            throw new Error('Error al obtener el inventario');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getProductosEscasos(): Promise<GetInventarioResponse> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                SELECT_PRODUCTOS_ESCASOS,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );
            return result.rows as unknown as GetInventarioResponse;
        } catch (error) {
            throw new Error('Error al obtener productos escasos');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async listObjetoCategorias(): Promise<Objeto_categoria[]> {
        let connection: oracledb.Connection | undefined;
        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                SELECT_OBJETO_CATEGORIAS,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );
            return (result.rows ?? []) as Objeto_categoria[];
        } catch {
            throw new Error('Error al obtener categorías de inventario');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    private mapRowToInventario(row: InventarioRow): Inventario {
        return {
            id_inventario: Number(row.ID_INVENTARIO),
            clave: row.CLAVE,
            nombre: row.NOMBRE,
            id_categoria: Number(row.ID_CATEGORIA),
            unidad_medida: row.UNIDAD_MEDIDA,
            precio: Number(row.PRECIO),
            cantidad: Number(row.CANTIDAD),
            activo: row.ACTIVO === 0 ? 0 : 1,
        };
    }

    private async fetchInventarioRowById(
        connection: oracledb.Connection,
        idInventario: number,
    ): Promise<InventarioRow | null> {
        const result = await connection.execute(
            SELECT_INVENTARIO_BY_ID,
            { id_inventario: idInventario },
            { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const rows = result.rows as InventarioRow[] | undefined;
        return rows?.[0] ?? null;
    }

    async updateInventario(
        idInventario: number,
        input: UpdateInventarioInput,
    ): Promise<Inventario> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const existing = await this.fetchInventarioRowById(connection, idInventario);
            if (!existing || existing.ACTIVO !== 1) {
                throw new NotFoundError('Producto de inventario no encontrado.');
            }

            const updateResult = await connection.execute(
                UPDATE_INVENTARIO,
                {
                    id_inventario: idInventario,
                    clave: input.clave,
                    nombre: input.nombre,
                    id_categoria: input.id_categoria,
                    unidad_medida: input.unidad_medida,
                    precio: input.precio,
                },
                { autoCommit: false },
            );

            if ((updateResult.rowsAffected ?? 0) < 1) {
                await connection.rollback();
                throw new NotFoundError('Producto de inventario no encontrado.');
            }

            const updated = await this.fetchInventarioRowById(connection, idInventario);
            if (!updated) {
                await connection.rollback();
                throw new NotFoundError('Producto de inventario no encontrado.');
            }

            await connection.commit();
            return this.mapRowToInventario(updated);
        } catch (error: unknown) {
            if (connection) {
                await connection.rollback().catch(() => undefined);
            }
            if (error instanceof NotFoundError) {
                throw error;
            }
            const err = error as { code?: string };
            if (err?.code === 'ORA-00001') {
                throw new ConflictError('Ya existe un producto con esa clave.');
            }
            if (err?.code === 'ORA-02291') {
                throw new ValidationError('La categoría indicada no existe.');
            }
            throw new Error('Error al actualizar el producto en inventario');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async deleteInventario(idInventario: number): Promise<void> {
        let connection: oracledb.Connection | undefined;

        try {
            connection = await this.oracleConnection.getConnection();
            const existing = await this.fetchInventarioRowById(connection, idInventario);
            if (!existing || existing.ACTIVO !== 1) {
                throw new NotFoundError('Producto de inventario no encontrado.');
            }

            const deleteResult = await connection.execute(
                SOFT_DELETE_INVENTARIO,
                { id_inventario: idInventario },
                { autoCommit: false },
            );

            if ((deleteResult.rowsAffected ?? 0) < 1) {
                await connection.rollback();
                throw new NotFoundError('Producto de inventario no encontrado.');
            }

            await connection.commit();
        } catch (error) {
            if (connection) {
                await connection.rollback().catch(() => undefined);
            }
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new Error('Error al eliminar el producto del inventario');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    private async resolverClaveAlta(
        connection: oracledb.Connection,
        input: CreateInventarioInput,
        desfaseSecuencia = 0,
    ): Promise<string> {
        const manual = input.clave?.trim();
        if (manual) {
            return manual;
        }

        const catLock = await connection.execute(
            SELECT_OBJETO_CATEGORIA_BY_ID_FOR_UPDATE,
            { id_categoria: input.id_categoria },
            { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const catRows = catLock.rows as CategoriaRow[] | undefined;
        if (!catRows?.length) {
            throw new ValidationError('La categoría indicada no existe.');
        }

        const clavesResult = await connection.execute(
            SELECT_CLAVES_INVENTARIO_ACTIVAS_POR_CATEGORIA,
            { id_categoria: input.id_categoria },
            { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const clavesRows = clavesResult.rows as ClaveRow[] | undefined;
        const claves = (clavesRows ?? []).map((row) => row.CLAVE);
        const prefijo = prefijoClaveDesdeCategoria(catRows[0].DESCRIPCION);
        const numero = siguienteNumeroClaveInventario(claves, prefijo, desfaseSecuencia);

        return formatearClaveInventario(prefijo, numero);
    }

    async createInventario(input: CreateInventarioInput): Promise<Inventario> {
        let connection: oracledb.Connection | undefined;
        const cantidad = input.cantidad ?? 0;
        const activoNum: InventarioActivo = input.activo === '0' ? 0 : 1;
        const maxIntentos = 5;

        try {
            connection = await this.oracleConnection.getConnection();

            for (let intento = 0; intento < maxIntentos; intento += 1) {
                const clave = await this.resolverClaveAlta(connection, input, intento);

                try {
                    const result = await connection.execute(
                        INSERT_INVENTARIO,
                        {
                            clave,
                            nombre: input.nombre,
                            id_categoria: input.id_categoria,
                            unidad_medida: input.unidad_medida,
                            precio: input.precio,
                            cantidad,
                            activo: activoNum,
                            id_inventario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                        },
                        { autoCommit: false },
                    );
                    const outBinds = result.outBinds as { id_inventario: number[] | number };
                    const idInventario = getOutBindNumber(outBinds.id_inventario);

                    await connection.commit();

                    return {
                        id_inventario: idInventario,
                        clave,
                        nombre: input.nombre,
                        id_categoria: input.id_categoria,
                        unidad_medida: input.unidad_medida,
                        precio: input.precio,
                        cantidad,
                        activo: activoNum,
                    };
                } catch (insertError: unknown) {
                    const err = insertError as { code?: string };
                    if (err?.code === 'ORA-00001' && !input.clave?.trim()) {
                        await connection.rollback().catch(() => undefined);
                        continue;
                    }
                    throw insertError;
                }
            }

            throw new ConflictError(
                'No se pudo asignar una clave única automática. Intenta de nuevo.',
            );
        } catch (error: unknown) {
            if (connection) {
                await connection.rollback().catch(() => undefined);
            }
            if (
                error instanceof ConflictError ||
                error instanceof ValidationError
            ) {
                throw error;
            }
            const err = error as { code?: string };
            if (err?.code === 'ORA-00001') {
                throw new ConflictError('Ya existe un producto con esa clave.');
            }
            if (err?.code === 'ORA-02291') {
                throw new ValidationError('La categoría indicada no existe.');
            }
            throw new Error('Error al crear el producto en inventario');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async registrarMovimientoInventario(
        input: RegistrarMovimientoInventarioInput,
        idUsuario: number,
    ): Promise<Movimientos_inventario> {
        let connection: oracledb.Connection | undefined;
        const fecha =
            input.fecha != null && !Number.isNaN(new Date(input.fecha).getTime())
                ? new Date(input.fecha)
                : new Date();
        const idServicioOtorgado = input.id_servicio_otorgado ?? null;

        try {
            connection = await this.oracleConnection.getConnection();

            const lockResult = await connection.execute(
                SELECT_CANTIDAD_INVENTARIO_FOR_UPDATE,
                { id_inventario: input.id_inventario },
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );
            const rows = lockResult.rows as CantidadRow[] | undefined;
            if (!rows?.length) {
                await connection.rollback();
                throw new NotFoundError('Producto de inventario no encontrado.');
            }

            const cantAnterior = Number(rows[0].CANTIDAD);
            const delta =
                input.tipo_movimiento === 'entrada' ? input.cantidad : -input.cantidad;
            const cantNueva = cantAnterior + delta;

            if (cantNueva < 0) {
                await connection.rollback();
                throw new ValidationError('Stock insuficiente para una salida de esa cantidad.');
            }

            const movResult = await connection.execute(
                INSERT_MOVIMIENTO_INVENTARIO,
                {
                    id_inventario: input.id_inventario,
                    tipo_movimiento: input.tipo_movimiento,
                    cantidad: input.cantidad,
                    fecha,
                    cant_anterior: cantAnterior,
                    cant_nueva: cantNueva,
                    id_servicio_otorgado: idServicioOtorgado,
                    id_usuario: idUsuario,
                    motivo: input.motivo,
                    id_movimiento: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                },
                { autoCommit: false },
            );
            const outMov = movResult.outBinds as { id_movimiento: number[] | number };
            const idMovimiento = getOutBindNumber(outMov.id_movimiento);

            await connection.execute(UPDATE_INVENTARIO_CANTIDAD, {
                cantidad: cantNueva,
                id_inventario: input.id_inventario,
            });

            await connection.commit();

            return {
                id_movimiento: idMovimiento,
                id_inventario: input.id_inventario,
                tipo_movimiento: input.tipo_movimiento,
                cantidad: input.cantidad,
                fecha,
                cant_anterior: cantAnterior,
                cant_nueva: cantNueva,
                id_servicio_otorgado: idServicioOtorgado,
                id_usuario: idUsuario,
                motivo: input.motivo,
            };
        } catch (error) {
            if (connection) {
                await connection.rollback().catch(() => undefined);
            }
            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }
            const err = error as { code?: string };
            if (err?.code === 'ORA-02291') {
                throw new ValidationError(
                    'Referencia inválida (producto, usuario o servicio no encontrado).',
                );
            }
            if (err?.code === 'ORA-01861') {
                throw new ValidationError('La fecha del movimiento no es válida.');
            }
            throw new Error('Error al registrar el movimiento de inventario');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}