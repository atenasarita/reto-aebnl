import { Router } from "express";
import { getCitas, createCita } from "../handlers/citas.handler";

const router = Router();

router.get('/', getCitas);
router.post('/', createCita);

export default router;