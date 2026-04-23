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
} from '../types/inventario.types';
import {
    INSERT_INVENTARIO,
    INSERT_MOVIMIENTO_INVENTARIO,
    SELECT_CANTIDAD_INVENTARIO_FOR_UPDATE,
    SELECT_INVENTARIO,
    SELECT_OBJETO_CATEGORIAS,
    SELECT_PRODUCTOS_ESCASOS,
    UPDATE_INVENTARIO_CANTIDAD,
} from './inventario.queries';
import { getOutBindNumber } from '../utils/oracle.utils';

type CantidadRow = { CANTIDAD: number };

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

    async createInventario(input: CreateInventarioInput): Promise<Inventario> {
        let connection: oracledb.Connection | undefined;
        const cantidad = input.cantidad ?? 0;
        const activoNum: InventarioActivo = input.activo === '0' ? 0 : 1;

        try {
            connection = await this.oracleConnection.getConnection();
            const result = await connection.execute(
                INSERT_INVENTARIO,
                {
                    clave: input.clave,
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
                clave: input.clave,
                nombre: input.nombre,
                id_categoria: input.id_categoria,
                unidad_medida: input.unidad_medida,
                precio: input.precio,
                cantidad,
                activo: activoNum,
            };
        } catch (error: unknown) {
            if (connection) {
                await connection.rollback().catch(() => undefined);
            }
            const err = error as { code?: string };
            if (err?.code === 'ORA-00001') {
                throw new ConflictError('Ya existe un producto con esa clave.');
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
        const fecha = input.fecha ?? new Date();
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
                    'El servicio otorgado indicado no existe o no es válido.',
                );
            }
            throw new Error('Error al registrar el movimiento de inventario');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}