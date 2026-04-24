import { InventarioRepository } from '../interfaces/inventarioRepository';
import {
    CreateInventarioInput,
    GetInventarioResponse,
    Inventario,
    Movimientos_inventario,
    Objeto_categoria,
    RegistrarMovimientoInventarioInput,
} from '../types/inventario.types';
import { OracleInventarioRepository } from '../repositories/inventario.repository';

export class InventarioController {
    private readonly repository: InventarioRepository;

    constructor(repository: InventarioRepository = new OracleInventarioRepository()) {
        this.repository = repository;
    }

    async getInventario(): Promise<GetInventarioResponse> {
        return await this.repository.getInventario();
    }

    async getProductosEscasos(): Promise<GetInventarioResponse> {
        return await this.repository.getProductosEscasos();
    }

    async listObjetoCategorias(): Promise<Objeto_categoria[]> {
        return await this.repository.listObjetoCategorias();
    }

    async createInventario(input: CreateInventarioInput): Promise<Inventario> {
        return await this.repository.createInventario(input);
    }

    async registrarMovimientoInventario(
        input: RegistrarMovimientoInventarioInput,
        idUsuario: number,
    ): Promise<Movimientos_inventario> {
        return await this.repository.registrarMovimientoInventario(input, idUsuario);
    }
}