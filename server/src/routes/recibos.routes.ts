import { Router } from "express";
import { listarRecibos, listarRecibosMes, listarRecibosRango, obtenerRecibo } from "../handlers/recibos.handler.js";

const router = Router();

// GET  /api/recibos?fecha=YYYY-MM-DD (recibos del dia)
router.get("/", listarRecibos);

//GET /api/recibos/resumen-mes?fecha=YYYY-MM (recibos del mes)
router.get("/resumen-mes", listarRecibosMes);

// GET /api/recibos/rango-fechas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD (recibos por rango de fechas)
router.get("/rango-fechas", listarRecibosRango);

// GET  /api/recibos/:id (recibo por ID de servicio otorgado)
router.get("/:id", obtenerRecibo);

export default router;