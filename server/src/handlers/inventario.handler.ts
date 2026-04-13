import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors/appError';
import { InventarioController } from '../controllers/inventario.controller';
import { 
    GetInventarioResponse,
    CreateObjeto_categoriaInput,
    CreateInventarioInput,
    CreateVenta_inventarioInput,
    CreateMovimientos_inventarioInput,
} from '../types/inventario.types';

export class InventarioHandler {
    inventarioController: InventarioController;

    constructor(inventarioController: InventarioController) {
        this.inventarioController = inventarioController;
    }
    
    getInventario = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const inventario = await this.inventarioController.getInventario();
            return res.status(200).json(inventario);
        } catch (error) {
            return next(error);
        }
    };

}