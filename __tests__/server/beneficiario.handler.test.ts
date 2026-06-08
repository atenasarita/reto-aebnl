/**
 * @jest-environment node
 */

/// <reference types="jest" />

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { BeneficiariosHandler } from '../../server/src/handlers/beneficiariosHandler';
import { ValidationError } from '../../server/src/errors/appError';

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('BeneficiariosHandler', () => {
  let controller: any;
  let handler: BeneficiariosHandler;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    controller = {
      getMembresiasProximas: jest.fn(),
      getBeneficiarios: jest.fn(),
      getBeneficiarioById: jest.fn(),
      getBeneficiarioByFolio: jest.fn(),
      createBeneficiario: jest.fn(),
      createIdentificadores: jest.fn(),
      createDatosMedicos: jest.fn(),
      createDireccion: jest.fn(),
      getSiguienteFolio: jest.fn(),
      getPadresByBeneficiarioId: jest.fn(),
      updatePadres: jest.fn(),
      updateBeneficiario: jest.fn(),
    };

    handler = new BeneficiariosHandler(controller);
    res = createMockResponse();
    next = jest.fn();
  });

  test('getBeneficiarios responde 200 con la lista de beneficiarios', async () => {
    const data = [{ id_beneficiario: 1, folio: 'BEN-001' }];
    controller.getBeneficiarios.mockResolvedValue(data);

    await handler.getBeneficiarios({} as any, res, next);

    expect(controller.getBeneficiarios).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
    expect(next).not.toHaveBeenCalled();
  });

  test('getBeneficiarios manda error a next si falla el controller', async () => {
    const error = new Error('Error del controller');
    controller.getBeneficiarios.mockRejectedValue(error);

    await handler.getBeneficiarios({} as any, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('getBeneficiarioById responde 200 si el id es válido', async () => {
    const req = {
      params: { id_beneficiario: '1' },
    };

    const beneficiario = { id_beneficiario: 1, folio: 'BEN-001' };
    controller.getBeneficiarioById.mockResolvedValue(beneficiario);

    await handler.getBeneficiarioById(req as any, res, next);

    expect(controller.getBeneficiarioById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(beneficiario);
    expect(next).not.toHaveBeenCalled();
  });

  test('getBeneficiarioById manda ValidationError si el id es inválido', async () => {
    const req = {
      params: { id_beneficiario: 'abc' },
    };

    await handler.getBeneficiarioById(req as any, res, next);

    expect(controller.getBeneficiarioById).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
  });

  test('getBeneficiarioByFolio responde 200 si el folio es válido', async () => {
    const req = {
      params: { folio: ' BEN-001 ' },
    };

    const beneficiario = { id_beneficiario: 1, folio: 'BEN-001' };
    controller.getBeneficiarioByFolio.mockResolvedValue(beneficiario);

    await handler.getBeneficiarioByFolio(req as any, res, next);

    expect(controller.getBeneficiarioByFolio).toHaveBeenCalledWith('BEN-001');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(beneficiario);
  });

  test('getBeneficiarioByFolio manda ValidationError si el folio está vacío', async () => {
    const req = {
      params: { folio: '   ' },
    };

    await handler.getBeneficiarioByFolio(req as any, res, next);

    expect(controller.getBeneficiarioByFolio).not.toHaveBeenCalled();
    const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('folio invalido');
  });

  test('createBeneficiario responde 201 con el beneficiario creado', async () => {
    const payload = { folio: 'BEN-001' };
    const creado = { id_beneficiario: 1, folio: 'BEN-001' };

    const req = {
      body: payload,
    };

    controller.createBeneficiario.mockResolvedValue(creado);

    await handler.createBeneficiario(req as any, res, next);

    expect(controller.createBeneficiario).toHaveBeenCalledWith(payload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(creado);
  });

  test('getSiguienteFolio responde 200 con objeto folio', async () => {
    controller.getSiguienteFolio.mockResolvedValue('BEN-010');

    await handler.getSiguienteFolio({} as any, res, next);

    expect(controller.getSiguienteFolio).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ folio: 'BEN-010' });
  });

  test('updateBeneficiario responde 200 con mensaje de éxito', async () => {
    const req = {
      params: { id_beneficiario: '1' },
      body: { estado: 'activo' },
    };

    controller.updateBeneficiario.mockResolvedValue(undefined);

    await handler.updateBeneficiario(req as any, res, next);

    expect(controller.updateBeneficiario).toHaveBeenCalledWith(1, { estado: 'activo' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Beneficiario actualizado correctamente',
    });
  });

  test('getMembresiasProximas responde 500 con mensaje si falla', async () => {
    controller.getMembresiasProximas.mockRejectedValue(new Error('Falla'));

    await handler.getMembresiasProximas({} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error al obtener membresías próximas',
    });
  });

  test('getMembresiasProximas responde 200 con las membresías próximas', async () => {
  const data = [{ id_beneficiario: 1, folio: 'BEN-001' }];

  controller.getMembresiasProximas.mockResolvedValue(data);

  await handler.getMembresiasProximas({} as any, res);

  expect(controller.getMembresiasProximas).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(data);
});

test('getBeneficiarioById manda ValidationError si el id es cero', async () => {
  const req = {
    params: { id_beneficiario: '0' },
  };

  await handler.getBeneficiarioById(req as any, res, next);

  expect(controller.getBeneficiarioById).not.toHaveBeenCalled();
  const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
});

test('getBeneficiarioById manda error a next si falla el controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
  };

  const error = new Error('Error al buscar beneficiario');
  controller.getBeneficiarioById.mockRejectedValue(error);

  await handler.getBeneficiarioById(req as any, res, next);

  expect(controller.getBeneficiarioById).toHaveBeenCalledWith(1);
  expect(next).toHaveBeenCalledWith(error);
});

