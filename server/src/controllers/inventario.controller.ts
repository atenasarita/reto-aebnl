import { InventarioRepository } from '../interfaces/inventarioRepository';
import {
    CreateInventarioInput,
    GetInventarioResponse,
    Inventario,
    Movimientos_inventario,
    Objeto_categoria,
    RegistrarMovimientoInventarioInput,
} from '../types/inventario.types';


export class InventarioController {
    repository: InventarioRepository;

    constructor(repository: InventarioRepository) {
        this.repository = repository;
    }

    async getInventario(): Promise<GetInventarioResponse> {
        return this.repository.getInventario();
    }


    async listObjetoCategorias(): Promise<Objeto_categoria[]> {
        return this.repository.listObjetoCategorias();
    }

    async createInventario(input: CreateInventarioInput): Promise<Inventario> {
        return this.repository.createInventario(input);
    }


    async registrarMovimientoInventario(input: RegistrarMovimientoInventarioInput, idUsuario: number,): Promise<Movimientos_inventario> {
        return this.repository.registrarMovimientoInventario(input, idUsuario);
    }
}
