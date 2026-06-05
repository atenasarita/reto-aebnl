/**
 * @jest-environment node
 */

import { jest, describe, test, expect, beforeEach, beforeAll, afterEach } from "@jest/globals";

const mockGenerateNextBeneficiarioFolio = jest.fn() as any;

const mockGetConnection = jest.fn() as any;



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
  OracleConnection: jest.fn().mockImplementation(() => ({
    getConnection: mockGetConnection,
  })),
}));

jest.unstable_mockModule("../../server/src/utils/beneficiarioFolio", () => ({
  generateNextBeneficiarioFolio: mockGenerateNextBeneficiarioFolio,
}));

let OracleBeneficiarioRepository: any;

beforeAll(async () => {
  const module = await import("../../server/src/repositories/beneficiario.repository");
  OracleBeneficiarioRepository = module.OracleBeneficiarioRepository;
});

const createMockConnection = () => ({
  execute: jest.fn() as any,
  commit: jest.fn() as any,
  rollback: jest.fn() as any,
  close: jest.fn() as any,
});

const createRepository = (connection: any) => {
  const oracleConnectionMock = {
    getConnection: jest.fn(async () => connection),
  };

  return new OracleBeneficiarioRepository(oracleConnectionMock as any);
};

const baseBeneficiarioRow = (overrides: Record<string, any> = {}) => ({
  ID_BENEFICIARIO: 1,
  FOLIO: "BEN-001",
  FECHA_INGRESO: "2026-06-04",
  GENERO: "femenino",
  ESTADO: "activo",
  CURP: "CURP123",
  NOMBRES: "Ana",
  APELLIDO_PATERNO: "López",
  APELLIDO_MATERNO: "García",
  FECHA_NACIMIENTO: "2010-01-15",
  ESTADO_NACIMIENTO: "Nuevo León",
  FOTOGRAFIA: "foto.png",
  TELEFONO: "8111111111",
  EMAIL: "ana@test.com",
  CONTACTO_NOMBRE: "Mamá Ana",
  CONTACTO_TELEFONO: "8122222222",
  CONTACTO_PARENTESCO: "Madre",
  ALERGIAS: "Ninguna",
  TIPO_SANGUINEO: "O+",
  VALVULA: 1,
  HOSPITAL: "Hospital Central",
  DOMICILIO_CALLE: "Calle 1",
  DOMICILIO_CP: "64000",
  DOMICILIO_CIUDAD: "Monterrey",
  DOMICILIO_ESTADO: "Nuevo León",
  DIAS_PARA_VENCER: 20,
  ID_MEMBRESIA: 10,
  PRECIO: 500,
  FECHA_INICIO: "2026-06-01",
  FECHA_FIN: "2026-06-30",
  MEMBRESIA_ESTADO: "activa",
  METODO_PAGO: "efectivo",
  ...overrides,
});

const identificadoresInput = {
  CURP: "CURP123",
  nombres: "Ana",
  apellido_paterno: "López",
  apellido_materno: "García",
  fecha_nacimiento: "2010-01-15",
  estado_nacimiento: "Nuevo León",
  fotografia: undefined,
  telefono: undefined,
  email: undefined,
};

const datosMedicosInput = {
  contacto_nombre: "Mamá Ana",
  contacto_telefono: "8122222222",
  contacto_parentesco: "Madre",
  alergias: "Ninguna",
  tipo_sanguineo: "O+",
  valvula: true,
  hospital: undefined,
};

const direccionInput = {
  domicilio_calle: "Calle 1",
  domicilio_cp: "64000",
  domicilio_ciudad: "Monterrey",
  domicilio_estado: "Nuevo León",
};

