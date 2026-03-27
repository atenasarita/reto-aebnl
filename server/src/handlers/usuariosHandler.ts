import { UsuariosController } from "../controllers/usuarios.controller";
import { Request, Response } from 'express';
import { CreateUsuarioInput, LoginUsuarioInput } from "../types/usuarios.types";

export class UsuariosHandler {  
    usuariosController: UsuariosController;

    constructor(usuariosController: UsuariosController) {
        this.usuariosController = usuariosController;
        this.createUsuario = this.createUsuario.bind(this);
        this.loginUsuario = this.loginUsuario.bind(this);
    }

    async createUsuario(req: Request, res: Response) {
        const usuario = await this.usuariosController.createUsuario(req.body);
        res.status(201).json(usuario);
    }

    async loginUsuario(req: Request, res: Response) {
        const loginResponse = await this.usuariosController.loginUsuario(req.body);
        res.status(200).json(loginResponse);
    }
    
}