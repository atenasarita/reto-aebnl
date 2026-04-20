import { NextFunction, Request, Response } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { TokenPayload } from '../types/auth.types';
import { CreateInventarioInput, RegistrarMovimientoInventarioInput } from '../types/inventario.types';


type AuthenticatedRequest = Request & { user?: TokenPayload };


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


    getCategorias = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categorias = await this.inventarioController.listObjetoCategorias();
            return res.status(200).json(categorias);
        } catch (error) {
            return next(error);
        }
    };

        postInventario = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as CreateInventarioInput;
            const creado = await this.inventarioController.createInventario(body);
            return res.status(201).json(creado);
        } catch (error) {
            return next(error);
        }
    };

    postMovimiento = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as AuthenticatedRequest).user;
            if (!user) {
                return res.status(401).json({ message: 'No autenticado.' });
            }
            const body = req.body as RegistrarMovimientoInventarioInput;
            const movimiento = await this.inventarioController.registrarMovimientoInventario(
                body,
                user.id_usuario,
            );
            return res.status(201).json(movimiento);
        } catch (error) {
            return next(error);
        }
    };

}