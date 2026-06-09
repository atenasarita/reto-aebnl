import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Ensure a mocked localStorage exists before importing modules that may
// read it at runtime — this prevents "No hay sesión activa" errors when
// tests run together.
global.localStorage = {
  getItem: jest.fn().mockReturnValue('token-123'),
};

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  API_URL: 'http://localhost:3000',
}));

// Mock auth utilities so getValidToken returns a usable value for tests
jest.unstable_mockModule('../client/src/utils/auth.js', () => ({
  getValidToken: () => 'token-123',
  handleUnauthorizedResponse: () => false,
  authFetch: async () => ({ ok: true, json: async () => ({}) }),
}));

const reportesService = await import('../client/src/services/reportesService.js');
const {
  getReporteGeneral,
  getReporteMensual,
  getReporteAnual,
  getReportePeriodo,
  getReporteInventario,
} = reportesService;

let fetchMock;

describe('reportesService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token-mock');
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    global.localStorage = {
      getItem: jest.fn().mockReturnValue('token-123'),
    };
  });

  afterEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  describe('getReporteGeneral', () => {
    test('normaliza el reporte general correctamente', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          beneficiarios_activos: '2',
          beneficiarios_inactivos: '1',
          beneficiarios_por_genero: [
            { genero: 'femenino', conteo: '2', porcentaje: '66' },
            { genero: 'masculino', conteo: '1' },
          ],
          beneficiarios_por_etapa_vida: [
            { codigo: 'infancia_0_12', conteo: '2' },
            { codigo: 'adultez_18_59', conteo: '1' },
          ],
          beneficiarios_por_estado: [
            { estado: 'CDMX', conteo: '2', porcentaje: '67' },
            { estado: 'Jalisco', conteo: '1' },
          ],
        }),
      });

      const result = await getReporteGeneral();

      expect(result.totalBeneficiarios).toBe(3);
      expect(result.beneficiariosActivos).toBe(2);
      expect(result.beneficiariosInactivos).toBe(1);
      expect(result.distribucionGenero).toEqual([
        { key: 'femenino', label: 'Femenino', value: 2, porcentaje: 66 },
        { key: 'masculino', label: 'Masculino', value: 1, porcentaje: 33 },
      ]);
      expect(result.distribucionEtapaVida).toEqual([
        { key: 'infancia_0_12', label: 'Infancia (0-12 años)', value: 2, porcentaje: 67 },
        { key: 'adultez_18_59', label: 'Adultez (18-59 años)', value: 1, porcentaje: 33 },
      ]);
      expect(result.distribucionEstado).toEqual([
        { key: 'CDMX', label: 'Cdmx', value: 2, porcentaje: 67 },
        { key: 'Jalisco', label: 'Jalisco', value: 1, porcentaje: 33 },
      ]);
    });

    test('lanza error cuando la respuesta no es ok', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Error interno' }),
      });

      await expect(getReporteGeneral()).rejects.toThrow('Error interno');
    });
  });

  describe('getReporteMensual', () => {
    test('normaliza el reporte mensual y genera el nombre del mes', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          mes: '3',
          anio: '2025',
          periodo: { desde: '2025-03-01', hasta: '2025-03-31' },
          nuevos_beneficiarios: '4',
          beneficiarios_atendidos: '5',
          servicios_periodo: '6',
          servicios_por_dia: [
            { fecha: '2025-03-10', conteo: '3' },
          ],
          beneficiarios_por_genero: [
            { genero: 'masculino', conteo: '5' },
          ],
          beneficiarios_por_etapa_vida: [
            { codigo: 'adultez_18_59', conteo: '5' },
          ],
          beneficiarios_por_estado: [
            { estado: 'Nuevo León', conteo: '5' },
          ],
        }),
      });

      const result = await getReporteMensual(3, 2025);

      expect(result.mes).toBe(3);
      expect(result.anio).toBe(2025);
      expect(result.mesNombre).toBe('Marzo');
      expect(result.periodo).toEqual({ desde: '2025-03-01', hasta: '2025-03-31' });
      expect(result.serviciosPorDia).toEqual([
        { fecha: '2025-03-10', dia: 10, diaLabel: '10', conteo: 3 },
      ]);
    });
  });

  describe('getReporteAnual', () => {
    test('normaliza el reporte anual y convierte mes a etiqueta', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          anio: '2024',
          periodo: { desde: '2024-01-01', hasta: '2024-12-31' },
          nuevos_beneficiarios: '7',
          beneficiarios_atendidos: '8',
          servicios_periodo: '9',
          por_mes: [
            { mes: '1', servicios_otorgados: '10', nuevos_beneficiarios: '2' },
          ],
          beneficiarios_por_genero: [
            { genero: 'otro', conteo: '1' },
          ],
          beneficiarios_por_etapa_vida: [
            { codigo: 'adulto_mayor_60_mas', conteo: '1' },
          ],
          beneficiarios_por_estado: [
            { estado: 'sin_estado', conteo: '1' },
          ],
        }),
      });

      const result = await getReporteAnual(2024);

      expect(result.anio).toBe(2024);
      expect(result.periodo).toEqual({ desde: '2024-01-01', hasta: '2024-12-31' });
      expect(result.porMes).toEqual([
        { mes: 1, mesLabel: 'Enero', servicios: 10, nuevosBeneficiarios: 2 },
      ]);
      expect(result.distribucionEstado[0].label).toBe('Sin estado');
    });
  });

  describe('getReportePeriodo', () => {
    test('normaliza el reporte por periodo y conserva fechas', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          periodo: { desde: '2025-01-01', hasta: '2025-01-31' },
          citas_periodo: '12',
          nuevos_beneficiarios: '13',
          beneficiarios_atendidos: '14',
          servicios_periodo: '15',
          servicios_por_dia: [
            { fecha: '2025-01-05', dia: '5', conteo: '7' },
          ],
          beneficiarios_por_genero: [],
          beneficiarios_por_etapa_vida: [],
          beneficiarios_por_estado: [],
        }),
      });

      const result = await getReportePeriodo('2025-01-01', '2025-01-31');

      expect(result.periodo).toEqual({ desde: '2025-01-01', hasta: '2025-01-31' });
      expect(result.citasPeriodo).toBe(12);
      expect(result.serviciosPorDia).toEqual([
        { fecha: '2025-01-05', dia: 5, diaLabel: '01-05', conteo: 7 },
      ]);
    });
  });

  describe('getReporteInventario', () => {
    test('normaliza el reporte de inventario con categorias y movimientos', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          periodo: { desde: '2025-02-01', hasta: '2025-02-28' },
          articulos_activos: '20',
          productos_bajo_stock: '3',
          valor_inventario: '4000',
          entradas_unidades: '100',
          salidas_unidades: '40',
          movimientos_registrados: '12',
          productos_por_categoria: [
            { id_categoria: '1', descripcion: 'Medicinas', productos: '8', unidades: '100', valor: '1200' },
            { id_categoria: '2', descripcion: 'Insumos', productos: '2', unidades: '40', valor: '800' },
          ],
          movimientos_por_dia: [
            { fecha: '2025-02-10', entradas: '5', salidas: '2', movimientos: '7' },
          ],
          historial: [
            { id_movimiento: '1', fecha: '2025-02-10', clave: 'A1', nombre: 'Item', tipo_movimiento: 'entrada', cantidad: '5', cant_anterior: '10', cant_nueva: '15', motivo: 'Compra', usuario: 'admin' },
          ],
          lista_productos_bajo_stock: [
            { id_inventario: '99', clave: 'B2', nombre: 'Insumo', cantidad: '2', unidad_medida: 'Pza', descripcion_categoria: 'Insumos' },
          ],
        }),
      });

      const result = await getReporteInventario('2025-02-01', '2025-02-28');

      expect(result.articulosActivos).toBe(20);
      expect(result.productosBajoStock).toBe(3);
      expect(result.valorInventario).toBe(4000);
      expect(result.productosPorCategoria).toEqual([
        { key: '1', label: 'Medicinas', value: 8, unidades: 100, valor: 1200, porcentaje: 80 },
        { key: '2', label: 'Insumos', value: 2, unidades: 40, valor: 800, porcentaje: 20 },
      ]);
      expect(result.movimientosPorDia).toEqual([
        { fecha: '2025-02-10', diaLabel: '02-10', entradas: 5, salidas: 2, movimientos: 7 },
      ]);
      expect(result.historial[0].tipoLabel).toBe('Entrada');
      expect(result.listaBajoStock[0]).toEqual({
        id: 99,
        clave: 'B2',
        nombre: 'Insumo',
        cantidad: 2,
        unidadMedida: 'Pza',
        categoria: 'Insumos',
      });
    });
  });
});
