/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockRegisterCsvExportHandler = jest.fn();
const mockRefetch = jest.fn();
const mockBuildCsvReportePersonalizado = jest.fn();
const mockTriggerCsvDownload = jest.fn();
const mockExportTimestampSlug = jest.fn();
const mockSanitizeFilenamePart = jest.fn();

let mockHookState;

const METRICA_SERVICIOS = 'servicios';
const METRICA_NUEVOS = 'nuevos';
const METRICA_DEMOGRAFICOS = 'demograficos';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: () => ({
    registerCsvExportHandler: mockRegisterCsvExportHandler,
  }),
}));

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/ReportePersonalizadoShell/ReportePersonalizadoShell',
  () => ({
    __esModule: true,
    default: ({ children }) =>
      React.createElement('section', { 'data-testid': 'shell' }, children),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoRangoFechasCard/PersonalizadoRangoFechasCard',
  () => ({
    __esModule: true,
    default: ({ desdeDraft, hastaDraft, onDesdeChange, onHastaChange, errorRango }) =>
      React.createElement(
        'section',
        { 'data-testid': 'rango-card' },
        React.createElement('label', null, 'Desde'),
        React.createElement('input', {
          'data-testid': 'desde-input',
          type: 'date',
          value: desdeDraft,
          onChange: (event) => onDesdeChange(event.target.value),
        }),
        React.createElement('label', null, 'Hasta'),
        React.createElement('input', {
          'data-testid': 'hasta-input',
          type: 'date',
          value: hastaDraft,
          onChange: (event) => onHastaChange(event.target.value),
        }),
        errorRango
          ? React.createElement('p', { role: 'alert' }, errorRango)
          : null
      ),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoLedgerDimensiones/PersonalizadoLedgerDimensiones',
  () => ({
    __esModule: true,
    default: ({ metricas, onToggleMetrica, children }) =>
      React.createElement(
        'section',
        { 'data-testid': 'ledger' },
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'toggle-servicios',
            onClick: () => onToggleMetrica('servicios'),
          },
          metricas.has('servicios') ? 'Servicios activo' : 'Servicios inactivo'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'toggle-nuevos',
            onClick: () => onToggleMetrica('nuevos'),
          },
          metricas.has('nuevos') ? 'Nuevos activo' : 'Nuevos inactivo'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'toggle-demograficos',
            onClick: () => onToggleMetrica('demograficos'),
          },
          metricas.has('demograficos') ? 'Demográficos activo' : 'Demográficos inactivo'
        ),
        children
      ),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoFiltrosDemograficos/PersonalizadoFiltrosDemograficos',
  () => ({
    __esModule: true,
    default: ({
      hayDatos,
      distribucionEstado,
      generosEfectivos,
      etapasEfectivas,
      estadosEfectivos,
      onToggleGenero,
      onToggleEtapa,
      onToggleEstado,
    }) =>
      React.createElement(
        'section',
        { 'data-testid': 'filtros-demo' },
        React.createElement('p', null, hayDatos ? 'Hay datos' : 'Sin periodo aplicado'),
        React.createElement('p', { 'data-testid': 'generos-count' }, `Géneros: ${generosEfectivos.size}`),
        React.createElement('p', { 'data-testid': 'etapas-count' }, `Etapas: ${etapasEfectivas.size}`),
        React.createElement('p', { 'data-testid': 'estados-count' }, `Estados: ${estadosEfectivos.size}`),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'toggle-genero-f', onClick: () => onToggleGenero('F') },
          'Toggle género F'
        ),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'toggle-etapa-ninez', onClick: () => onToggleEtapa('ninez') },
          'Toggle etapa niñez'
        ),
        distribucionEstado[0]
          ? React.createElement(
              'button',
              {
                type: 'button',
                'data-testid': 'toggle-estado-nl',
                onClick: () => onToggleEstado(distribucionEstado[0].key),
              },
              'Toggle estado'
            )
          : null
      ),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoResumenSeleccion/PersonalizadoResumenSeleccion',
  () => ({
    __esModule: true,
    default: ({ rangoTemporal, filtrosActivos, regionAnalisis, onGenerarReporte }) =>
      React.createElement(
        'section',
        { 'data-testid': 'resumen' },
        React.createElement('p', null, `Rango: ${rangoTemporal}`),
        React.createElement('p', null, `Filtros: ${filtrosActivos}`),
        React.createElement('p', null, `Región: ${regionAnalisis}`),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'generar-reporte', onClick: onGenerarReporte },
          'Generar reporte'
        )
      ),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoSinDatosState/PersonalizadoSinDatosState',
  () => ({
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'sin-datos' }, 'Sin datos todavía'),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoResultadosDivider/PersonalizadoResultadosDivider',
  () => ({
    __esModule: true,
    default: () => React.createElement('hr', { 'data-testid': 'divider' }),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoKpiSection/PersonalizadoKpiSection',
  () => ({
    __esModule: true,
    default: ({ metricas, data }) =>
      React.createElement(
        'section',
        { 'data-testid': 'kpi-section' },
        `KPIs: ${Array.from(metricas).join(',')} | Nuevos: ${data.nuevosBeneficiarios}`
      ),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoServiciosChartRow/PersonalizadoServiciosChartRow',
  () => ({
    __esModule: true,
    default: ({ serieServiciosVista, granularidadServicios, tieneServiciosSerie, rangoLegible }) =>
      React.createElement(
        'section',
        { 'data-testid': 'servicios-chart' },
        `Servicios ${granularidadServicios} ${tieneServiciosSerie ? 'con serie' : 'sin serie'} ${rangoLegible} ${serieServiciosVista.length}`
      ),
    PersonalizadoSoloEstadosCard: ({ distribEstadoVista }) =>
      React.createElement(
        'section',
        { 'data-testid': 'solo-estados' },
        `Solo estados: ${distribEstadoVista.length}`
      ),
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoDemograficosGrid/PersonalizadoDemograficosGrid',
  () => ({
    __esModule: true,
    default: ({ distribGeneroVista, distribEtapaVista, totalGeneroFiltrado }) =>
      React.createElement(
        'section',
        { 'data-testid': 'demo-grid' },
        `Demo ${distribGeneroVista.length} ${distribEtapaVista.length} total ${totalGeneroFiltrado}`
      ),
  })
);

jest.mock('../client/src/components/reportes/ReportesLoading/ReportesLoading', () => ({
  __esModule: true,
  default: ({ message }) =>
    React.createElement('div', { role: 'status', 'data-testid': 'loading' }, message),
}));

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/reportePersonalizadoConstants',
  () => ({
    __esModule: true,
    METRICA_DEMOGRAFICOS: 'demograficos',
    METRICA_NUEVOS: 'nuevos',
    METRICA_SERVICIOS: 'servicios',
  })
);

jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/reportePersonalizado.utils',
  () => ({
    __esModule: true,
    defaultRangoMesActual: () => ({
      desde: '2026-06-01',
      hasta: '2026-06-30',
    }),
    esRangoFechaValido: (desde, hasta) => Boolean(desde && hasta && desde <= hasta),
    formatRangoLegible: (desde, hasta) => `${desde} al ${hasta}`,
    resolverSeleccion: (items, seleccion) => {
      if (seleccion === null) return new Set(items.map((item) => item.key));
      return seleccion;
    },
    filtrarDistribucionPorClaves: (items, seleccion) =>
      items.filter((item) => seleccion.has(item.key)),
    resolverGranularidadServicios: (desde, hasta) =>
      desde && hasta && desde.slice(0, 7) === hasta.slice(0, 7) ? 'dia' : 'mes',
    construirSerieServiciosVista: (serie) => serie,
    textoMetricas: (metricas) => Array.from(metricas).join(', '),
    tituloServiciosPorGranularidad: (granularidad) =>
      granularidad === 'dia' ? 'Servicios por día' : 'Servicios por mes',
  })
);

jest.mock('../client/src/utils/reportesCsvExport', () => ({
  __esModule: true,
  buildCsvReportePersonalizado: (...args) => mockBuildCsvReportePersonalizado(...args),
  exportTimestampSlug: () => mockExportTimestampSlug(),
  sanitizeFilenamePart: (...args) => mockSanitizeFilenamePart(...args),
  triggerCsvDownload: (...args) => mockTriggerCsvDownload(...args),
}));

jest.mock('../client/src/hooks/useReportePersonalizado', () => ({
  __esModule: true,
  useReportePersonalizado: (...args) => mockHookState(...args),
}));

const ReportePersonalizadoModule = await import(
  '../client/src/pages/reportes/ReportePersonalizado/ReportePersonalizado.jsx'
);

const ReportePersonalizado =
  ReportePersonalizadoModule.default?.default ||
  ReportePersonalizadoModule.default ||
  ReportePersonalizadoModule;

let container;
let root;

const baseData = {
  nuevosBeneficiarios: 8,
  serviciosOtorgados: 12,
  distribucionGenero: [
    { key: 'F', label: 'Femenino', value: 6 },
    { key: 'M', label: 'Masculino', value: 4 },
  ],
  distribucionEtapaVida: [
    { key: 'ninez', label: 'Niñez', value: 5 },
    { key: 'adulto', label: 'Adulto', value: 5 },
  ],
  distribucionEstado: [
    { key: 'NL', label: 'Nuevo León', value: 7 },
    { key: 'COAH', label: 'Coahuila', value: 3 },
  ],
  serviciosPorDia: [
    { fecha: '2026-06-01', conteo: 3 },
    { fecha: '2026-06-02', conteo: 0 },
  ],
};

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

function changeInput(input, value) {
  setNativeValue(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

async function mount() {
  await act(async () => {
    root.render(React.createElement(ReportePersonalizado));
  });

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function generarReporte() {
  await act(async () => {
    container.querySelector('[data-testid="generar-reporte"]').click();
  });

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function getLastCsvHandler() {
  const handlers = mockRegisterCsvExportHandler.mock.calls
    .map((call) => call[0])
    .filter((handler) => typeof handler === 'function');

  return handlers.at(-1);
}

describe('ReportePersonalizado', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    global.alert = jest.fn();

    mockRefetch.mockResolvedValue();
    mockBuildCsvReportePersonalizado.mockReturnValue('csv-content');
    mockExportTimestampSlug.mockReturnValue('20260604_001500');
    mockSanitizeFilenamePart.mockImplementation((value) =>
      String(value).replace(/[^a-zA-Z0-9_-]/g, '_')
    );

    mockHookState = jest.fn(() => ({
      data: baseData,
      loading: false,
      error: '',
      refetch: mockRefetch,
    }));
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });

  test('muestra estado inicial sin datos antes de generar reporte', async () => {
    await mount();

    expect(container.textContent).toContain('Sin datos todavía');
    expect(container.textContent).toContain('Rango: 2026-06-01 al 2026-06-30');
    expect(container.textContent).toContain('Región: Cobertura global (tras generar)');
    expect(container.querySelector('[data-testid="kpi-section"]')).toBeFalsy();

    expect(mockHookState).toHaveBeenCalledWith('', '');
  });

  test('muestra error si el rango de fechas es inválido', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="desde-input"]'), '2026-07-01');
    });

    await generarReporte();

    expect(container.textContent).toContain(
      'Rango inválido: comprueba que «desde» no sea posterior a «hasta».'
    );

    expect(container.textContent).toContain('Sin datos todavía');
  });

  test('genera reporte con rango válido y muestra resultados', async () => {
    await mount();

    await generarReporte();

    expect(mockHookState).toHaveBeenLastCalledWith('2026-06-01', '2026-06-30');

    expect(container.querySelector('[data-testid="divider"]')).toBeTruthy();
    expect(container.textContent).toContain('KPIs: servicios,nuevos,demograficos');
    expect(container.textContent).toContain('Servicios dia con serie');
    expect(container.textContent).toContain('Demo 2 2 total 10');
    expect(container.textContent).toContain('Región: Cobertura global');
  });

  test('muestra loading cuando hay periodo aplicado y el hook está cargando', async () => {
    mockHookState = jest.fn((desde, hasta) => ({
      data: baseData,
      loading: Boolean(desde && hasta),
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    await generarReporte();

    expect(container.textContent).toContain('Cargando datos del periodo seleccionado…');
    expect(container.querySelector('[data-testid="kpi-section"]')).toBeFalsy();
  });

  test('muestra error del hook y permite reintentar', async () => {
    mockHookState = jest.fn(() => ({
      data: baseData,
      loading: false,
      error: 'Error al cargar reporte',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.textContent).toContain('Error al cargar reporte');

    await act(async () => {
      const retryButton = Array.from(container.querySelectorAll('button')).find((button) =>
        button.textContent.includes('Reintentar')
      );
      retryButton.click();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('permite quitar métrica de servicios y muestra solo estados cuando quedan demográficos sin servicios', async () => {
    await mount();

    await generarReporte();

    await act(async () => {
      container.querySelector('[data-testid="toggle-servicios"]').click();
    });

    expect(container.querySelector('[data-testid="servicios-chart"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="solo-estados"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="demo-grid"]')).toBeTruthy();
  });

  test('permite ocultar demográficos y deja de mostrar filtros y grid demográfico', async () => {
    await mount();

    await generarReporte();

    await act(async () => {
      container.querySelector('[data-testid="toggle-demograficos"]').click();
    });

    expect(container.querySelector('[data-testid="filtros-demo"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="demo-grid"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="servicios-chart"]')).toBeTruthy();
  });

  test('no permite apagar la última métrica activa', async () => {
    await mount();

    await generarReporte();

    await act(async () => {
      container.querySelector('[data-testid="toggle-servicios"]').click();
      container.querySelector('[data-testid="toggle-nuevos"]').click();
    });

    expect(container.textContent).toContain('Demográficos activo');

    await act(async () => {
      container.querySelector('[data-testid="toggle-demograficos"]').click();
    });

    expect(container.textContent).toContain('Demográficos activo');
  });

  test('aplica filtros demográficos y actualiza totales filtrados', async () => {
    await mount();

    await generarReporte();

    expect(container.textContent).toContain('Demo 2 2 total 10');

    await act(async () => {
      container.querySelector('[data-testid="toggle-genero-f"]').click();
    });

    expect(container.textContent).toContain('Demo 1 2 total 4');
  });

  test('registra handler CSV y limpia al desmontar', async () => {
    await mount();

    expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(expect.any(Function));

    await act(async () => {
      root.unmount();
    });

    root = null;

    expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(null);
  });

  test('muestra alerta si intenta exportar CSV sin generar reporte', async () => {
    await mount();

    const handler = getLastCsvHandler();

    await act(async () => {
      handler();
    });

    expect(global.alert).toHaveBeenCalledWith(
      'Aplica primero el periodo en las fechas y pulsa «Generar reporte».'
    );

    expect(mockTriggerCsvDownload).not.toHaveBeenCalled();
  });

  test('exporta CSV cuando ya se generó el reporte', async () => {
    await mount();

    await generarReporte();

    const handler = getLastCsvHandler();

    await act(async () => {
      handler();
    });

    expect(mockBuildCsvReportePersonalizado).toHaveBeenCalledWith(
      expect.objectContaining({
        desde: '2026-06-01',
        hasta: '2026-06-30',
        filtrosMetricasTexto: 'servicios, nuevos, demograficos',
        metricasTieneServicios: true,
        metricasTieneNuevos: true,
        metricasTieneDemo: true,
        data: baseData,
        granularidadLabel: 'Servicios por día',
      })
    );

    expect(mockTriggerCsvDownload).toHaveBeenCalledWith(
      'reporte_personalizado_2026-06-01_2026-06-30_20260604_001500.csv',
      'csv-content'
    );
  });

  test('cambia el rango válido antes de generar y usa esas fechas', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="desde-input"]'), '2026-05-01');
      changeInput(container.querySelector('[data-testid="hasta-input"]'), '2026-05-15');
    });

    await generarReporte();

    expect(mockHookState).toHaveBeenLastCalledWith('2026-05-01', '2026-05-15');
    expect(container.textContent).toContain('Rango: 2026-05-01 al 2026-05-15');
  });
});