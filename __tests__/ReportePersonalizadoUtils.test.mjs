import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule(
  '../client/src/components/reportes/ReportePersonalizado/reportePersonalizadoConstants.js',
  () => ({
    METRICA_OPTIONS: [
      { id: 'servicios', label: 'Servicios otorgados' },
      { id: 'nuevos', label: 'Nuevos beneficiarios' },
      { id: 'demograficos', label: 'Datos demográficos' },
    ],
  })
);

jest.unstable_mockModule(
  '../client/src/components/reportes/ReportePersonalizado/reportePersonalizadoConstants',
  () => ({
    METRICA_OPTIONS: [
      { id: 'servicios', label: 'Servicios otorgados' },
      { id: 'nuevos', label: 'Nuevos beneficiarios' },
      { id: 'demograficos', label: 'Datos demográficos' },
    ],
  })
);

const utils = await import(
  '../client/src/components/reportes/ReportePersonalizado/reportePersonalizado.utils.js'
);

const {
  GRANULARIDAD_SERVICIOS,
  diasEnRangoInclusive,
  resolverGranularidadServicios,
  lunesSemanaLocal,
  construirSerieServiciosVista,
  tituloServiciosPorGranularidad,
  formatNumber,
  defaultRangoMesActual,
  formatRangoLegible,
  esRangoFechaValido,
  filtrarDistribucionPorClaves,
  resolverSeleccion,
  textoMetricas,
} = utils;

