/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockRegisterCsvExportHandler = jest.fn();
const mockRefetch = jest.fn();
const mockBuildCsvReporteMensual = jest.fn();
const mockTriggerCsvDownload = jest.fn();
const mockExportTimestampSlug = jest.fn();

let mockHookState;

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: () => ({ registerCsvExportHandler: mockRegisterCsvExportHandler }),
  Link: ({ to, children, className }) =>
    React.createElement('a', { href: to, className, 'data-testid': 'link-anual' }, children),
}));

jest.mock('recharts', () => ({
  __esModule: true,
  Area: () => null,
  AreaChart: ({ children }) =>
    React.createElement('div', { 'data-testid': 'area-chart' }, children),
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }) =>
    React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  Activity: () => React.createElement('span', { 'data-testid': 'icon-activity' }),
  UserPlus: () => React.createElement('span', { 'data-testid': 'icon-userplus' }),
  Users: () => React.createElement('span', { 'data-testid': 'icon-users' }),
}));

jest.mock('../client/src/components/ui/card', () => ({
  __esModule: true,
  Card: ({ children }) => React.createElement('div', { 'data-testid': 'card' }, children),
  CardContent: ({ children }) =>
    React.createElement('div', { 'data-testid': 'card-content' }, children),
  CardHeader: ({ children }) =>
    React.createElement('div', { 'data-testid': 'card-header' }, children),
}));

jest.mock('../client/src/hooks/useReporteMensual', () => ({
  __esModule: true,
  useReporteMensual: (...args) => mockHookState(...args),
}));

jest.mock(
  '../client/src/components/reportes/IndicadorCard/IndicadorCard',
  () => ({
    __esModule: true,
    default: ({ label, value }) =>
      React.createElement(
        'div',
        { 'data-testid': 'indicador-card' },
        React.createElement('span', { 'data-testid': 'indicador-label' }, label),
        React.createElement('span', { 'data-testid': 'indicador-value' }, String(value ?? ''))
      ),
  })
);

jest.mock(
  '../client/src/components/reportes/DistribucionGeneroDonut/DistribucionGeneroDonut',
  () => ({
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'donut-genero' }),
  })
);

jest.mock(
  '../client/src/components/reportes/DistribucionEtapaVidaList/DistribucionEtapaVidaList',
  () => ({
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'etapa-vida-list' }),
  })
);

jest.mock(
  '../client/src/components/reportes/EstadosAtendidosCard/EstadosAtendidosCard',
  () => ({
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'estados-atendidos' }),
  })
);

jest.mock('../client/src/components/reportes/ReportesLoading/ReportesLoading', () => ({
  __esModule: true,
  default: ({ message }) =>
    React.createElement('div', { role: 'status', 'data-testid': 'loading' }, message),
}));

jest.mock('../client/src/utils/reportesCsvExport', () => ({
  __esModule: true,
  buildCsvReporteMensual: (...args) => mockBuildCsvReporteMensual(...args),
  triggerCsvDownload: (...args) => mockTriggerCsvDownload(...args),
  exportTimestampSlug: () => mockExportTimestampSlug(),
}));

const ReportesMensualModule = await import(
  '../client/src/pages/reportes/ReportesMensual/ReportesMensual.jsx'
);
const ReportesMensual =
  ReportesMensualModule.default?.default ||
  ReportesMensualModule.default ||
  ReportesMensualModule;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseData = {
  mesNombre: 'Junio',
  nuevosBeneficiarios: 12,
  beneficiariosAtendidos: 85,
  serviciosPeriodo: 234,
  serviciosPorDia: [
    { dia: 1, conteo: 5 },
    { dia: 2, conteo: 8 },
  ],
  distribucionGenero: [
    { key: 'F', label: 'Femenino', value: 50 },
    { key: 'M', label: 'Masculino', value: 35 },
  ],
  distribucionEtapaVida: [{ key: 'ninez', label: 'Niñez', value: 40 }],
  distribucionEstado: [{ key: 'NL', label: 'Nuevo León', value: 85 }],
};

