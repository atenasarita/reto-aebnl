import { Router } from "express";
import { listarRecibos, obtenerRecibo } from "../handlers/recibos.handler.js";

const router = Router();

// GET  /api/recibos?fecha=YYYY-MM-DD (recibos del dia)
router.get("/", listarRecibos);

// GET  /api/recibos/:id (recibo por ID de servicio otorgado)
router.get("/:id", obtenerRecibo);

export default router;