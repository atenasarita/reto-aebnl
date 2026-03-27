import { Router } from "express";
import { BeneficiariosController } from "../controllers/beneficiarios.controller";
import { BeneficiariosHandler } from "../handlers/beneficiarios.handler";
import { OracleBeneficiarioRepository } from "../repositories/beneficiario.repository";

const router = Router();

const beneficiarioRepository = new OracleBeneficiarioRepository();
const beneficiariosController = new BeneficiariosController(beneficiarioRepository);
const beneficiariosHandler = new BeneficiariosHandler(beneficiariosController);

router.get("/beneficiarios/:folio", beneficiariosHandler.getBeneficiarioByFolio);

export default router;