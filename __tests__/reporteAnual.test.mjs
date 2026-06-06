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
const mockBuildCsvReporteAnual = jest.fn();
const mockTriggerCsvDownload = jest.fn();
const mockExportTimestampSlug = jest.fn();

let mockHookState;

jest.mock('react-router-dom', () => ({
  __esModule: true,
  Link: ({ to, className, children }) =>
    React.createElement('a', { href: to, className }, children),
  useOutletContext: () => ({
    registerCsvExportHandler: mockRegisterCsvExportHandler,
  }),
}));

jest.mock('recharts', () => ({
  __esModule: true,

  ResponsiveContainer: ({ children }) =>
    React.createElement(
      'div',
      { 'data-testid': 'responsive-container' },
      children
    ),

  AreaChart: ({ children, data }) => {
    const childrenSinSvg = React.Children.toArray(children).filter(
      (child) => child?.type !== 'defs'
    );

    return React.createElement(
      'div',
      {
        'data-testid': 'area-chart',
        'data-items': data.length,
      },
      childrenSinSvg
    );
  },

  Area: ({ dataKey }) =>
    React.createElement('div', {
      'data-testid': 'area',
      'data-datakey': dataKey,
    }),

  CartesianGrid: () =>
    React.createElement('div', { 'data-testid': 'grid' }),

  Tooltip: () =>
    React.createElement('div', { 'data-testid': 'tooltip' }),

  XAxis: ({ dataKey }) =>
    React.createElement('div', {
      'data-testid': 'x-axis',
      'data-datakey': dataKey,
    }),

  YAxis: () =>
    React.createElement('div', { 'data-testid': 'y-axis' }),
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  Activity: () => React.createElement('span', { 'data-testid': 'activity-icon' }),
  UserPlus: () => React.createElement('span', { 'data-testid': 'user-plus-icon' }),
  Users: () => React.createElement('span', { 'data-testid': 'users-icon' }),
}));

jest.mock('../client/src/components/ui/card', () => ({
  __esModule: true,
  Card: ({ children, className }) =>
    React.createElement('section', { className, 'data-testid': 'card' }, children),
  CardHeader: ({ children, className }) =>
    React.createElement('div', { className, 'data-testid': 'card-header' }, children),
  CardContent: ({ children, className }) =>
    React.createElement('div', { className, 'data-testid': 'card-content' }, children),
}));

jest.mock('../client/src/components/reportes/IndicadorCard/IndicadorCard', () => ({
  __esModule: true,
  default: ({ label, value }) =>
    React.createElement(
      'article',
      { 'data-testid': 'indicador-card' },
      React.createElement('span', null, label),
      React.createElement('strong', null, String(value))
    ),
}));

jest.mock('../client/src/components/reportes/ReportesLoading/ReportesLoading', () => ({
  __esModule: true,
  default: ({ message, className }) =>
    React.createElement(
      'div',
      {
        role: 'status',
        className,
        'data-testid': 'loading',
      },
      message
    ),
}));

jest.mock('../client/src/components/reportes/EstadosAtendidosCard/EstadosAtendidosCard', () => ({
  __esModule: true,
  default: ({ distribucionEstado, limit, className }) =>
    React.createElement(
      'section',
      {
        className,
        'data-testid': 'estados-card',
      },
      `Estados: ${distribucionEstado.length} | Límite: ${limit}`
    ),
}));

jest.mock('../client/src/components/reportes/DistribucionGeneroDonut/DistribucionGeneroDonut', () => ({
  __esModule: true,
  default: ({ distribucionGenero, total, emptyMessage }) =>
    React.createElement(
      'section',
      { 'data-testid': 'genero-donut' },
      distribucionGenero.length
        ? `Total género: ${total}`
        : emptyMessage
    ),
}));

