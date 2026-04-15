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


export class InventarioController {
    repository: InventarioRepository;

    constructor(repository: InventarioRepository) {
        this.repository = repository;
    }

    async getInventario(): Promise<GetInventarioResponse> {
        return this.repository.getInventario();
    }
}