/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockRegisterCsvExportHandler = jest.fn();
const mockFetchDonadores = jest.fn();
const mockFetchMovimientosPorDonador = jest.fn();
const mockBuildCsvReporteDonaciones = jest.fn();
const mockTriggerCsvDownload = jest.fn();
const mockExportTimestampSlug = jest.fn();

let mockHookState;

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: () => ({
    registerCsvExportHandler: mockRegisterCsvExportHandler,
  }),
  Link: ({ to, children, className }) =>
    React.createElement('a', { href: to, className }, children),
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  ArrowDownCircle: () => React.createElement('span', { 'data-testid': 'icon-down' }),
  ArrowUpCircle: () => React.createElement('span', { 'data-testid': 'icon-up' }),
  ExternalLink: () => React.createElement('span', { 'data-testid': 'icon-external' }),
  Search: () => React.createElement('span', { 'data-testid': 'icon-search' }),
  Wallet: () => React.createElement('span', { 'data-testid': 'icon-wallet' }),
}));

jest.mock('../client/src/components/ui/card', () => ({
  __esModule: true,
  Card: ({ children, className }) => React.createElement('section', { className }, children),
  CardHeader: ({ children, className }) => React.createElement('header', { className }, children),
  CardContent: ({ children, className }) => React.createElement('div', { className }, children),
}));

jest.mock('../client/src/components/ui/Dropdown', () => ({
  __esModule: true,
  default: ({ options = [], value, onChange, className }) =>
    React.createElement(
      'select',
      {
        className,
        value,
        'data-testid': className?.includes('reporte-donaciones-dropdown')
          ? 'donador-select'
          : 'tipo-select',
        onChange: (event) => onChange(event.target.value),
      },
      options.map((option) =>
        React.createElement(
          'option',
          { key: option.value, value: option.value },
          option.label
        )
      )
    ),
}));

jest.mock('../client/src/components/ui/SearchBar', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder, className }) =>
    React.createElement('input', {
      className,
      value,
      placeholder,
      'data-testid': 'searchbar',
      onChange: (event) => onChange(event.target.value),
    }),
}));

jest.mock('../client/src/components/fondo/FondoMovimientosDisplay', () => ({
  __esModule: true,
  fmtMontoFondo: (value) => `$${Number(value || 0).toFixed(2)}`,
  formatConceptoMovimiento: (m) => m.concepto || m.motivo || 'Sin concepto',
  formatOrigenMovimiento: (m) => m.origen || m.destino || 'Sin origen',
  MontoCell: ({ tipo, monto }) =>
    React.createElement(
      'td',
      { className: 'text-right', 'data-testid': `monto-${tipo}` },
      `$${Number(monto || 0).toFixed(2)}`
    ),
  SaldoCell: ({ value }) =>
    React.createElement(
      'td',
      { className: 'text-right', 'data-testid': 'saldo-cell' },
      `$${Number(value || 0).toFixed(2)}`
    ),
}));

jest.mock('../client/src/components/reportes/IndicadorCard/IndicadorCard', () => ({
  __esModule: true,
  default: ({ label, displayValue }) =>
    React.createElement(
      'article',
      { 'data-testid': `indicador-${label}` },
      `${label}: ${displayValue}`
    ),
}));

jest.mock('../client/src/components/reportes/ReportesLoading/ReportesLoading', () => ({
  __esModule: true,
  default: ({ message }) =>
    React.createElement('div', { role: 'status', 'data-testid': 'loading' }, message),
}));

jest.mock('../client/src/hooks/useReporteDonaciones', () => ({
  __esModule: true,
  useReporteDonaciones: () => mockHookState,
}));

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
  })
);

jest.mock('../client/src/utils/reportesCsvExport', () => ({
  __esModule: true,
  buildCsvReporteDonaciones: (...args) => mockBuildCsvReporteDonaciones(...args),
  exportTimestampSlug: () => mockExportTimestampSlug(),
  triggerCsvDownload: (...args) => mockTriggerCsvDownload(...args),
}));

jest.mock('../client/src/pages/styles/Recibos.css', () => ({}));
jest.mock('../client/src/pages/styles/Donaciones.css', () => ({}));
jest.mock('../client/src/pages/reportes/ReportesMensual/ReportesMensual.css', () => ({}));
jest.mock('../client/src/pages/reportes/ReporteInventario/ReporteInventario.css', () => ({}));
jest.mock('../client/src/pages/reportes/ReporteDonaciones/ReporteDonaciones.css', () => ({}));

