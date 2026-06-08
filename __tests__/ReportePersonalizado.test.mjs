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

// PersonalizadoRangoFechasCard now owns the "Generar reporte" button and
// exposes onAbrirFiltros / filtrosAbiertos for the filter-panel toggle.
jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoRangoFechasCard/PersonalizadoRangoFechasCard',
  () => ({
    __esModule: true,
    default: ({ desdeDraft, hastaDraft, onDesdeChange, onHastaChange, errorRango, onGenerarReporte, onAbrirFiltros, filtrosAbiertos }) =>
      React.createElement(
        'section',
        { 'data-testid': 'rango-card' },
        React.createElement('input', {
          'data-testid': 'desde-input',
          type: 'date',
          value: desdeDraft,
          onChange: (event) => onDesdeChange(event.target.value),
        }),
        React.createElement('input', {
          'data-testid': 'hasta-input',
          type: 'date',
          value: hastaDraft,
          onChange: (event) => onHastaChange(event.target.value),
        }),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'generar-reporte', onClick: onGenerarReporte },
          'Generar reporte'
        ),
        onAbrirFiltros
          ? React.createElement(
              'button',
              { type: 'button', 'data-testid': 'abrir-filtros', onClick: onAbrirFiltros },
              filtrosAbiertos ? 'Cerrar filtros' : 'Abrir filtros'
            )
          : null,
        errorRango ? React.createElement('p', { role: 'alert' }, errorRango) : null
      ),
  })
);

// PersonalizadoFiltrosPanel replaces PersonalizadoLedgerDimensiones +
// PersonalizadoFiltrosDemograficos. Only mounted when hayDatos=true,
// only renders its body when open=true.
jest.mock(
  '../client/src/components/reportes/ReportePersonalizado/PersonalizadoFiltrosPanel/PersonalizadoFiltrosPanel',
  () => ({
    __esModule: true,
    default: ({
      open,
      metricas,
      onToggleMetrica,
      muestraDemografia,
      distribucionEstado,
      generosEfectivos,
      etapasEfectivas,
      estadosEfectivos,
      onToggleGenero,
      onToggleEtapa,
      onToggleEstado,
    }) => {
      if (!open) return null;
      return React.createElement(
        'section',
        { 'data-testid': 'filtros-panel' },
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'toggle-servicios', onClick: () => onToggleMetrica('servicios') },
          metricas.has('servicios') ? 'Servicios activo' : 'Servicios inactivo'
        ),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'toggle-nuevos', onClick: () => onToggleMetrica('nuevos') },
          metricas.has('nuevos') ? 'Nuevos activo' : 'Nuevos inactivo'
        ),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'toggle-demograficos', onClick: () => onToggleMetrica('demograficos') },
          metricas.has('demograficos') ? 'Demográficos activo' : 'Demográficos inactivo'
        ),
        muestraDemografia
          ? React.createElement(
              'div',
              { 'data-testid': 'filtros-demo' },
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
                    { type: 'button', 'data-testid': 'toggle-estado-nl', onClick: () => onToggleEstado(distribucionEstado[0].key) },
                    'Toggle estado'
                  )
                : null
            )
          : null
      );
    },
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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let container;
let root;

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

// Clicks "Generar reporte" (now inside PersonalizadoRangoFechasCard) and
// waits for the hayDatos→filtrosPanelAbierto effect to flush.
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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

    // Results block is entirely absent when hayDatos=false
    expect(container.querySelector('[data-testid="kpi-section"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="divider"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="servicios-chart"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="demo-grid"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="filtros-panel"]')).toBeFalsy();

    // Hook called with empty strings until a period is applied
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

    // hayDatos stays false — results block not shown
    expect(container.querySelector('[data-testid="kpi-section"]')).toBeFalsy();
  });

  test('genera reporte con rango válido y muestra resultados', async () => {
    await mount();

    await generarReporte();

    expect(mockHookState).toHaveBeenLastCalledWith('2026-06-01', '2026-06-30');

    // Filter panel auto-opens when hayDatos first becomes true
    expect(container.querySelector('[data-testid="filtros-panel"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="divider"]')).toBeTruthy();
    expect(container.textContent).toContain('KPIs: servicios,nuevos,demograficos');
    expect(container.textContent).toContain('Servicios dia con serie');
    expect(container.textContent).toContain('Demo 2 2 total 10');
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

    // Error is rendered outside the hayDatos block, so it appears immediately
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

    // Toggle buttons live inside PersonalizadoFiltrosPanel, open after generarReporte
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

    // filtros-demo is gated on muestraDemografia inside the panel mock
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
  });

  test('el botón Abrir filtros aparece solo después de generar el reporte', async () => {
    await mount();

    expect(container.querySelector('[data-testid="abrir-filtros"]')).toBeFalsy();

    await generarReporte();

    expect(container.querySelector('[data-testid="abrir-filtros"]')).toBeTruthy();
  });

  test('el botón Abrir filtros alterna la visibilidad del panel', async () => {
    await mount();

    await generarReporte();

    // Panel opens automatically after generating
    expect(container.querySelector('[data-testid="filtros-panel"]')).toBeTruthy();

    await act(async () => {
      container.querySelector('[data-testid="abrir-filtros"]').click();
    });

    expect(container.querySelector('[data-testid="filtros-panel"]')).toBeFalsy();

    await act(async () => {
      container.querySelector('[data-testid="abrir-filtros"]').click();
    });

    expect(container.querySelector('[data-testid="filtros-panel"]')).toBeTruthy();
  });
});
