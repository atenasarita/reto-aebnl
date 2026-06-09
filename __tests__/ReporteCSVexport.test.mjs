/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule('../client/src/components/reportes/ReportePersonalizado/reportePersonalizadoConstants.js', () => ({
  METRICA_OPTIONS: [
    { id: 'servicios', label: 'Servicios otorgados' },
    { id: 'nuevos', label: 'Nuevos beneficiarios' },
    { id: 'demograficos', label: 'Datos demográficos' },
  ],
}));

jest.unstable_mockModule('../client/src/components/reportes/ReportePersonalizado/reportePersonalizadoConstants', () => ({
  METRICA_OPTIONS: [
    { id: 'servicios', label: 'Servicios otorgados' },
    { id: 'nuevos', label: 'Nuevos beneficiarios' },
    { id: 'demograficos', label: 'Datos demográficos' },
  ],
}));

const csvUtils = await import('../client/src/utils/reportesCsvExport.js');

const {
  escapeCsvCell,
  buildCsv,
  triggerCsvDownload,
  sanitizeFilenamePart,
  exportTimestampSlug,
  buildCsvReporteGeneral,
  buildCsvReporteMensual,
  buildCsvReportePersonalizado,
  buildCsvReporteInventarioHistorial,
  buildCsvReporteAnual,
  buildCsvReporteDonaciones,
} = csvUtils;

function sinBom(csv) {
  return csv.replace(/^\uFEFF/, '');
}

