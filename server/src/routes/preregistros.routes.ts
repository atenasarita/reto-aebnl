import { Router } from "express";
import {
  crearPreregistro,
  listarPreregistros,
  obtenerPreregistro,
} from "../handlers/preregistros.handler";
import { preregistroRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

// POST /api/preregistros para crear nuevo preregistro
router.post("/", preregistroRateLimiter, crearPreregistro);

// GET /api/preregistros para listar a los preregsitrados
router.get("/", listarPreregistros);

// GET /api/preregistros/:id Obtenerlos por ID
router.get("/:id", obtenerPreregistro);

export default router;