describe('reportePersonalizado.utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-15T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('diasEnRangoInclusive calcula días incluyendo inicio y fin', () => {
    expect(diasEnRangoInclusive('2026-06-01', '2026-06-01')).toBe(1);
    expect(diasEnRangoInclusive('2026-06-01', '2026-06-05')).toBe(5);
  });

  test('diasEnRangoInclusive devuelve 0 si el rango es inválido', () => {
    expect(diasEnRangoInclusive('', '2026-06-05')).toBe(0);
    expect(diasEnRangoInclusive('2026-06-10', '2026-06-05')).toBe(0);
  });

  test('resolverGranularidadServicios usa día para rangos cortos', () => {
    expect(resolverGranularidadServicios('2026-06-01', '2026-06-30')).toBe(
      GRANULARIDAD_SERVICIOS.DIA
    );
  });

  test('resolverGranularidadServicios usa semana para rangos medianos', () => {
    expect(resolverGranularidadServicios('2026-06-01', '2026-07-20')).toBe(
      GRANULARIDAD_SERVICIOS.SEMANA
    );
  });

  test('resolverGranularidadServicios usa mes para rangos largos', () => {
    expect(resolverGranularidadServicios('2026-01-01', '2026-06-30')).toBe(
      GRANULARIDAD_SERVICIOS.MES
    );
  });

  test('lunesSemanaLocal obtiene el lunes de la semana', () => {
    expect(lunesSemanaLocal('2026-06-03')).toBe('2026-06-01');
    expect(lunesSemanaLocal('2026-06-07')).toBe('2026-06-01');
  });

  test('construirSerieServiciosVista devuelve arreglo vacío si no recibe datos válidos', () => {
    expect(construirSerieServiciosVista([], GRANULARIDAD_SERVICIOS.DIA)).toEqual([]);
    expect(construirSerieServiciosVista(null, GRANULARIDAD_SERVICIOS.DIA)).toEqual([]);
  });

  test('construirSerieServiciosVista construye serie diaria ordenada', () => {
    const result = construirSerieServiciosVista(
      [
        { fecha: '2026-06-03', conteo: 2 },
        { fecha: '2026-06-01', conteo: 5 },
      ],
      GRANULARIDAD_SERVICIOS.DIA
    );

    expect(result).toEqual([
      {
        fecha: '2026-06-01',
        conteo: 5,
        chartKey: '2026-06-01',
        chartLabel: '06-01',
        bucketInicio: '2026-06-01',
        bucketFin: '2026-06-01',
        granularidad: 'dia',
      },
      {
        fecha: '2026-06-03',
        conteo: 2,
        chartKey: '2026-06-03',
        chartLabel: '06-03',
        bucketInicio: '2026-06-03',
        bucketFin: '2026-06-03',
        granularidad: 'dia',
      },
    ]);
  });

  test('construirSerieServiciosVista agrupa servicios por semana', () => {
    const result = construirSerieServiciosVista(
      [
        { fecha: '2026-06-01', conteo: 2 },
        { fecha: '2026-06-03', conteo: 3 },
        { fecha: '2026-06-09', conteo: 4 },
      ],
      GRANULARIDAD_SERVICIOS.SEMANA
    );

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual(
      expect.objectContaining({
        chartKey: 'w-2026-06-01',
        conteo: 5,
        bucketInicio: '2026-06-01',
        bucketFin: '2026-06-07',
        granularidad: 'semana',
      })
    );

    expect(result[1]).toEqual(
      expect.objectContaining({
        chartKey: 'w-2026-06-08',
        conteo: 4,
        bucketInicio: '2026-06-08',
        bucketFin: '2026-06-14',
        granularidad: 'semana',
      })
    );
  });

  test('construirSerieServiciosVista agrupa servicios por mes', () => {
    const result = construirSerieServiciosVista(
      [
        { fecha: '2026-06-01', conteo: 2 },
        { fecha: '2026-06-15', conteo: 3 },
        { fecha: '2026-07-01', conteo: 4 },
      ],
      GRANULARIDAD_SERVICIOS.MES
    );

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual(
      expect.objectContaining({
        chartKey: 'm-2026-06',
        conteo: 5,
        bucketInicio: '2026-06-01',
        bucketFin: '2026-06-30',
        granularidad: 'mes',
      })
    );

    expect(result[1]).toEqual(
      expect.objectContaining({
        chartKey: 'm-2026-07',
        conteo: 4,
        bucketInicio: '2026-07-01',
        bucketFin: '2026-07-31',
        granularidad: 'mes',
      })
    );
  });

  test('tituloServiciosPorGranularidad devuelve el título correcto', () => {
    expect(tituloServiciosPorGranularidad(GRANULARIDAD_SERVICIOS.DIA)).toBe(
      'Servicios otorgados por día'
    );

    expect(tituloServiciosPorGranularidad(GRANULARIDAD_SERVICIOS.SEMANA)).toBe(
      'Servicios otorgados por semana'
    );

    expect(tituloServiciosPorGranularidad(GRANULARIDAD_SERVICIOS.MES)).toBe(
      'Servicios otorgados por mes'
    );
  });

  test('formatNumber convierte números al formato es-MX', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(null)).toBe('0');
  });

  test('defaultRangoMesActual devuelve el primer y último día del mes actual', () => {
    expect(defaultRangoMesActual()).toEqual({
      desde: '2026-06-01',
      hasta: '2026-06-30',
    });
  });

  test('formatRangoLegible devuelve texto legible para fechas válidas', () => {
    const result = formatRangoLegible('2026-06-01', '2026-06-30');

    expect(result).toContain('2026');
    expect(result).toContain('—');
  });

  test('formatRangoLegible devuelve vacío si faltan fechas', () => {
    expect(formatRangoLegible('', '2026-06-30')).toBe('');
    expect(formatRangoLegible('2026-06-01', '')).toBe('');
  });

  test('formatRangoLegible devuelve rango original si las fechas son inválidas', () => {
    expect(formatRangoLegible('fecha-mal', 'otra-fecha')).toBe('fecha-mal — otra-fecha');
  });

  test('esRangoFechaValido valida formato y orden de fechas', () => {
    expect(esRangoFechaValido('2026-06-01', '2026-06-30')).toBe(true);
    expect(esRangoFechaValido('2026-06-30', '2026-06-01')).toBe(false);
    expect(esRangoFechaValido('06-01-2026', '2026-06-30')).toBe(false);
  });

  test('filtrarDistribucionPorClaves filtra filas y recalcula porcentajes', () => {
    const result = filtrarDistribucionPorClaves(
      [
        { key: 'F', label: 'Femenino', value: 30 },
        { key: 'M', label: 'Masculino', value: 10 },
        { key: 'O', label: 'Otro', value: 10 },
      ],
      new Set(['F', 'M'])
    );

    expect(result).toEqual([
      {
        key: 'F',
        label: 'Femenino',
        value: 30,
        porcentaje: 75,
      },
      {
        key: 'M',
        label: 'Masculino',
        value: 10,
        porcentaje: 25,
      },
    ]);
  });

  test('filtrarDistribucionPorClaves devuelve arreglo vacío si la selección no es Set o está vacía', () => {
    expect(filtrarDistribucionPorClaves([{ key: 'F', value: 1 }], null)).toEqual([]);
    expect(filtrarDistribucionPorClaves([{ key: 'F', value: 1 }], new Set())).toEqual([]);
  });

  test('resolverSeleccion devuelve todas las claves cuando selección es null', () => {
    const result = resolverSeleccion(
      [
        { key: 'F', value: 10 },
        { key: 'M', value: 5 },
      ],
      null
    );

    expect(result).toEqual(new Set(['F', 'M']));
  });

  test('resolverSeleccion elimina claves que no existen en las filas', () => {
    const result = resolverSeleccion(
      [
        { key: 'F', value: 10 },
        { key: 'M', value: 5 },
      ],
      new Set(['F', 'NO_EXISTE'])
    );

    expect(result).toEqual(new Set(['F']));
  });

  test('textoMetricas convierte ids conocidos a etiquetas', () => {
    const result = textoMetricas(new Set(['servicios', 'nuevos', 'demograficos']));

    expect(result).toBe(
      'Servicios otorgados, Nuevos beneficiarios, Datos demográficos'
    );
  });

  test('textoMetricas conserva el id si no encuentra etiqueta', () => {
    const result = textoMetricas(new Set(['servicios', 'otra_metrica']));

    expect(result).toBe('Servicios otorgados, otra_metrica');
  });
});