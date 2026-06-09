import { Router } from "express";
import { listarRecibos, listarRecibosMes, listarRecibosRango, obtenerRecibo } from "../handlers/recibos.handler.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

const staffAuth = [authenticateJWT, authorizeRoles("administrador", "operador")] as const;

// GET  /api/recibos?fecha=YYYY-MM-DD (recibos del dia)
router.get("/", ...staffAuth, listarRecibos);

//GET /api/recibos/resumen-mes?fecha=YYYY-MM (recibos del mes)
router.get("/resumen-mes", ...staffAuth, listarRecibosMes);

// GET /api/recibos/rango-fechas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD (recibos por rango de fechas)
router.get("/rango-fechas", ...staffAuth, listarRecibosRango);

// GET  /api/recibos/:id (recibo por ID de servicio otorgado)
router.get("/:id", ...staffAuth, obtenerRecibo);

export default router;