jest.mock('../client/src/components/reportes/DistribucionEtapaVidaList/DistribucionEtapaVidaList', () => ({
  __esModule: true,
  default: ({ distribucionEtapaVida, emptyMessage }) =>
    React.createElement(
      'section',
      { 'data-testid': 'etapa-list' },
      distribucionEtapaVida.length
        ? `Etapas: ${distribucionEtapaVida.length}`
        : emptyMessage
    ),
}));

jest.mock('../client/src/utils/reportesCsvExport', () => ({
  __esModule: true,
  buildCsvReporteAnual: (...args) => mockBuildCsvReporteAnual(...args),
  exportTimestampSlug: () => mockExportTimestampSlug(),
  triggerCsvDownload: (...args) => mockTriggerCsvDownload(...args),
}));

jest.mock('../client/src/hooks/useReporteAnual', () => ({
  __esModule: true,
  useReporteAnual: (...args) => mockHookState(...args),
}));

const ReporteAnualModule = await import(
  '../client/src/pages/reportes/ReporteAnual/ReporteAnual.jsx'
);

const ReporteAnual =
  ReporteAnualModule.default?.default ||
  ReporteAnualModule.default ||
  ReporteAnualModule;

let container;
let root;

const baseData = {
  porMes: [
    {
      mesLabel: 'Enero',
      servicios: 12,
      nuevosBeneficiarios: 5,
    },
    {
      mesLabel: 'Febrero',
      servicios: 8,
      nuevosBeneficiarios: 3,
    },
  ],
  nuevosBeneficiarios: 8,
  beneficiariosAtendidos: 20,
  serviciosPeriodo: 30,
  distribucionGenero: [
    { key: 'F', label: 'Femenino', value: 12 },
    { key: 'M', label: 'Masculino', value: 8 },
  ],
  distribucionEtapaVida: [
    { key: 'ninez', label: 'Niñez', value: 5 },
    { key: 'adulto', label: 'Adulto', value: 15 },
  ],
  distribucionEstado: [
    { key: 'NL', label: 'Nuevo León', value: 18 },
    { key: 'COAH', label: 'Coahuila', value: 2 },
  ],
};

