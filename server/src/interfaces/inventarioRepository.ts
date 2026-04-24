import {
    CreateInventarioInput,
    GetInventarioResponse,
    Inventario,
    Movimientos_inventario,
    Objeto_categoria,
    RegistrarMovimientoInventarioInput,
} from '../types/inventario.types';

export interface InventarioRepository {
    getInventario(): Promise<GetInventarioResponse>;
    getProductosEscasos(): Promise<GetInventarioResponse>;
    listObjetoCategorias(): Promise<Objeto_categoria[]>;
    createInventario(input: CreateInventarioInput): Promise<Inventario>;
    registrarMovimientoInventario(
        input: RegistrarMovimientoInventarioInput,
        idUsuario: number,
    ): Promise<Movimientos_inventario>;
}