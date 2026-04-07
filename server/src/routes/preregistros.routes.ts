import { Router } from "express";
import {
  crearPreregistro,
  listarPreregistros,
  obtenerPreregistro,
} from "../handlers/preregistros.handler";

const router = Router();

// POST /api/preregistros para crear nuevo preregistro
router.post("/", crearPreregistro);

// GET /api/preregistros para listar a los preregsitrados
router.get("/", listarPreregistros);

// GET /api/preregistros/:id Obtenerlos por ID
router.get("/:id", obtenerPreregistro);

export default router;