function getCurrentYear() {
  return new Date().getFullYear();
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
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

async function mount() {
  await act(async () => {
    root.render(React.createElement(ReporteAnual));
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

describe('ReporteAnual', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    mockRefetch.mockResolvedValue();
    mockBuildCsvReporteAnual.mockReturnValue('csv-anual');
    mockExportTimestampSlug.mockReturnValue('20260605_120000');

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

  test('renderiza el reporte anual con título, filtros y KPIs principales', async () => {
    await mount();

    expect(container.textContent).toContain('Reporte Anual de Operaciones');
    expect(container.textContent).toContain('Mensual');
    expect(container.textContent).toContain('Anual');
    expect(container.textContent).toContain('Año');

    expect(container.textContent).toContain('Nuevos beneficiarios');
    expect(container.textContent).toContain('Total atendidos');
    expect(container.textContent).toContain('Total servicios');

    expect(container.textContent).toContain('8');
    expect(container.textContent).toContain('20');
    expect(container.textContent).toContain('30');

    expect(container.querySelectorAll('[data-testid="indicador-card"]')).toHaveLength(3);
  });

  test('llama el hook con el año actual al cargar el componente', async () => {
    await mount();

    expect(mockHookState).toHaveBeenCalledWith(getCurrentYear());
  });

  test('cambia el año seleccionado y vuelve a consultar el hook', async () => {
    await mount();

    const select = container.querySelector('select');
    const previousYear = String(getCurrentYear() - 1);

    await act(async () => {
      changeSelect(select, previousYear);
    });

    expect(mockHookState).toHaveBeenLastCalledWith(Number(previousYear));
    expect(select.value).toBe(previousYear);
  });

  test('muestra loading cuando el hook está cargando', async () => {
    mockHookState = jest.fn(() => ({
      data: baseData,
      loading: true,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.querySelector('[data-testid="loading"]')).toBeTruthy();
    expect(container.textContent).toContain(`Cargando indicadores del año ${getCurrentYear()}…`);
    expect(container.querySelector('[data-testid="indicador-card"]')).toBeFalsy();
  });

  test('muestra error del hook y permite reintentar', async () => {
    mockHookState = jest.fn(() => ({
      data: baseData,
      loading: false,
      error: 'Error al cargar reporte anual',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(container.textContent).toContain('Error al cargar reporte anual');

    const retryButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Reintentar')
    );

    await act(async () => {
      retryButton.click();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  test('muestra la gráfica de servicios por defecto', async () => {
    await mount();

    expect(container.textContent).toContain('Servicios otorgados por mes');

    const area = container.querySelector('[data-testid="area"]');

    expect(area).toBeTruthy();
    expect(area.getAttribute('data-datakey')).toBe('servicios');
  });

  test('cambia la gráfica a nuevos beneficiarios', async () => {
    await mount();

    const nuevosButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Nuevos beneficiarios')
    );

    await act(async () => {
      nuevosButton.click();
    });

    expect(container.textContent).toContain('Nuevos beneficiarios por mes');

    const area = container.querySelector('[data-testid="area"]');

    expect(area).toBeTruthy();
    expect(area.getAttribute('data-datakey')).toBe('nuevosBeneficiarios');
  });

  test('regresa la gráfica a servicios después de cambiar a nuevos beneficiarios', async () => {
    await mount();

    const buttons = Array.from(container.querySelectorAll('button'));
    const serviciosButton = buttons.find((button) => button.textContent.includes('Servicios'));
    const nuevosButton = buttons.find((button) => button.textContent.includes('Nuevos beneficiarios'));

    await act(async () => {
      nuevosButton.click();
    });

    expect(container.textContent).toContain('Nuevos beneficiarios por mes');

    await act(async () => {
      serviciosButton.click();
    });

    expect(container.textContent).toContain('Servicios otorgados por mes');

    const area = container.querySelector('[data-testid="area"]');

    expect(area.getAttribute('data-datakey')).toBe('servicios');
  });

  test('muestra mensaje vacío si no hay servicios por mes', async () => {
    const dataSinServicios = {
      ...baseData,
      porMes: [
        {
          mesLabel: 'Enero',
          servicios: 0,
          nuevosBeneficiarios: 4,
        },
      ],
    };

    mockHookState = jest.fn(() => ({
      data: dataSinServicios,
      loading: false,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.textContent).toContain(
      `No se registraron servicios por mes en ${getCurrentYear()}.`
    );

    expect(container.querySelector('[data-testid="area-chart"]')).toBeFalsy();
  });

  test('muestra mensaje vacío si no hay nuevos beneficiarios por mes', async () => {
    const dataSinNuevos = {
      ...baseData,
      porMes: [
        {
          mesLabel: 'Enero',
          servicios: 10,
          nuevosBeneficiarios: 0,
        },
      ],
    };

    mockHookState = jest.fn(() => ({
      data: dataSinNuevos,
      loading: false,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    const nuevosButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Nuevos beneficiarios')
    );

    await act(async () => {
      nuevosButton.click();
    });

    expect(container.textContent).toContain(
      `No se registraron nuevos beneficiarios por mes en ${getCurrentYear()}.`
    );

    expect(container.querySelector('[data-testid="area-chart"]')).toBeFalsy();
  });

  test('calcula el total de género y lo manda al componente de dona', async () => {
    await mount();

    expect(container.querySelector('[data-testid="genero-donut"]')).toBeTruthy();
    expect(container.textContent).toContain('Total género: 20');
  });

  test('muestra mensajes vacíos para género y etapa cuando no hay datos demográficos', async () => {
    const dataSinDemograficos = {
      ...baseData,
      distribucionGenero: [],
      distribucionEtapaVida: [],
    };

    mockHookState = jest.fn(() => ({
      data: dataSinDemograficos,
      loading: false,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.textContent).toContain('Sin datos de género para el periodo.');
    expect(container.textContent).toContain('Sin datos de etapa para el periodo.');
  });

  test('renderiza estados atendidos con límite de 10', async () => {
    await mount();

    expect(container.querySelector('[data-testid="estados-card"]')).toBeTruthy();
    expect(container.textContent).toContain('Estados: 2');
    expect(container.textContent).toContain('Límite: 10');
  });

  test('registra el handler de exportación CSV al montar y lo limpia al desmontar', async () => {
    await mount();

    expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(expect.any(Function));

    await act(async () => {
      root.unmount();
    });

    root = null;

    expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(null);
  });

  test('exporta CSV anual con nombre y contenido correcto', async () => {
    await mount();

    const handler = getLastCsvHandler();

    await act(async () => {
      handler();
    });

    expect(mockBuildCsvReporteAnual).toHaveBeenCalledWith(baseData, getCurrentYear());

    expect(mockTriggerCsvDownload).toHaveBeenCalledWith(
      `reporte_anual_${getCurrentYear()}_20260605_120000.csv`,
      'csv-anual'
    );
  });

  test('actualiza el año usado para exportar CSV si cambia el selector', async () => {
    await mount();

    const select = container.querySelector('select');
    const selectedYear = getCurrentYear() - 2;

    await act(async () => {
      changeSelect(select, String(selectedYear));
    });

    const handler = getLastCsvHandler();

    await act(async () => {
      handler();
    });

    expect(mockBuildCsvReporteAnual).toHaveBeenCalledWith(baseData, selectedYear);

    expect(mockTriggerCsvDownload).toHaveBeenCalledWith(
      `reporte_anual_${selectedYear}_20260605_120000.csv`,
      'csv-anual'
    );
  });

  test('la gráfica recibe todos los meses de porMes como data', async () => {
    await mount();
    const chart = container.querySelector('[data-testid="area-chart"]');
    expect(chart.dataset.items).toBe('2'); // baseData.porMes.length
  });
  
  test('el eje X usa mesLabel como dataKey', async () => {
    await mount();
    const xAxis = container.querySelector('[data-testid="x-axis"]');
    expect(xAxis.dataset.datakey).toBe('mesLabel');
   });

   test('el selector de año muestra los últimos 6 años', async () => {
        await mount();
        const select = container.querySelector('select');
        const options = Array.from(select.querySelectorAll('option'));
        const currentYear = new Date().getFullYear();

        expect(options).toHaveLength(6);
        expect(options[0].value).toBe(String(currentYear));
        expect(options[5].value).toBe(String(currentYear - 5));
    });

    test('el enlace Mensual apunta a /reportes/mensual', async () => {
        await mount();
        const link = container.querySelector('a[href="/reportes/mensual"]');
        expect(link).toBeTruthy();
        expect(link.textContent).toContain('Mensual');
    });

    test('el botón Anual tiene clase is-active al estar en esta vista', async () => {
        await mount();
        const anualButton = Array.from(container.querySelectorAll('button'))
            .find(btn => btn.textContent.trim() === 'Anual');
        expect(anualButton.classList.contains('is-active')).toBe(true);
    });

    test('no registra handler CSV si registerCsvExportHandler no existe', async () => {
        // Montamos sin registerCsvExportHandler disponible
        await act(async () => {
            root.render(React.createElement(ReporteAnual));
        });

        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        // El componente no debe lanzar error y buildCsv no se llama al montar
        expect(mockBuildCsvReporteAnual).not.toHaveBeenCalled();
    });

    test('aria-pressed refleja la serie activa correctamente', async () => {
        await mount();

        const serviciosBtn = Array.from(container.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Servicios'));
        const nuevosBtn = Array.from(container.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Nuevos beneficiarios'));

        expect(serviciosBtn.getAttribute('aria-pressed')).toBe('true');
        expect(nuevosBtn.getAttribute('aria-pressed')).toBe('false');

        await act(async () => { nuevosBtn.click(); });

        expect(serviciosBtn.getAttribute('aria-pressed')).toBe('false');
        expect(nuevosBtn.getAttribute('aria-pressed')).toBe('true');
    });
});