const emptyData = {
  mesNombre: '',
  nuevosBeneficiarios: 0,
  beneficiariosAtendidos: 0,
  serviciosPeriodo: 0,
  serviciosPorDia: [],
  distribucionGenero: [],
  distribucionEtapaVida: [],
  distribucionEstado: [],
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  jest.clearAllMocks();
  mockExportTimestampSlug.mockReturnValue('20260607_120000');
  mockBuildCsvReporteMensual.mockReturnValue('csv-content');

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function mount() {
  await act(async () => {
    root.render(React.createElement(ReportesMensual));
  });
}

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

function changeSelect(select, value) {
  setNativeValue(select, value);
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function getMesSelect() {
  return container.querySelectorAll('select')[0];
}

function getAnioSelect() {
  return container.querySelectorAll('select')[1];
}

function getLastCsvHandler() {
  return mockRegisterCsvExportHandler.mock.calls
    .map((call) => call[0])
    .filter((h) => typeof h === 'function')
    .at(-1);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ReportesMensual', () => {
  describe('renderizado', () => {
    test('muestra el título "Reporte Mensual de Operaciones"', async () => {
      await mount();

      expect(container.textContent).toContain('Reporte Mensual de Operaciones');
    });

    test('renderiza los selectores de mes y año', async () => {
      await mount();

      expect(getMesSelect()).not.toBeNull();
      expect(getAnioSelect()).not.toBeNull();
    });

    test('el selector de mes tiene las 12 opciones', async () => {
      await mount();

      expect(getMesSelect().options.length).toBe(12);
    });

    test('el selector de año tiene 6 opciones', async () => {
      await mount();

      expect(getAnioSelect().options.length).toBe(6);
    });

    test('renderiza el enlace a la vista anual', async () => {
      await mount();

      const link = container.querySelector('[data-testid="link-anual"]');
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('/reportes/anual');
    });
  });

  describe('valores iniciales de los selectores', () => {
    test('el mes inicial corresponde al mes actual', async () => {
      await mount();

      const currentMonth = new Date().getMonth() + 1;
      expect(Number(getMesSelect().value)).toBe(currentMonth);
    });

    test('el año inicial corresponde al año actual', async () => {
      await mount();

      const currentYear = new Date().getFullYear();
      expect(Number(getAnioSelect().value)).toBe(currentYear);
    });

    test('llama al hook con el mes y año actuales al montar', async () => {
      await mount();

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      expect(mockHookState).toHaveBeenCalledWith(currentMonth, currentYear);
    });
  });

  describe('cambio de selectores', () => {
    test('al cambiar el mes, llama al hook con el nuevo mes', async () => {
      await mount();

      await act(async () => {
        changeSelect(getMesSelect(), '3');
      });

      expect(mockHookState).toHaveBeenCalledWith(3, expect.any(Number));
    });

    test('al cambiar el año, llama al hook con el nuevo año', async () => {
      await mount();

      const prevYear = new Date().getFullYear() - 1;

      await act(async () => {
        changeSelect(getAnioSelect(), String(prevYear));
      });

      expect(mockHookState).toHaveBeenCalledWith(expect.any(Number), prevYear);
    });
  });

  describe('estado de carga', () => {
    test('muestra el mensaje de carga con el nombre del mes y el año', async () => {
      mockHookState = jest.fn(() => ({
        data: { ...emptyData, mesNombre: 'Junio' },
        loading: true,
        error: '',
        refetch: mockRefetch,
      }));

      await mount();

      expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="indicador-card"]')).toBeNull();
    });
  });

  describe('estado de error', () => {
    test('muestra el mensaje de error', async () => {
      mockHookState = jest.fn(() => ({
        data: emptyData,
        loading: false,
        error: 'Error al cargar datos',
        refetch: mockRefetch,
      }));

      await mount();

      expect(container.textContent).toContain('Error al cargar datos');
    });

    test('al hacer clic en "Reintentar", llama a refetch', async () => {
      mockHookState = jest.fn(() => ({
        data: emptyData,
        loading: false,
        error: 'Error al cargar datos',
        refetch: mockRefetch,
      }));

      await mount();

      await act(async () => {
        container.querySelector('[role="alert"] button').click();
      });

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('KPIs', () => {
    test('renderiza los tres IndicadorCard', async () => {
      await mount();

      expect(container.querySelectorAll('[data-testid="indicador-card"]').length).toBe(3);
    });

    test('muestra la etiqueta "Nuevos beneficiarios"', async () => {
      await mount();

      const labels = Array.from(container.querySelectorAll('[data-testid="indicador-label"]')).map(
        (el) => el.textContent
      );
      expect(labels).toContain('Nuevos beneficiarios');
    });

    test('muestra la etiqueta "Total atendidos"', async () => {
      await mount();

      const labels = Array.from(container.querySelectorAll('[data-testid="indicador-label"]')).map(
        (el) => el.textContent
      );
      expect(labels).toContain('Total atendidos');
    });

    test('muestra la etiqueta "Total servicios"', async () => {
      await mount();

      const labels = Array.from(container.querySelectorAll('[data-testid="indicador-label"]')).map(
        (el) => el.textContent
      );
      expect(labels).toContain('Total servicios');
    });
  });

  describe('gráfica de servicios por día', () => {
    test('muestra la gráfica cuando hay servicios registrados', async () => {
      await mount();

      expect(container.querySelector('[data-testid="area-chart"]')).not.toBeNull();
    });

    test('muestra mensaje de "No se registraron servicios" cuando serviciosPorDia están en cero', async () => {
      mockHookState = jest.fn(() => ({
        data: {
          ...baseData,
          mesNombre: 'Junio',
          serviciosPorDia: [
            { dia: 1, conteo: 0 },
            { dia: 2, conteo: 0 },
          ],
        },
        loading: false,
        error: '',
        refetch: mockRefetch,
      }));

      await mount();

      expect(container.querySelector('[data-testid="area-chart"]')).toBeNull();
      expect(container.textContent).toContain('No se registraron servicios en Junio');
    });

    test('muestra el rango "mesNombre anio" en la cabecera del gráfico', async () => {
      await mount();

      const currentYear = new Date().getFullYear();
      expect(container.textContent).toContain(`Junio ${currentYear}`);
    });
  });

  describe('paneles secundarios', () => {
    test('renderiza el donut de género', async () => {
      await mount();

      expect(container.querySelector('[data-testid="donut-genero"]')).not.toBeNull();
    });

    test('renderiza la lista de etapas de vida', async () => {
      await mount();

      expect(container.querySelector('[data-testid="etapa-vida-list"]')).not.toBeNull();
    });

    test('renderiza la tarjeta de estados atendidos', async () => {
      await mount();

      expect(container.querySelector('[data-testid="estados-atendidos"]')).not.toBeNull();
    });
  });

  describe('exportación CSV', () => {
    test('registra el handler de exportación al montar', async () => {
      await mount();

      expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(expect.any(Function));
    });

    test('el handler llama a buildCsvReporteMensual con datos, mesNombre y año', async () => {
      await mount();

      await act(async () => {
        getLastCsvHandler()();
      });

      const currentYear = new Date().getFullYear();
      expect(mockBuildCsvReporteMensual).toHaveBeenCalledWith(baseData, 'Junio', currentYear);
    });

    test('el handler llama a triggerCsvDownload con el nombre correcto', async () => {
      await mount();

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      await act(async () => {
        getLastCsvHandler()();
      });

      expect(mockTriggerCsvDownload).toHaveBeenCalledWith(
        `reporte_mensual_${currentYear}_${currentMonth}_20260607_120000.csv`,
        'csv-content'
      );
    });

    test('limpia el handler al desmontar', async () => {
      await mount();

      await act(async () => {
        root.unmount();
      });
      root = null;

      expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(null);
    });
  });
});