const ReporteDonacionesModule = await import(
  '../client/src/pages/reportes/ReporteDonaciones/ReporteDonaciones.jsx'
);

const ReporteDonaciones =
  ReporteDonacionesModule.default?.default ||
  ReporteDonacionesModule.default ||
  ReporteDonacionesModule;

let container;
let root;

const donadoresMock = [
  {
    id_donador: 1,
    nombre: 'Familia García',
    tipo_origen: 'familia',
    saldo: 1500,
  },
  {
    id_donador: 2,
    nombre: 'Marca Solidaria',
    tipo_origen: 'marca',
    saldo: 3000,
  },
];

const movimientosMock = [
  {
    id_movimiento: 10,
    fecha: '2026-06-05T10:30:00Z',
    tipo_movimiento: 'abono',
    origen: 'Familia García',
    concepto: 'Donación mensual',
    monto: 500,
    saldo_nuevo: 1500,
  },
  {
    id_movimiento: 11,
    fecha: '2026-06-10 12:45:00',
    tipo_movimiento: 'egreso',
    destino: 'Compra de insumos',
    motivo: 'Apoyo médico',
    monto: 200,
    saldo_nuevo: 1300,
  },
  {
    id_movimiento: 12,
    fecha: '2026-07-01',
    tipo_movimiento: 'abono',
    origen: 'Marca Solidaria',
    concepto: 'Fuera de rango',
    monto: 900,
    saldo_nuevo: 2200,
  },
];

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
    root.render(React.createElement(ReporteDonaciones));
  });

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function seleccionarDonador(value = '1') {
  await act(async () => {
    changeInput(container.querySelector('[data-testid="donador-select"]'), value);
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

describe('ReporteDonaciones', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    window.alert = jest.fn();

    mockFetchDonadores.mockResolvedValue();
    mockFetchMovimientosPorDonador.mockResolvedValue();
    mockBuildCsvReporteDonaciones.mockReturnValue('csv-content');
    mockExportTimestampSlug.mockReturnValue('20260604_001500');

    mockHookState = {
      donadores: donadoresMock,
      movimientos: movimientosMock,
      loadingDonadores: false,
      loadingMovimientos: false,
      error: '',
      fetchDonadores: mockFetchDonadores,
      fetchMovimientosPorDonador: mockFetchMovimientosPorDonador,
    };
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });

  test('carga los donadores al renderizar', async () => {
    await mount();

    expect(mockFetchDonadores).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Movimientos por fondo');
    expect(container.textContent).toContain('Familia García');
    expect(container.textContent).toContain('Marca Solidaria');
  });

  test('muestra loading mientras carga fondos', async () => {
    mockHookState = {
      ...mockHookState,
      donadores: [],
      loadingDonadores: true,
    };

    await mount();

    expect(container.textContent).toContain('Cargando fondos…');
  });

  test('muestra mensaje cuando no hay fondos registrados', async () => {
    mockHookState = {
      ...mockHookState,
      donadores: [],
      loadingDonadores: false,
    };

    await mount();

    expect(container.textContent).toContain('Sin fondos registrados');
    expect(container.textContent).toContain('Ir a Donaciones');

    const link = container.querySelector('a[href="/donaciones"]');
    expect(link).toBeTruthy();
  });

  test('muestra estado inicial cuando aún no se elige fondo', async () => {
    await mount();

    expect(container.textContent).toContain('Elija un fondo');
    expect(container.textContent).toContain(
      'Los indicadores y el historial aparecerán al seleccionar una marca o familia.'
    );
  });

  test('al seleccionar un fondo carga movimientos y muestra resumen', async () => {
    await mount();

    await seleccionarDonador('1');

    expect(mockFetchMovimientosPorDonador).toHaveBeenCalledWith('1');

    expect(container.textContent).toContain('Familia');
    expect(container.textContent).toContain('Familia García');

    expect(container.textContent).toContain('Abonos del periodo: $500.00');
    expect(container.textContent).toContain('Egresos del periodo: $200.00');
    expect(container.textContent).toContain('Saldo actual: $1500.00');

    expect(container.textContent).toContain('Historial de movimientos');
    expect(container.textContent).toContain('2 movimientos · 2026-06-01 al 2026-06-30');
  });

  test('muestra tabla de movimientos filtrados por rango inicial', async () => {
    await mount();

    await seleccionarDonador('1');

    const table = container.querySelector('table');

    expect(table.textContent).toContain('Donación mensual');
    expect(table.textContent).toContain('Apoyo médico');

    expect(table.textContent).not.toContain('Fuera de rango');
  });

  test('filtra movimientos por tipo abono', async () => {
    await mount();

    await seleccionarDonador('1');

    await act(async () => {
      changeInput(container.querySelector('[data-testid="tipo-select"]'), 'abono');
    });

    const table = container.querySelector('table');

    expect(table.textContent).toContain('Abono');
    expect(table.textContent).toContain('Donación mensual');
    expect(table.textContent).not.toContain('Apoyo médico');
  });

  test('filtra movimientos por tipo egreso', async () => {
    await mount();

    await seleccionarDonador('1');

    await act(async () => {
      changeInput(container.querySelector('[data-testid="tipo-select"]'), 'egreso');
    });

    const table = container.querySelector('table');

    expect(table.textContent).toContain('Egreso');
    expect(table.textContent).toContain('Apoyo médico');
    expect(table.textContent).not.toContain('Donación mensual');
  });

  test('filtra movimientos por búsqueda', async () => {
    await mount();

    await seleccionarDonador('1');

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'insumos');
    });

    const table = container.querySelector('table');

    expect(table.textContent).toContain('Compra de insumos');
    expect(table.textContent).toContain('Apoyo médico');
    expect(table.textContent).not.toContain('Donación mensual');
  });

  test('muestra mensaje cuando no hay resultados con los filtros actuales', async () => {
    await mount();

    await seleccionarDonador('1');

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'no existe');
    });

    expect(container.textContent).toContain('Sin resultados con los filtros actuales.');
    expect(container.querySelector('table')).toBeFalsy();
  });

  test('muestra error cuando la fecha inicial es mayor que la final', async () => {
    await mount();

    await seleccionarDonador('1');

    const fechas = container.querySelectorAll('input[type="date"]');

    await act(async () => {
      changeInput(fechas[0], '2026-07-01');
    });

    expect(container.textContent).toContain(
      'La fecha inicial no puede ser posterior a la fecha final.'
    );
    expect(container.querySelector('table')).toBeFalsy();
  });

  test('muestra loading cuando se están cargando movimientos', async () => {
    mockHookState = {
      ...mockHookState,
      loadingMovimientos: true,
    };

    await mount();

    await seleccionarDonador('1');

    expect(container.textContent).toContain('Cargando movimientos…');
  });

  test('muestra error de movimientos y permite reintentar', async () => {
    mockHookState = {
      ...mockHookState,
      error: 'Error al cargar movimientos',
    };

    await mount();

    await seleccionarDonador('1');

    expect(container.textContent).toContain('Error al cargar movimientos');

    await act(async () => {
      const retryButton = Array.from(container.querySelectorAll('button')).find((button) =>
        button.textContent.includes('Reintentar')
      );
      retryButton.click();
    });

    expect(mockFetchMovimientosPorDonador).toHaveBeenCalledWith('1');
  });

  test('registra un handler de exportación CSV y limpia al desmontar', async () => {
    await mount();

    expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(expect.any(Function));

    await act(async () => {
      root.unmount();
    });

    root = null;

    expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(null);
  });

  test('exporta CSV cuando hay fondo y movimientos filtrados', async () => {
    await mount();

    await seleccionarDonador('1');

    const handler = getLastCsvHandler();

    await act(async () => {
      handler();
    });

    expect(mockBuildCsvReporteDonaciones).toHaveBeenCalledWith(
      expect.objectContaining({
        id_donador: 1,
        nombre: 'Familia García',
      }),
      expect.arrayContaining([
        expect.objectContaining({
          id_movimiento: 10,
        }),
        expect.objectContaining({
          id_movimiento: 11,
        }),
      ])
    );

    expect(mockTriggerCsvDownload).toHaveBeenCalledWith(
      'reporte_donaciones_Familia_García_20260604_001500.csv',
      'csv-content'
    );
  });

  test('muestra alerta al exportar sin movimientos disponibles', async () => {
    await mount();

    const handler = getLastCsvHandler();

    await act(async () => {
      handler();
    });

    expect(window.alert).toHaveBeenCalledWith(
      'No hay movimientos para exportar con la selección actual.'
    );

    expect(mockTriggerCsvDownload).not.toHaveBeenCalled();
  });
});