import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import { ConflictError, NotFoundError } from '../errors/appError';
import { InventarioRepository } from '../interfaces/inventarioRepository';
import { 
    GetInventarioResponse, 
    CreateObjeto_categoriaInput, 
    CreateInventarioInput, 
    CreateVenta_inventarioInput, 
    CreateMovimientos_inventarioInput, 
    Inventario, 
    Venta_inventario, 
    Movimientos_inventario, 
    Objeto_categoria 
} from '../types/inventario.types';
import { SELECT_INVENTARIO } from './inventario.queries';

export class OracleInventarioRepository implements InventarioRepository {
    private readonly oracleConnection: OracleConnection;

    constructor(oracleConnection: OracleConnection = new OracleConnection()) {
        this.oracleConnection = oracleConnection;
    }

    async getInventario(): Promise<GetInventarioResponse> 
    {
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
}