test('getBeneficiarioByFolio manda error a next si falla el controller', async () => {
  const req = {
    params: { folio: 'BEN-001' },
  };

  const error = new Error('Error al buscar por folio');
  controller.getBeneficiarioByFolio.mockRejectedValue(error);

  await handler.getBeneficiarioByFolio(req as any, res, next);

  expect(controller.getBeneficiarioByFolio).toHaveBeenCalledWith('BEN-001');
  expect(next).toHaveBeenCalledWith(error);
});

test('createBeneficiario manda error a next si falla el controller', async () => {
  const req = {
    body: { folio: 'BEN-001' },
  };

  const error = new Error('Error al crear beneficiario');
  controller.createBeneficiario.mockRejectedValue(error);

  await handler.createBeneficiario(req as any, res, next);

  expect(controller.createBeneficiario).toHaveBeenCalledWith(req.body);
  expect(next).toHaveBeenCalledWith(error);
});

test('createIdentificadores responde 201 con identificadores creados', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: { CURP: 'CURP123', nombres: 'Ana' },
  };

  const identificadores = {
    id_identificadores: 10,
    id_beneficiario: 1,
    CURP: 'CURP123',
    nombres: 'Ana',
  };

  controller.createIdentificadores.mockResolvedValue(identificadores);

  await handler.createIdentificadores(req as any, res, next);

  expect(controller.createIdentificadores).toHaveBeenCalledWith(1, req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(identificadores);
});

test('createIdentificadores manda ValidationError si el id es inválido', async () => {
  const req = {
    params: { id_beneficiario: 'abc' },
    body: {},
  };

  await handler.createIdentificadores(req as any, res, next);

  expect(controller.createIdentificadores).not.toHaveBeenCalled();
  const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
});

test('createIdentificadores manda error a next si falla el controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: { CURP: 'CURP123' },
  };

  const error = new Error('Error al crear identificadores');
  controller.createIdentificadores.mockRejectedValue(error);

  await handler.createIdentificadores(req as any, res, next);

  expect(controller.createIdentificadores).toHaveBeenCalledWith(1, req.body);
  expect(next).toHaveBeenCalledWith(error);
});

test('createDatosMedicos responde 201 con datos médicos creados', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: { tipo_sanguineo: 'O+', valvula: true },
  };

  const datosMedicos = {
    id_datos_medicos: 20,
    id_beneficiario: 1,
    tipo_sanguineo: 'O+',
    valvula: true,
  };

  controller.createDatosMedicos.mockResolvedValue(datosMedicos);

  await handler.createDatosMedicos(req as any, res, next);

  expect(controller.createDatosMedicos).toHaveBeenCalledWith(1, req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(datosMedicos);
});

test('createDatosMedicos manda ValidationError si el id es inválido', async () => {
  const req = {
    params: { id_beneficiario: '-1' },
    body: {},
  };

  await handler.createDatosMedicos(req as any, res, next);

  expect(controller.createDatosMedicos).not.toHaveBeenCalled();
  const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
});

test('createDatosMedicos manda error a next si falla el controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: { tipo_sanguineo: 'O+' },
  };

  const error = new Error('Error al crear datos médicos');
  controller.createDatosMedicos.mockRejectedValue(error);

  await handler.createDatosMedicos(req as any, res, next);

  expect(controller.createDatosMedicos).toHaveBeenCalledWith(1, req.body);
  expect(next).toHaveBeenCalledWith(error);
});

