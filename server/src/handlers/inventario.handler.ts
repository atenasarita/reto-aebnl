import { Request, Response } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { ValidationError, ConflictError, NotFoundError } from '../errors/appError';

export class InventarioHandler {
    private readonly controller: InventarioController;

    constructor(controller: InventarioController = new InventarioController()) {
        this.controller = controller;
    }

    getInventario = async (_req: Request, res: Response): Promise<void> => {
        try {
            const inventario = await this.controller.getInventario();
            res.status(200).json(inventario);
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener el inventario',
            });
        }
    };

    getProductosEscasos = async (_req: Request, res: Response): Promise<void> => {
        try {
            const productosEscasos = await this.controller.getProductosEscasos();
            res.status(200).json(productosEscasos);
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener productos escasos',
            });
        }
    };

    listObjetoCategorias = async (_req: Request, res: Response): Promise<void> => {
        try {
            const categorias = await this.controller.listObjetoCategorias();
            res.status(200).json(categorias);
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener categorías de inventario',
            });
        }
    };

    createInventario = async (req: Request, res: Response): Promise<void> => {
        try {
            const inventario = await this.controller.createInventario(req.body);
            res.status(201).json(inventario);
        } catch (error) {
            if (error instanceof ConflictError) {
                res.status(409).json({ message: error.message });
                return;
            }

            if (error instanceof ValidationError) {
                res.status(400).json({ message: error.message });
                return;
            }

            res.status(500).json({
                message: 'Error al crear el producto en inventario',
            });
        }
    };

    registrarMovimientoInventario = async (req: Request, res: Response): Promise<void> => {
        try {
            const idUsuario = (req as any).user?.id_usuario;

            if (!idUsuario) {
                res.status(401).json({ message: 'Usuario no autenticado.' });
                return;
            }

            const movimiento = await this.controller.registrarMovimientoInventario(
                req.body,
                idUsuario,
            );

            res.status(201).json(movimiento);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ message: error.message });
                return;
            }

            if (error instanceof ValidationError) {
                res.status(400).json({ message: error.message });
                return;
            }

            res.status(500).json({
                message: 'Error al registrar el movimiento de inventario',
            });
        }
    };
}