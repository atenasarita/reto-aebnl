import { jest, describe, test, expect, beforeEach } from '@jest/globals';

type ExecuteMock = jest.MockedFunction<
  (
    sql: string,
    binds?: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => Promise<{
    rows?: Record<string, unknown>[];
    outBinds?: Record<string, unknown>;
  }>
>;

type ExecuteResult = {
  rows?: Record<string, unknown>[];
  outBinds?: {
    id_usuario?: number[] | number;
  };
};

type ExecuteMockFn = (
  sql: string,
  binds?: Record<string, unknown>,
  options?: Record<string, unknown>
) => Promise<ExecuteResult>;

type MockConnection = {
  execute: jest.MockedFunction<ExecuteMockFn>;
  commit: jest.MockedFunction<() => Promise<void>>;
  rollback: jest.MockedFunction<() => Promise<void>>;
  close: jest.MockedFunction<() => Promise<void>>;
};

type SimpleMock = jest.MockedFunction<() => Promise<void>>;


const mockGetConnection = jest.fn<() => Promise<MockConnection>>();
const mockHash = jest.fn<(password: string, saltRounds: number) => Promise<string>>();
const mockCompare = jest.fn<(password: string, hash: string) => Promise<boolean>>();

jest.unstable_mockModule(
  "oracledb",
  () => ({
    __esModule: true,
    default: {
      OUT_FORMAT_OBJECT: 4002,
      BIND_OUT: 3003,
      NUMBER: 2010,
    },
    OUT_FORMAT_OBJECT: 4002,
    BIND_OUT: 3003,
    NUMBER: 2010,
  }),
  { virtual: true }
);

jest.unstable_mockModule("../../server/src/db/oracle", () => ({
  __esModule: true,
  OracleConnection: jest.fn().mockImplementation(() => ({
    getConnection: mockGetConnection,
  })),
}));

jest.unstable_mockModule(
  'bcryptjs',
  () => ({
    __esModule: true,
    default: {
      hash: mockHash,
      compare: mockCompare,
    },
    hash: mockHash,
    compare: mockCompare,
  }),
  { virtual: true }
);

const { OracleUsuarioRepository } = await import(
  '../../server/src/repositories/usuario.repository'
);

const { ConflictError, UnauthorizedError } = await import(
  '../../server/src/errors/appError'
);

function createConnection({
  execute,
}: {
  execute?: jest.MockedFunction<ExecuteMockFn>;
} = {}): MockConnection {
  return {
    execute:
      execute ??
      jest.fn<ExecuteMockFn>().mockResolvedValue({
        rows: [],
      }),

    commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    rollback: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    close: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
}

const usuarioInput = {
  usuario: 'admin01',
  contrasena: 'Password123',
  rol: 'administrador' as const,
  nombres: 'Ana',
  apellido_paterno: 'López',
  apellido_materno: 'García',
};

describe('OracleUsuarioRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHash.mockResolvedValue('hashed-password');
    mockCompare.mockResolvedValue(true);
  });

  test('createUsuario crea usuario, guarda contraseña hasheada, hace commit y cierra conexión', async () => {
    const execute = jest.fn<ExecuteMockFn>();

    execute
    .mockResolvedValueOnce({
        outBinds: {
        id_usuario: [15],
        },
    })
    .mockResolvedValueOnce({});

    const connection = createConnection({
      execute: execute as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);

    const repository = new OracleUsuarioRepository();

    const result = await repository.createUsuario(usuarioInput);

    expect(mockGetConnection).toHaveBeenCalledTimes(1);

    expect(mockHash).toHaveBeenCalledWith('Password123', 10);

    expect(connection.execute).toHaveBeenCalledTimes(2);

    expect(connection.execute.mock.calls[0][0]).toContain('INSERT INTO Usuarios');
    expect(connection.execute.mock.calls[0][1]).toMatchObject({
      usuario: 'admin01',
      rol: 'administrador',
      nombres: 'Ana',
      apellido_paterno: 'López',
      apellido_materno: 'García',
    });
    expect(connection.execute.mock.calls[0][2]).toEqual({
      autoCommit: false,
    });

    expect(connection.execute.mock.calls[1][0]).toContain('INSERT INTO Usuarios_seguridad');
    expect(connection.execute.mock.calls[1][1]).toEqual({
      id_usuario: 15,
      contrasena_hash: 'hashed-password',
    });
    expect(connection.execute.mock.calls[1][2]).toEqual({
      autoCommit: false,
    });

    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.close).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      id_usuario: 15,
      usuario: 'admin01',
      rol: 'administrador',
      nombres: 'Ana',
      apellido_paterno: 'López',
      apellido_materno: 'García',
    });
  });

  test('createUsuario acepta outBinds.id_usuario como número directo', async () => {
    const execute = jest.fn<ExecuteMockFn>();

    execute
    .mockResolvedValueOnce({
        outBinds: {
        id_usuario: [20],
        },
    })
    .mockResolvedValueOnce({});

    const connection = createConnection({
      execute: execute as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);

    const repository = new OracleUsuarioRepository();

    const result = await repository.createUsuario(usuarioInput);

    expect(result.id_usuario).toBe(20);
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test('createUsuario hace rollback, cierra conexión y lanza ConflictError si Oracle devuelve ORA-00001', async () => {
    const execute = jest.fn(async () => {
      const error = new Error('Unique constraint violated') as Error & {
        code?: string;
      };

      error.code = 'ORA-00001';
      throw error;
    });

    const connection = createConnection({
      execute: execute as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);

    const repository = new OracleUsuarioRepository();


    await expect(repository.createUsuario(usuarioInput)).rejects.toThrow(
      'El nombre de usuario ya existe.'
    );
  });

  test('createUsuario hace rollback y cierra conexión si ocurre un error general', async () => {
    const execute = jest.fn(async () => {
      throw new Error('Error general de Oracle');
    });

    const connection = createConnection({
      execute: execute as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);

    const repository = new OracleUsuarioRepository();

    await expect(repository.createUsuario(usuarioInput)).rejects.toThrow(
      'Error general de Oracle'
    );

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test('loginUsuario regresa usuario cuando existe y la contraseña es válida', async () => {
    const connection = createConnection({
      execute: jest.fn(async () => ({
        rows: [
          {
            ID_USUARIO: 7,
            USUARIO: 'admin01',
            ROL: 'administrador',
            NOMBRES: 'Ana',
            APELLIDO_PATERNO: 'López',
            APELLIDO_MATERNO: 'García',
            CONTRASENA_HASH: 'hashed-password',
          },
        ],
      })) as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);
    mockCompare.mockResolvedValueOnce(true);

    const repository = new OracleUsuarioRepository();

    const result = await repository.loginUsuario({
      usuario: 'admin01',
      contrasena: 'Password123',
    });

    expect(connection.execute).toHaveBeenCalledTimes(1);

    expect(connection.execute.mock.calls[0][0]).toContain(
      'FROM Usuarios u'
    );

    expect(connection.execute.mock.calls[0][1]).toEqual({
      usuario: 'admin01',
    });

    expect(connection.execute.mock.calls[0][2]).toEqual({
      outFormat: 4002,
    });

    expect(mockCompare).toHaveBeenCalledWith(
      'Password123',
      'hashed-password'
    );

    expect(result).toEqual({
      id_usuario: 7,
      usuario: 'admin01',
      rol: 'administrador',
      nombres: 'Ana',
      apellido_paterno: 'López',
      apellido_materno: 'García',
    });

    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test('loginUsuario lanza UnauthorizedError si el usuario no existe', async () => {
    const connection = createConnection({
      execute: jest.fn(async () => ({
        rows: [],
      })) as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);

    const repository = new OracleUsuarioRepository();

    await expect(
      repository.loginUsuario({
        usuario: 'noexiste',
        contrasena: 'Password123',
      })
    ).rejects.toThrow('Usuario o contraseña incorrectos.');
  });

  test('loginUsuario lanza UnauthorizedError si la contraseña es incorrecta', async () => {
    const connection = createConnection({
      execute: jest.fn(async () => ({
        rows: [
          {
            ID_USUARIO: 7,
            USUARIO: 'admin01',
            ROL: 'administrador',
            NOMBRES: 'Ana',
            APELLIDO_PATERNO: 'López',
            APELLIDO_MATERNO: 'García',
            CONTRASENA_HASH: 'hashed-password',
          },
        ],
      })) as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);
    mockCompare.mockResolvedValueOnce(false);

    const repository = new OracleUsuarioRepository();

    await expect(
      repository.loginUsuario({
        usuario: 'admin01',
        contrasena: 'incorrecta',
      })
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(mockCompare).toHaveBeenCalledWith('incorrecta', 'hashed-password');
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test('loginUsuario cierra conexión aunque falle la consulta', async () => {
    const connection = createConnection({
      execute: jest.fn(async () => {
        throw new Error('Error al consultar usuario');
      }) as ExecuteMock,
    });

    mockGetConnection.mockResolvedValueOnce(connection);

    const repository = new OracleUsuarioRepository();

    await expect(
      repository.loginUsuario({
        usuario: 'admin01',
        contrasena: 'Password123',
      })
    ).rejects.toThrow('Error al consultar usuario');

    expect(connection.close).toHaveBeenCalledTimes(1);
  });
});