test('createDireccion responde 201 con dirección creada', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: { domicilio_calle: 'Calle 1', domicilio_cp: '64000' },
  };

  const direccion = {
    id_direccion: 30,
    id_beneficiario: 1,
    domicilio_calle: 'Calle 1',
    domicilio_cp: '64000',
  };

  controller.createDireccion.mockResolvedValue(direccion);

  await handler.createDireccion(req as any, res, next);

  expect(controller.createDireccion).toHaveBeenCalledWith(1, req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(direccion);
});

test('createDireccion manda ValidationError si el id es inválido', async () => {
  const req = {
    params: { id_beneficiario: 'abc' },
    body: {},
  };

  await handler.createDireccion(req as any, res, next);

  expect(controller.createDireccion).not.toHaveBeenCalled();
    const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
});

test('createDireccion manda error a next si falla el controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: { domicilio_calle: 'Calle 1' },
  };

  const error = new Error('Error al crear dirección');
  controller.createDireccion.mockRejectedValue(error);

  await handler.createDireccion(req as any, res, next);

  expect(controller.createDireccion).toHaveBeenCalledWith(1, req.body);
  expect(next).toHaveBeenCalledWith(error);
});

test('getSiguienteFolio manda error a next si falla el controller', async () => {
  const error = new Error('Error al obtener folio');
  controller.getSiguienteFolio.mockRejectedValue(error);

  await handler.getSiguienteFolio({} as any, res, next);

  expect(controller.getSiguienteFolio).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(error);
});

test('getPadresByBeneficiarioId responde 200 con los padres del beneficiario', async () => {
  const req = {
    params: { id_beneficiario: '1' },
  };

  const padres = [
    { tipo_padre: 'madre', nombre_completo: 'María García' },
    { tipo_padre: 'padre', nombre_completo: 'Juan López' },
  ];

  controller.getPadresByBeneficiarioId.mockResolvedValue(padres);

  await handler.getPadresByBeneficiarioId(req as any, res, next);

  expect(controller.getPadresByBeneficiarioId).toHaveBeenCalledWith(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(padres);
});

test('getPadresByBeneficiarioId manda ValidationError si el id es inválido', async () => {
  const req = {
    params: { id_beneficiario: 'abc' },
  };

  await handler.getPadresByBeneficiarioId(req as any, res, next);

  expect(controller.getPadresByBeneficiarioId).not.toHaveBeenCalled();
 const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
});

test('getPadresByBeneficiarioId manda error a next si falla el controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
  };

  const error = new Error('Error al obtener padres');
  controller.getPadresByBeneficiarioId.mockRejectedValue(error);

  await handler.getPadresByBeneficiarioId(req as any, res, next);

  expect(controller.getPadresByBeneficiarioId).toHaveBeenCalledWith(1);
  expect(next).toHaveBeenCalledWith(error);
});

test('updatePadres responde 200 con el resultado del controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: {
      madre_nombre_completo: 'María García',
      padre_nombre_completo: 'Juan López',
    },
  };

  const result = {
    message: 'Padres actualizados correctamente',
  };

  controller.updatePadres.mockResolvedValue(result);

  await handler.updatePadres(req as any, res, next);

  expect(controller.updatePadres).toHaveBeenCalledWith(1, req.body);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(result);
});

test('updatePadres manda ValidationError si el id es inválido', async () => {
  const req = {
    params: { id_beneficiario: 'abc' },
    body: {},
  };

  await handler.updatePadres(req as any, res, next);

  expect(controller.updatePadres).not.toHaveBeenCalled();
  const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
});

test('updatePadres manda error a next si falla el controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: {},
  };

  const error = new Error('Error al actualizar padres');
  controller.updatePadres.mockRejectedValue(error);

  await handler.updatePadres(req as any, res, next);

  expect(controller.updatePadres).toHaveBeenCalledWith(1, req.body);
  expect(next).toHaveBeenCalledWith(error);
});

test('updateBeneficiario manda ValidationError si el id es inválido', async () => {
  const req = {
    params: { id_beneficiario: 'abc' },
    body: {},
  };

  await handler.updateBeneficiario(req as any, res, next);

  expect(controller.updateBeneficiario).not.toHaveBeenCalled();
  const error = next.mock.calls[0][0] as ValidationError;

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('id_beneficiario invalido');
});

test('updateBeneficiario manda error a next si falla el controller', async () => {
  const req = {
    params: { id_beneficiario: '1' },
    body: { estado: 'activo' },
  };

  const error = new Error('Error al actualizar beneficiario');
  controller.updateBeneficiario.mockRejectedValue(error);

  await handler.updateBeneficiario(req as any, res, next);

  expect(controller.updateBeneficiario).toHaveBeenCalledWith(1, req.body);
  expect(next).toHaveBeenCalledWith(error);
});
});