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
    expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    expect(next.mock.calls[0][0].message).toBe('id_beneficiario invalido');
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
    expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    expect(next.mock.calls[0][0].message).toBe('folio invalido');
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
});