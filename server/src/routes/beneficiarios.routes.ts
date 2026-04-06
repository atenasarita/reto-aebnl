import { Router } from 'express';
import { BeneficiariosController } from '../controllers/beneficiarios.controller';
import { BeneficiariosHandler } from '../handlers/beneficiariosHandler';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { OracleBeneficiarioRepository } from '../repositories/beneficiario.repository';
import {
  createBeneficiarioSchema,
  createDatosMedicosSchema,
  createDireccionSchema,
  createIdentificadoresSchema,
} from '../schemas/beneficiarios.schemas';

const router = Router();

const beneficiarioRepository = new OracleBeneficiarioRepository();
const beneficiariosController = new BeneficiariosController(beneficiarioRepository);
const beneficiariosHandler = new BeneficiariosHandler(beneficiariosController);

router.get('/beneficiarios', authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getBeneficiarios);

router.get('/beneficiarios/folio/:folio', authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getBeneficiarioByFolio);

router.get('/beneficiarios/:id_beneficiario',authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getBeneficiarioById);

router.post('/beneficiarios', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createBeneficiarioSchema), beneficiariosHandler.createBeneficiario);

router.post('/beneficiarios/:id_beneficiario/identificadores', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createIdentificadoresSchema), beneficiariosHandler.createIdentificadores);

router.post('/beneficiarios/:id_beneficiario/datos-medicos', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createDatosMedicosSchema), beneficiariosHandler.createDatosMedicos);

router.post('/beneficiarios/:id_beneficiario/direccion', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createDireccionSchema), beneficiariosHandler.createDireccion);

export default router;
