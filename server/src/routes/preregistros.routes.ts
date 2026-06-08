import { Router } from "express";
import {
  crearPreregistro,
  listarPreregistros,
  obtenerPreregistro,
} from "../handlers/preregistros.handler";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { preregistroRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

const staffAuth = [authenticateJWT, authorizeRoles("administrador", "operador")] as const;

// POST /api/preregistros para crear nuevo preregistro
router.post("/", preregistroRateLimiter, crearPreregistro);

// GET /api/preregistros para listar a los preregsitrados
router.get("/", ...staffAuth, listarPreregistros);

// GET /api/preregistros/:id Obtenerlos por ID
router.get("/:id", ...staffAuth, obtenerPreregistro);

export default router;
