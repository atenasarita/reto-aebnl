import {
    CreateInventarioInput,
    GetInventarioResponse,
    Inventario,
    Movimientos_inventario,
    Objeto_categoria,
    RegistrarMovimientoInventarioInput,
    UpdateInventarioInput,
} from '../types/inventario.types';

export interface InventarioRepository {
    getInventario(): Promise<GetInventarioResponse>;
    getProductosEscasos(): Promise<GetInventarioResponse>;
    listObjetoCategorias(): Promise<Objeto_categoria[]>;
    createInventario(input: CreateInventarioInput): Promise<Inventario>;
    updateInventario(idInventario: number, input: UpdateInventarioInput): Promise<Inventario>;
    deleteInventario(idInventario: number): Promise<void>;
    registrarMovimientoInventario(
        input: RegistrarMovimientoInventarioInput,
        idUsuario: number,
    ): Promise<Movimientos_inventario>;
}