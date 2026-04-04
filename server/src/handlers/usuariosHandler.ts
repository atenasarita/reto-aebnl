import { NextFunction, Request, Response } from "express";
import { UsuariosController } from "../controllers/usuarios.controller";
import { CreateUsuarioInput, LoginUsuarioInput } from "../types/usuarios.types";
import { createAccessToken } from "../utils/jwt";

export class UsuariosHandler {
  usuariosController: UsuariosController;

  constructor(usuariosController: UsuariosController) {
    this.usuariosController = usuariosController;
  }

  createUsuario = async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body as CreateUsuarioInput;
    try {
      const user = await this.usuariosController.createUsuario(payload);

      return res.status(201).json(user);
    } catch (error) {
      return next(error);
    }
  };

  loginUsuario = async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body as LoginUsuarioInput;
    try {
      const user = await this.usuariosController.loginUsuario(payload);

      const token = createAccessToken({
        id_usuario: user.id_usuario,
        usuario: user.usuario,
        rol: user.rol,
      });

      return res.status(200).json({ user, token });
    } catch (error) {
      return next(error);
    }
  };
}
