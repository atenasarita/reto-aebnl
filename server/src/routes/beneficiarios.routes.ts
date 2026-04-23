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

import { uploadFoto } from '../middlewares/upload.middleware';

const router = Router();

const beneficiarioRepository = new OracleBeneficiarioRepository();
const beneficiariosController = new BeneficiariosController(beneficiarioRepository);
const beneficiariosHandler = new BeneficiariosHandler(beneficiariosController);


router.get('/beneficiarios', authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getBeneficiarios);

router.get('/beneficiarios/siguiente-folio', authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getSiguienteFolio);

router.get('/beneficiarios/folio/:folio', authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getBeneficiarioByFolio);

router.get('/beneficiarios/:id_beneficiario', authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getBeneficiarioById);

router.get('/beneficiarios/:id_beneficiario/padres', authenticateJWT, authorizeRoles('administrador', 'operador'), beneficiariosHandler.getPadresByBeneficiarioId);

router.post('/beneficiarios', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createBeneficiarioSchema), beneficiariosHandler.createBeneficiario);

router.post('/beneficiarios/:id_beneficiario/identificadores', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createIdentificadoresSchema), beneficiariosHandler.createIdentificadores);

router.post('/beneficiarios/:id_beneficiario/datos-medicos', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createDatosMedicosSchema), beneficiariosHandler.createDatosMedicos);

router.post('/beneficiarios/:id_beneficiario/direccion', authenticateJWT, authorizeRoles('administrador', 'operador'), validateBody(createDireccionSchema), beneficiariosHandler.createDireccion);

router.post('/beneficiarios/upload-foto',
  authenticateJWT,
  authorizeRoles('administrador', 'operador'),
  uploadFoto.single('fotografia'),
  (req, res) => {
    if(!req.file){
      return res.status(400).json({message: 'No se recibio ninguna foto'});
    }
    return res.status(200).json({
      ruta: `/uploads/fotos/${req.file.filename}`,
      nombre: req.file.filename,
    });
  }
);

export default router;
