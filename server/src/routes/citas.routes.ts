import { Router } from "express";
import { getCitas, createCita, updateCita } from "../handlers/citas.handler";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

const staffAuth = [authenticateJWT, authorizeRoles("administrador", "operador")] as const;

router.get("/", ...staffAuth, getCitas);
router.post("/", ...staffAuth, createCita);
router.put("/:id", ...staffAuth, updateCita);

export default router;