import { Router } from "express";
import { getCitas, createCita, updateCita } from "../handlers/citas.handler";

const router = Router();

router.get('/', getCitas);
router.post('/', createCita);
router.put('/:id', updateCita);

export default router;