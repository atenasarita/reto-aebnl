import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

const mockCrear = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockListar = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockObtenerPorId = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.unstable_mockModule('../../server/src/repositories/preregistro.repository', () => ({
  __esModule: true,
  PreregistroRepository: jest.fn().mockImplementation(() => ({
    crear: mockCrear,
    listar: mockListar,
    obtenerPorId: mockObtenerPorId,
  })),
}));

const {
  crearPreregistro,
  listarPreregistros,
  obtenerPreregistro,
} = await import('../../server/src/handlers/preregistros.handler');

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
};

function mockResponse(): MockResponse {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };

  res.status.mockReturnValue(res);

  return res;
}

function mockRequest({
  body = {},
  params = {},
}: {
  body?: Record<string, unknown>;
  params?: Record<string, string>;
} = {}) {
  return {
    body,
    params,
  };
}

const bodyValido = {
  nombres: 'Ana',
  apellido_paterno: 'López',
  apellido_materno: 'García',
  fecha_nacimiento: '2010-05-10',
  curp: 'LOCA100510MNLPRN01',
  espinaBifida: ['Mielomeningocele'],
};

describe('preregistro.handler', () => {
  let consoleSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('crearPreregistro responde 400 si faltan campos requeridos', async () => {
    const req = mockRequest({
      body: {
        nombres: '',
        apellido_paterno: 'López',
        apellido_materno: '',
        fecha_nacimiento: '2010-05-10',
        curp: 'LOCA100510MNLPRN01',
        espinaBifida: ['Mielomeningocele'],
      },
    });

    const res = mockResponse();

    await crearPreregistro(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Campos requeridos faltantes: nombres, apellido_materno',
    });

    expect(mockCrear).not.toHaveBeenCalled();
  });

  test('crearPreregistro responde 400 si la CURP no tiene 18 caracteres', async () => {
    const req = mockRequest({
      body: {
        ...bodyValido,
        curp: 'CURP-CORTA',
      },
    });

    const res = mockResponse();

    await crearPreregistro(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'La CURP debe tener exactamente 18 caracteres.',
    });

    expect(mockCrear).not.toHaveBeenCalled();
  });

  test('crearPreregistro responde 400 si no se selecciona diagnóstico', async () => {
    const req = mockRequest({
      body: {
        ...bodyValido,
        espinaBifida: [],
      },
    });

    const res = mockResponse();

    await crearPreregistro(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Debe seleccionar al menos un diagnóstico.',
    });

    expect(mockCrear).not.toHaveBeenCalled();
  });

  test('crearPreregistro responde 400 si espinaBifida viene undefined', async () => {
    const req = mockRequest({
      body: {
        nombres: 'Ana',
        apellido_paterno: 'López',
        apellido_materno: 'García',
        fecha_nacimiento: '2010-05-10',
        curp: 'LOCA100510MNLPRN01',
      },
    });

    const res = mockResponse();

    await crearPreregistro(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Debe seleccionar al menos un diagnóstico.',
    });

    expect(mockCrear).not.toHaveBeenCalled();
  });

  test('crearPreregistro crea el preregistro y responde 201 cuando el body es válido', async () => {
    mockCrear.mockResolvedValueOnce({
      id_preregistro: 123,
      estado: 'PENDIENTE',
    });

    const req = mockRequest({
      body: bodyValido,
    });

    const res = mockResponse();

    await crearPreregistro(req as never, res as never);

    expect(mockCrear).toHaveBeenCalledTimes(1);
    expect(mockCrear).toHaveBeenCalledWith(bodyValido);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id_preregistro: 123,
      estado: 'PENDIENTE',
      mensaje: 'Preregistro creado exitosamente.',
    });
  });

  test('crearPreregistro responde 500 si el repositorio falla', async () => {
    mockCrear.mockRejectedValueOnce(new Error('Error de base de datos'));

    const req = mockRequest({
      body: bodyValido,
    });

    const res = mockResponse();

    await crearPreregistro(req as never, res as never);

    expect(mockCrear).toHaveBeenCalledTimes(1);

    expect(consoleSpy).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error interno del servidor.',
    });
  });

  test('listarPreregistros responde con los registros del repositorio', async () => {
    const registros = [
      {
        id_preregistro: 1,
        nombres: 'Ana',
        estado: 'PENDIENTE',
      },
      {
        id_preregistro: 2,
        nombres: 'Carlos',
        estado: 'ACEPTADO',
      },
    ];

    mockListar.mockResolvedValueOnce(registros);

    const req = mockRequest();
    const res = mockResponse();

    await listarPreregistros(req as never, res as never);

    expect(mockListar).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(registros);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('listarPreregistros responde 500 si el repositorio falla', async () => {
    mockListar.mockRejectedValueOnce(new Error('Error al listar'));

    const req = mockRequest();
    const res = mockResponse();

    await listarPreregistros(req as never, res as never);

    expect(mockListar).toHaveBeenCalledTimes(1);

    expect(consoleSpy).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error interno del servidor.',
    });
  });

  test('obtenerPreregistro responde 400 si el ID no es numérico', async () => {
    const req = mockRequest({
      params: {
        id: 'abc',
      },
    });

    const res = mockResponse();

    await obtenerPreregistro(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'ID de prerregistro inválido.',
    });

    expect(mockObtenerPorId).not.toHaveBeenCalled();
  });

  test('obtenerPreregistro responde 404 si el preregistro no existe', async () => {
    mockObtenerPorId.mockResolvedValueOnce(null);

    const req = mockRequest({
      params: {
        id: '999',
      },
    });

    const res = mockResponse();

    await obtenerPreregistro(req as never, res as never);

    expect(mockObtenerPorId).toHaveBeenCalledWith(999);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Preregistro no encontrado.',
    });
  });

  test('obtenerPreregistro responde con el registro cuando existe', async () => {
    const registro = {
      id_preregistro: 10,
      nombres: 'Ana',
      apellido_paterno: 'López',
      estado: 'PENDIENTE',
    };

    mockObtenerPorId.mockResolvedValueOnce(registro);

    const req = mockRequest({
      params: {
        id: '10',
      },
    });

    const res = mockResponse();

    await obtenerPreregistro(req as never, res as never);

    expect(mockObtenerPorId).toHaveBeenCalledTimes(1);
    expect(mockObtenerPorId).toHaveBeenCalledWith(10);

    expect(res.json).toHaveBeenCalledWith(registro);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('obtenerPreregistro responde 500 si el repositorio falla', async () => {
    mockObtenerPorId.mockRejectedValueOnce(new Error('Error al obtener'));

    const req = mockRequest({
      params: {
        id: '10',
      },
    });

    const res = mockResponse();

    await obtenerPreregistro(req as never, res as never);

    expect(mockObtenerPorId).toHaveBeenCalledWith(10);

    expect(consoleSpy).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error interno del servidor.',
    });
  });
});