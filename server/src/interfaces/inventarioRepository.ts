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

export interface InventarioRepository {
    getInventario(): Promise<GetInventarioResponse>;
    /*
    createObjeto_categoria(input: CreateObjeto_categoriaInput): Promise<Objeto_categoria>;
    createInventario(input: CreateInventarioInput): Promise<Inventario>;
    createVenta_inventario(input: CreateVenta_inventarioInput): Promise<Venta_inventario>;
    createMovimientos_inventario(input: CreateMovimientos_inventarioInput): Promise<Movimientos_inventario>;
    */
}