describe('reportesCsvExport utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-04T09:15:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('escapeCsvCell devuelve texto normal cuando no hay caracteres especiales', () => {
    expect(escapeCsvCell('Consulta')).toBe('Consulta');
    expect(escapeCsvCell(123)).toBe('123');
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });

  test('escapeCsvCell escapa comas, saltos de línea y comillas', () => {
    expect(escapeCsvCell('Hola, mundo')).toBe('"Hola, mundo"');
    expect(escapeCsvCell('Línea 1\nLínea 2')).toBe('"Línea 1\nLínea 2"');
    expect(escapeCsvCell('Dijo "hola"')).toBe('"Dijo ""hola"""');
  });

  test('buildCsv construye CSV con BOM, headers y filas separadas por CRLF', () => {
    const csv = buildCsv(
      ['Nombre', 'Nota'],
      [
        ['Ana', 'Sin coma'],
        ['Luis', 'Texto, con coma'],
      ]
    );

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(sinBom(csv)).toBe(
      'Nombre,Nota\r\nAna,Sin coma\r\nLuis,"Texto, con coma"'
    );
  });

  test('triggerCsvDownload crea un blob, agrega .csv si falta y libera la URL', () => {
    const createObjectURLMock = jest.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = jest.fn();
    const clickMock = jest.fn();

    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = document.createElementNS('http://www.w3.org/1999/xhtml', tagName);

      if (tagName === 'a') {
        element.click = clickMock;
      }

      return element;
    });

    triggerCsvDownload('reporte_prueba', 'contenido,csv');

    expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  test('triggerCsvDownload respeta filename si ya termina en .csv', () => {
    const createObjectURLMock = jest.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = jest.fn();
    const appendSpy = jest.spyOn(document.body, 'appendChild');

    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    triggerCsvDownload('reporte_final.csv', 'a,b');

    const anchor = appendSpy.mock.calls[0][0];

    expect(anchor.download).toBe('reporte_final.csv');
    expect(anchor.href).toContain('blob:mock-url');
  });

  test('sanitizeFilenamePart limpia caracteres inválidos y limita longitud', () => {
    expect(sanitizeFilenamePart('Reporte junio 2026 / prueba')).toBe(
      'Reporte_junio_2026_prueba'
    );

    const largo = 'a'.repeat(100);
    expect(sanitizeFilenamePart(largo)).toHaveLength(80);
  });

  test('exportTimestampSlug genera fecha y hora para el nombre del archivo', () => {
    expect(exportTimestampSlug()).toBe('2026-06-04_0915');
  });

  test('buildCsvReporteGeneral incluye resumen y distribuciones', () => {
    const csv = buildCsvReporteGeneral({
      totalBeneficiarios: 100,
      beneficiariosActivos: 80,
      beneficiariosInactivos: 20,
      distribucionGenero: [
        { label: 'Femenino', value: 60, porcentaje: 60 },
        { label: 'Masculino', value: 40, porcentaje: 40 },
      ],
      distribucionEtapaVida: [
        { label: 'Niñez', value: 30, porcentaje: 30 },
      ],
      distribucionEstado: [
        { label: 'Nuevo León', value: 70, porcentaje: 70 },
      ],
    });

    const text = sinBom(csv);

    expect(text).toContain('Meta,Reporte,General,');
    expect(text).toContain('Resumen,Total de beneficiarios,100,');
    expect(text).toContain('Resumen,Beneficiarios activos,80,');
    expect(text).toContain('Resumen,Beneficiarios inactivos,20,');
    expect(text).toContain('Distribución género,Femenino,60,60');
    expect(text).toContain('Distribución etapa de vida,Niñez,30,30');
    expect(text).toContain('Beneficiarios por estado,Nuevo León,70,70');
  });

  test('buildCsvReporteGeneral usa 0 cuando faltan valores', () => {
    const csv = buildCsvReporteGeneral({});

    const text = sinBom(csv);

    expect(text).toContain('Resumen,Total de beneficiarios,0,');
    expect(text).toContain('Resumen,Beneficiarios activos,0,');
    expect(text).toContain('Resumen,Beneficiarios inactivos,0,');
  });

  test('buildCsvReporteMensual incluye periodo, resumen, servicios por día y distribuciones', () => {
    const csv = buildCsvReporteMensual(
      {
        periodo: {
          desde: '2026-06-01',
          hasta: '2026-06-30',
        },
        nuevosBeneficiarios: 8,
        beneficiariosAtendidos: 15,
        serviciosPeriodo: 25,
        serviciosPorDia: [
          { fecha: '2026-06-01', conteo: 5, diaLabel: 'Lunes' },
        ],
        distribucionGenero: [
          { label: 'Femenino', value: 10, porcentaje: 66 },
        ],
      },
      'junio',
      2026
    );

    const text = sinBom(csv);

    expect(text).toContain('Meta,Reporte,Mensual,junio 2026');
    expect(text).toContain('Periodo API,Desde,2026-06-01,');
    expect(text).toContain('Periodo API,Hasta,2026-06-30,');
    expect(text).toContain('Resumen,Nuevos beneficiarios,8,');
    expect(text).toContain('Servicios por día,2026-06-01,5,Lunes');
    expect(text).toContain('Distribución género,Femenino,10,66');
  });

  test('buildCsvReporteMensual funciona aunque falten arreglos opcionales', () => {
    const csv = buildCsvReporteMensual({}, '', '');

    const text = sinBom(csv);

    expect(text).toContain('Meta,Reporte,Mensual,');
    expect(text).toContain('Resumen,Nuevos beneficiarios,0,');
    expect(text).toContain('Resumen,Beneficiarios atendidos,0,');
    expect(text).toContain('Resumen,Servicios del período,0,');
  });

  test('buildCsvReportePersonalizado incluye todas las métricas activas', () => {
    const csv = buildCsvReportePersonalizado({
      desde: '2026-06-01',
      hasta: '2026-06-30',
      filtrosMetricasTexto: 'Servicios, Nuevos, Demográficos',
      metricasTieneServicios: true,
      metricasTieneNuevos: true,
      metricasTieneDemo: true,
      data: {
        nuevosBeneficiarios: 10,
        serviciosPeriodo: 20,
        beneficiariosAtendidos: 15,
        citasPeriodo: 30,
      },
      distribGeneroVista: [
        { label: 'Femenino', value: 8, porcentaje: 80 },
      ],
      distribEtapaVista: [
        { label: 'Niñez', value: 5, porcentaje: 50 },
      ],
      distribEstadoVista: [
        { label: 'Nuevo León', value: 9, porcentaje: 90 },
      ],
      serieServiciosVista: [
        {
          bucketInicio: '2026-06-01',
          bucketFin: '2026-06-01',
          chartLabel: '06-01',
          conteo: 4,
        },
      ],
      granularidadLabel: 'Servicios por día',
    });

    const text = sinBom(csv);

    expect(text).toContain('Meta,Reporte,Personalizado,');
    expect(text).toContain('Meta,Periodo desde,2026-06-01,');
    expect(text).toContain('Meta,Métricas activas,"Servicios, Nuevos, Demográficos",');
    expect(text).toContain('KPI,Nuevos beneficiarios,10,');
    expect(text).toContain('KPI,Total servicios,20,');
    expect(text).toContain('KPI,Beneficiarios atendidos,15,');
    expect(text).toContain('KPI,Citas período,30,');
    expect(text).toContain('Meta,Serie servicios — granularidad,Servicios por día,');
    expect(text).toContain('Servicios agregados,2026-06-01,4,2026-06-01 · 06-01');
    expect(text).toContain('Vista género,Femenino,8,80');
    expect(text).toContain('Vista etapa de vida,Niñez,5,50');
    expect(text).toContain('Vista estados,Nuevo León,9,90');
  });

  test('buildCsvReportePersonalizado con solo demográficos agrega beneficiarios atendidos', () => {
    const csv = buildCsvReportePersonalizado({
      desde: '2026-06-01',
      hasta: '2026-06-30',
      filtrosMetricasTexto: 'Demográficos',
      metricasTieneServicios: false,
      metricasTieneNuevos: false,
      metricasTieneDemo: true,
      data: {
        beneficiariosAtendidos: 12,
        citasPeriodo: 3,
      },
      distribGeneroVista: [],
      distribEtapaVista: [],
      distribEstadoVista: [],
      serieServiciosVista: [],
      granularidadLabel: '',
    });

    const text = sinBom(csv);

    expect(text).toContain('KPI,Beneficiarios atendidos,12,');
    expect(text).toContain('KPI,Citas período,3,');
    expect(text).not.toContain('KPI,Total servicios');
    expect(text).not.toContain('Meta,Serie servicios — granularidad');
  });

  test('buildCsvReportePersonalizado sin demográficos no agrega distribuciones', () => {
    const csv = buildCsvReportePersonalizado({
      desde: '2026-06-01',
      hasta: '2026-06-30',
      filtrosMetricasTexto: 'Servicios',
      metricasTieneServicios: true,
      metricasTieneNuevos: false,
      metricasTieneDemo: false,
      data: {
        serviciosPeriodo: 5,
        beneficiariosAtendidos: 2,
        citasPeriodo: 1,
      },
      distribGeneroVista: [
        { label: 'Femenino', value: 1, porcentaje: 100 },
      ],
      distribEtapaVista: [],
      distribEstadoVista: [],
      serieServiciosVista: [],
      granularidadLabel: 'Servicios por día',
    });

    const text = sinBom(csv);

    expect(text).toContain('KPI,Total servicios,5,');
    expect(text).not.toContain('Vista género');
    expect(text).not.toContain('Vista etapa de vida');
    expect(text).not.toContain('Vista estados');
  });

  test('buildCsvReporteInventarioHistorial incluye datos del movimiento', () => {
    const csv = buildCsvReporteInventarioHistorial(
      [
        {
          fecha: '2026-06-04',
          clave: 'SON-01',
          nombre: 'Sonda',
          tipoLabel: 'Salida',
          cantidad: 2,
          cantAnterior: 10,
          cantNueva: 8,
          motivo: 'Uso en servicio',
          usuario: 'Ana',
        },
      ],
      '2026-06-01',
      '2026-06-30'
    );

    const text = sinBom(csv);

    expect(text).toContain(
      '2026-06-01,2026-06-30,2026-06-04,SON-01,Sonda,Salida,2,10,8,Uso en servicio,Ana'
    );
  });

  test('buildCsvReporteInventarioHistorial usa valores default si faltan campos', () => {
    const csv = buildCsvReporteInventarioHistorial([{}], '2026-06-01', '2026-06-30');

    const text = sinBom(csv);

    expect(text).toContain('2026-06-01,2026-06-30,,,,,0,0,0,,');
  });

  test('buildCsvReporteAnual incluye resumen anual y serie mensual', () => {
    const csv = buildCsvReporteAnual(
      {
        periodo: {
          desde: '2026-01-01',
          hasta: '2026-12-31',
        },
        serviciosPeriodo: 100,
        nuevosBeneficiarios: 40,
        beneficiariosAtendidos: 60,
        porMes: [
          {
            mes: 1,
            mesLabel: 'Enero',
            servicios: 10,
            nuevosBeneficiarios: 4,
          },
        ],
        distribucionGenero: [
          { label: 'Femenino', value: 30, porcentaje: 60 },
        ],
      },
      2026
    );

    const text = sinBom(csv);

    expect(text).toContain('Meta,Año (2026),,');
    expect(text).toContain('Periodo API,2026-01-01,,');
    expect(text).toContain('Resumen,Servicios período,100,');
    expect(text).toContain('Serie mensual,Enero,10,4');
    expect(text).toContain('Distribución género,Femenino,30,60');
  });

  test('buildCsvReporteAnual usa Mes N si no hay mesLabel', () => {
    const csv = buildCsvReporteAnual(
      {
        porMes: [
          {
            mes: 2,
            servicios: 8,
            nuevosBeneficiarios: 3,
          },
        ],
      },
      2026
    );

    const text = sinBom(csv);

    expect(text).toContain('Serie mensual,Mes 2,8,3');
  });

  test('buildCsvReporteDonaciones genera CSV para donador familia con abono', () => {
    const csv = buildCsvReporteDonaciones(
      {
        nombre: 'Familia García',
        tipo_origen: 'familia',
        saldo: 1500,
      },
      [
        {
          fecha: '2026-06-04',
          tipo_movimiento: 'abono',
          origen_nombre: 'Familia García',
          concepto: 'Donación mensual',
          monto: 500,
          saldo_nuevo: 1500,
        },
      ]
    );

    const text = sinBom(csv);

    expect(text).toContain('Donador,Familia García,Familia,,,');
    expect(text).toContain('Saldo actual,1500,,,,');
    expect(text).toContain('2026-06-04,abono,Familia García,Donación mensual,500,1500');
  });

  test('buildCsvReporteDonaciones genera CSV para donador marca', () => {
    const csv = buildCsvReporteDonaciones(
      {
        nombre: 'Marca Solidaria',
        tipo_origen: 'marca',
        saldo: 3000,
      },
      []
    );

    const text = sinBom(csv);

    expect(text).toContain('Donador,Marca Solidaria,Marca,,,');
    expect(text).toContain('Saldo actual,3000,,,,');
  });

  test('buildCsvReporteDonaciones convierte egreso a monto negativo y usa servicio como origen', () => {
    const csv = buildCsvReporteDonaciones(
      {
        nombre: 'Familia García',
        tipo_origen: 'familia',
        saldo: 1300,
      },
      [
        {
          fecha: '2026-06-10',
          tipo_movimiento: 'egreso',
          folio_servicio: 'SERV-100',
          servicio_nombre: 'Consulta médica',
          monto: 200,
          saldo_nuevo: 1300,
        },
      ]
    );

    const text = sinBom(csv);

    expect(text).toContain(
      '2026-06-10,egreso,Servicio #SERV-100,#SERV-100 · Consulta médica,-200,1300'
    );
  });

  test('buildCsvReporteDonaciones usa motivo como concepto cuando no hay concepto', () => {
    const csv = buildCsvReporteDonaciones(
      {
        nombre: 'Familia García',
        tipo_origen: 'familia',
        saldo: 1000,
      },
      [
        {
          fecha: '2026-06-12',
          tipo_movimiento: 'abono',
          donador_nombre: 'Donador externo',
          motivo: 'Apoyo extraordinario',
          monto: 100,
          saldo_nuevo: 1100,
        },
      ]
    );

    const text = sinBom(csv);

    expect(text).toContain(
      '2026-06-12,abono,Donador externo,Apoyo extraordinario,100,1100'
    );
  });

  test('buildCsvReporteDonaciones usa defaults si faltan campos del movimiento', () => {
    const csv = buildCsvReporteDonaciones(
      {
        nombre: '',
        tipo_origen: '',
        saldo: undefined,
      },
      [{}]
    );

    const text = sinBom(csv);

    expect(text).toContain('Donador,,Familia,,,');
    expect(text).toContain('Saldo actual,0,,,,');
    expect(text).toContain(',,,,0,');
  });
});