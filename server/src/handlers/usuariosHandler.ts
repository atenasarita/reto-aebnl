import { NextFunction, Request, Response } from "express";
import { UsuariosController } from "../controllers/usuarios.controller";
import { UnauthorizedError } from "../errors/appError";
import { CreateUsuarioInput, LoginUsuarioInput } from "../types/usuarios.types";
import { clearLoginFailures, recordLoginFailure } from "../utils/loginAttempts";
import { createAccessToken } from "../utils/jwt";
import { revokeToken } from "../utils/tokenBlacklist";
import { TokenPayload } from "../types/auth.types";

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
      clearLoginFailures(payload.usuario);

      const token = createAccessToken({
        id_usuario: user.id_usuario,
        usuario: user.usuario,
        rol: user.rol,
      });

      return res.status(200).json({ user, token });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        recordLoginFailure(payload.usuario);
      }
      return next(error);
    }
  };

  logoutUsuario = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: TokenPayload }).user;

    if (!user?.jti || !user.exp) {
      return res.status(200).json({ message: 'Sesion cerrada.' });
    }

    try {
      revokeToken(user.jti, user.exp);
      return res.status(200).json({ message: 'Sesion cerrada.' });
    } catch (error) {
      return next(error);
    }
  };
}
