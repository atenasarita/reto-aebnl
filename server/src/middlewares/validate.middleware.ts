import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export const validateBody = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
};

// export const validateBody = (schema) => {
//   return (req, res, next) => {
//     console.log('ANTES DE VALIDAR:', {
//       fecha_ingreso: req.body.fecha_ingreso,
//       fecha_nacimiento: req.body.identificadores?.fecha_nacimiento,
//       fecha_inicio: req.body.membresia?.fecha_inicio,
//     });

//     const result = schema.safeParse(req.body);

//     if (!result.success) {
//       return res.status(400).json(result.error);
//     }

//     console.log('DESPUÉS DE VALIDAR:', {
//       fecha_ingreso: result.data.fecha_ingreso,
//       fecha_nacimiento: result.data.identificadores?.fecha_nacimiento,
//       fecha_inicio: result.data.membresia?.fecha_inicio,
//     });

//     req.body = result.data;
//     next();
//   };
// };