describe("OracleBeneficiarioRepository", () => {
  let connection: any;
  let repository: any;

  beforeEach(() => {
    connection = createMockConnection();
    mockGetConnection.mockResolvedValue(connection);
    repository = new OracleBeneficiarioRepository();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getBeneficiarios debe refrescar membresías, consultar beneficiarios, hidratar espinas y cerrar conexión", async () => {
    connection.execute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [baseBeneficiarioRow()] })
      .mockResolvedValueOnce({
        rows: [
          {
            ID_BENEFICIARIO: 1,
            ID_ESPINA: 2,
            NOMBRE: "Mielomeningocele",
          },
        ],
      });

    const result = await repository.getBeneficiarios();

    expect(result).toHaveLength(1);
    expect(result[0].id_beneficiario).toBe(1);
    expect(result[0].folio).toBe("BEN-001");
    expect(result[0].tipo_espina).toEqual([
      {
        id_espina: 2,
        nombre: "Mielomeningocele",
      },
    ]);
    expect(result[0].membresia).toEqual({
      id_membresia: 10,
      precio: 500,
      fecha_inicio: "2026-06-01",
      fecha_fin: "2026-06-30",
      estado: "activa",
      metodo_pago: "efectivo",
    });
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getBeneficiarios debe manejar campos nulos con valores por defecto", async () => {
    connection.execute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rows: [
          baseBeneficiarioRow({
            GENERO: null,
            NOMBRES: null,
            APELLIDO_PATERNO: null,
            APELLIDO_MATERNO: null,
            FECHA_NACIMIENTO: null,
            ESTADO_NACIMIENTO: null,
            FOTOGRAFIA: null,
            TELEFONO: null,
            EMAIL: null,
            CONTACTO_NOMBRE: null,
            CONTACTO_TELEFONO: null,
            CONTACTO_PARENTESCO: null,
            ALERGIAS: null,
            TIPO_SANGUINEO: "INVALIDO",
            VALVULA: 0,
            HOSPITAL: null,
            DOMICILIO_CALLE: null,
            DOMICILIO_CP: null,
            DOMICILIO_CIUDAD: null,
            DOMICILIO_ESTADO: null,
            ID_MEMBRESIA: null,
          }),
        ],
      })
      .mockResolvedValueOnce({ rows: [] });

    const result = await repository.getBeneficiarios();

    expect(result[0].genero).toBe("otro");
    expect(result[0].identificadores.nombres).toBe("");
    expect(result[0].datos_medicos.tipo_sanguineo).toBe("O+");
    expect(result[0].datos_medicos.valvula).toBe(false);
    expect(result[0].membresia).toBeNull();
    expect(result[0].tipo_espina).toEqual([]);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getBeneficiarioById debe lanzar NotFoundError cuando no encuentra registros", async () => {
    connection.execute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] });

    await expect(repository.getBeneficiarioById(99)).rejects.toThrow(
      "Beneficiario no encontrado."
    );

    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getBeneficiarioByFolio debe regresar un beneficiario cuando existe", async () => {
    connection.execute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [baseBeneficiarioRow({ FOLIO: "BEN-777" })] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await repository.getBeneficiarioByFolio("BEN-777");

    expect(result.folio).toBe("BEN-777");
    expect(result.tipo_espina).toEqual([]);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getBeneficiariosWithMembresiaEndingSoon debe regresar [] si no hay membresías próximas", async () => {
    connection.execute.mockResolvedValueOnce({ rows: [] });

    const result = await repository.getBeneficiariosWithMembresiaEndingSoon();

    expect(result).toEqual([]);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getBeneficiariosWithMembresiaEndingSoon debe mapear membresía próxima con datos de membresía", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            ...baseBeneficiarioRow(),
            MEMBRESIA_PRECIO: 900,
            MEMBRESIA_FECHA_INICIO: "2026-06-01",
            MEMBRESIA_FECHA_FIN: "2026-08-31",
            MEMBRESIA_ESTADO: "activa",
            MEMBRESIA_METODO_PAGO: "tarjeta",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            ID_BENEFICIARIO: 1,
            ID_ESPINA: 3,
            NOMBRE: "Lipomeningocele",
          },
        ],
      });

    const result = await repository.getBeneficiariosWithMembresiaEndingSoon();

    expect(result).toHaveLength(1);
    expect(result[0].membresia).toEqual({
      id_membresia: 10,
      precio: 900,
      fecha_inicio: "2026-06-01",
      fecha_fin: "2026-08-31",
      estado: "activa",
      metodo_pago: "tarjeta",
    });
    expect(result[0].tipo_espina).toEqual([
      {
        id_espina: 3,
        nombre: "Lipomeningocele",
      },
    ]);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getMembresiasProximas debe reutilizar getBeneficiariosWithMembresiaEndingSoon", async () => {
    connection.execute.mockResolvedValueOnce({ rows: [] });

    const result = await repository.getMembresiasProximas();

    expect(result).toEqual([]);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createBeneficiario debe crear beneficiario completo, insertar espinas, datos relacionados, membresía y hacer commit", async () => {
    connection.execute
      .mockResolvedValueOnce({ outBinds: { id_beneficiario: [50] } })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ outBinds: { id_identificadores: [60] } })
      .mockResolvedValueOnce({ outBinds: { id_datos_medicos: [70] } })
      .mockResolvedValueOnce({ outBinds: { id_direccion: [80] } })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    const input = {
      folio: "BEN-050",
      fecha_ingreso: "2026-06-04",
      genero: "femenino",
      tipo_espinas: [1, 2],
      identificadores: identificadoresInput,
      datos_medicos: datosMedicosInput,
      direccion: direccionInput,
      membresia: {
        precio_mensual: 300,
        meses: 2,
        fecha_inicio: "2099-01-01",
        metodo_pago: "efectivo",
      },
    };

    const result = await repository.createBeneficiario(input);

    expect(result).toEqual({
      id_beneficiario: 50,
      folio: "BEN-050",
      fecha_ingreso: "2026-06-04",
      genero: "femenino",
      tipo_espinas: [1, 2],
      estado: "activo",
    });
    expect(connection.execute).toHaveBeenCalledTimes(8);
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createBeneficiario debe generar folio si no viene en el input", async () => {
    mockGenerateNextBeneficiarioFolio.mockResolvedValue("BEN-GEN");

    connection.execute
      .mockResolvedValueOnce({ outBinds: { id_beneficiario: [51] } })
      .mockResolvedValueOnce({ outBinds: { id_identificadores: [61] } })
      .mockResolvedValueOnce({ outBinds: { id_datos_medicos: [71] } })
      .mockResolvedValueOnce({ outBinds: { id_direccion: [81] } })
      .mockResolvedValueOnce({});

    const input = {
      fecha_ingreso: "2026-06-04",
      genero: "masculino",
      tipo_espinas: [],
      identificadores: identificadoresInput,
      datos_medicos: datosMedicosInput,
      direccion: direccionInput,
    };

    const result = await repository.createBeneficiario(input);

    expect(mockGenerateNextBeneficiarioFolio).toHaveBeenCalledWith(connection);
    expect(result.folio).toBe("BEN-GEN");
    expect(result.estado).toBe("inactivo");
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createBeneficiario debe hacer rollback y lanzar ConflictError cuando Oracle regresa ORA-00001", async () => {
    connection.execute.mockRejectedValueOnce({ code: "ORA-00001" });

    const input = {
      folio: "BEN-001",
      fecha_ingreso: "2026-06-04",
      genero: "femenino",
      tipo_espinas: [],
      identificadores: identificadoresInput,
      datos_medicos: datosMedicosInput,
      direccion: direccionInput,
    };

    await expect(repository.createBeneficiario(input)).rejects.toThrow(
      "Ya existe un registro con datos unicos de beneficiario."
    );

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createIdentificadores debe insertar identificadores, regresar valores por defecto y hacer commit", async () => {
    connection.execute.mockResolvedValueOnce({
      outBinds: {
        id_identificadores: [22],
      },
    });

    const result = await repository.createIdentificadores(1, identificadoresInput);

    expect(result).toEqual({
      id_identificadores: 22,
      id_beneficiario: 1,
      CURP: "CURP123",
      nombres: "Ana",
      apellido_paterno: "López",
      apellido_materno: "García",
      fecha_nacimiento: "2010-01-15",
      estado_nacimiento: "Nuevo León",
      fotografia: "",
      telefono: "",
      email: "",
    });
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createIdentificadores debe hacer rollback y lanzar conflicto cuando la CURP ya existe", async () => {
    connection.execute.mockRejectedValueOnce({ code: "ORA-00001" });

    await expect(repository.createIdentificadores(1, identificadoresInput)).rejects.toThrow(
      "La CURP o el identificador del beneficiario ya existe."
    );

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createDatosMedicos debe insertar datos médicos con padres y hacer commit", async () => {
    connection.execute
      .mockResolvedValueOnce({
        outBinds: {
          id_datos_medicos: [33],
        },
      })
      .mockResolvedValueOnce({});

    const result = await repository.createDatosMedicos(1, {
      ...datosMedicosInput,
      hospital: "Hospital Central",
      padres: [
        {
          tipo_padre: "madre",
          nombre_completo: "María López",
          fecha_nacimiento: "1980-01-01",
          email: "maria@test.com",
          telefono: "8111111111",
          telefono_casa: undefined,
          telefono_trabajo: undefined,
        },
      ],
    });

    expect(result).toEqual({
      id_datos_medicos: 33,
      id_beneficiario: 1,
      contacto_nombre: "Mamá Ana",
      contacto_telefono: "8122222222",
      contacto_parentesco: "Madre",
      alergias: "Ninguna",
      tipo_sanguineo: "O+",
      valvula: true,
      hospital: "Hospital Central",
    });
    expect(connection.execute).toHaveBeenCalledTimes(2);
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createDatosMedicos debe hacer rollback y lanzar conflicto cuando ya existen datos médicos", async () => {
    connection.execute.mockRejectedValueOnce({ code: "ORA-00001" });

    await expect(repository.createDatosMedicos(1, datosMedicosInput)).rejects.toThrow(
      "Ya existe informacion medica para este beneficiario."
    );

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createDireccion debe insertar dirección y hacer commit", async () => {
    connection.execute.mockResolvedValueOnce({
      outBinds: {
        id_direccion: [44],
      },
    });

    const result = await repository.createDireccion(1, direccionInput);

    expect(result).toEqual({
      id_direccion: 44,
      id_beneficiario: 1,
      domicilio_calle: "Calle 1",
      domicilio_cp: "64000",
      domicilio_ciudad: "Monterrey",
      domicilio_estado: "Nuevo León",
    });
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("createDireccion debe hacer rollback y lanzar conflicto cuando ya existe dirección", async () => {
    connection.execute.mockRejectedValueOnce({ code: "ORA-00001" });

    await expect(repository.createDireccion(1, direccionInput)).rejects.toThrow(
      "Ya existe direccion para este beneficiario."
    );

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("updateBeneficiario debe actualizar identificadores, beneficiario, datos médicos y dirección", async () => {
    connection.execute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await repository.updateBeneficiario(1, {
      nombres: "Ana",
      apellido_paterno: "López",
      apellido_materno: "García",
      CURP: "CURP123",
      fecha_nacimiento: "2010-01-15",
      estado_nacimiento: "Nuevo León",
      telefono: "8111111111",
      email: "ana@test.com",
      genero: "femenino",
      contacto_nombre: "Mamá Ana",
      contacto_telefono: "8122222222",
      contacto_parentesco: "Madre",
      tipo_sanguineo: "O+",
      hospital: "Hospital Central",
      domicilio_calle: "Calle 1",
      domicilio_ciudad: "Monterrey",
      domicilio_estado: "Nuevo León",
      domicilio_cp: "64000",
    });

    expect(connection.execute).toHaveBeenCalledTimes(4);
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("updateBeneficiario debe hacer rollback si falla alguna actualización", async () => {
    const error = new Error("Error al actualizar");
    connection.execute.mockRejectedValueOnce(error);

    await expect(repository.updateBeneficiario(1, {})).rejects.toThrow("Error al actualizar");

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("updatePadres debe actualizar padre y madre cuando existen datos médicos", async () => {
    connection.execute
      .mockResolvedValueOnce({
        rows: [
          {
            ID_DATOS_MEDICOS: 77,
          },
        ],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await repository.updatePadres(1, {
      padre_nombre_completo: "Juan López",
      padre_fecha_nacimiento: "1979-01-01",
      padre_email: "juan@test.com",
      padre_telefono: "8111111111",
      padre_tel_casa: "8122222222",
      padre_tel_trabajo: "8133333333",
      madre_nombre_completo: "María García",
      madre_fecha_nacimiento: "1980-01-01",
      madre_email: "maria@test.com",
      madre_telefono: "8144444444",
      madre_tel_casa: "8155555555",
      madre_tel_trabajo: "8166666666",
    });

    expect(connection.execute).toHaveBeenCalledTimes(3);
    expect(connection.execute.mock.calls[1][1]).toMatchObject({
      id_datos_medicos: 77,
      tipo_padre: "padre",
      nombre_completo: "Juan López",
    });
    expect(connection.execute.mock.calls[2][1]).toMatchObject({
      id_datos_medicos: 77,
      tipo_padre: "madre",
      nombre_completo: "María García",
    });
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("updatePadres debe lanzar NotFoundError si no existen datos médicos", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    connection.execute.mockResolvedValueOnce({
      rows: [],
    });

    await expect(repository.updatePadres(1, {})).rejects.toThrow(
      "No se encontraron datos médicos para este beneficiario."
    );

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getPadresByBeneficiarioId debe regresar [] cuando Oracle no devuelve rows", async () => {
    connection.execute.mockResolvedValueOnce({});

    const result = await repository.getPadresByBeneficiarioId(1);

    expect(result).toEqual([]);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getPadresByBeneficiarioId debe mapear los padres del beneficiario", async () => {
    connection.execute.mockResolvedValueOnce({
      rows: [
        {
          ID_PADRE: 1,
          ID_DATOS_MEDICOS: 20,
          TIPO_PADRE: "madre",
          NOMBRE_COMPLETO: "María García",
          FECHA_NACIMIENTO: "1980-01-01",
          EMAIL: "maria@test.com",
          TELEFONO: "8111111111",
          TELEFONO_CASA: "8122222222",
          TELEFONO_TRABAJO: "8133333333",
        },
      ],
    });

    const result = await repository.getPadresByBeneficiarioId(1);

    expect(result).toEqual([
      {
        id_padre: 1,
        id_datos_medicos: 20,
        tipo_padre: "madre",
        nombre_completo: "María García",
        fecha_nacimiento: "1980-01-01",
        email: "maria@test.com",
        telefono: "8111111111",
        telefono_casa: "8122222222",
        telefono_trabajo: "8133333333",
      },
    ]);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("refreshExpiredMembresias debe actualizar membresías vencidas, beneficiarios inactivos y cerrar conexión", async () => {
    connection.execute.mockResolvedValue({});

    await repository.refreshExpiredMembresias();

    expect(connection.execute).toHaveBeenCalledTimes(2);
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("getSiguienteFolio debe regresar el folio generado y cerrar conexión", async () => {
    mockGenerateNextBeneficiarioFolio.mockResolvedValue("BEN-999");

    const result = await repository.getSiguienteFolio();

    expect(result).toBe("BEN-999");
    expect(mockGenerateNextBeneficiarioFolio).toHaveBeenCalledWith(connection);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });
});