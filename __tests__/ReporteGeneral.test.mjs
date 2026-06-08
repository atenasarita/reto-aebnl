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
const mockBuildCsvReporteGeneral = jest.fn();
const mockTriggerCsvDownload = jest.fn();
const mockExportTimestampSlug = jest.fn();

let mockHookState;

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: () => ({ registerCsvExportHandler: mockRegisterCsvExportHandler }),
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  Users: () => React.createElement('span', { 'data-testid': 'icon-users' }),
  UserCheck: () => React.createElement('span', { 'data-testid': 'icon-usercheck' }),
  UserMinus: () => React.createElement('span', { 'data-testid': 'icon-userminus' }),
  X: () => React.createElement('span', { 'data-testid': 'icon-x' }),
}));

jest.mock('../client/src/components/ui/card', () => ({
  __esModule: true,
  Card: ({ children }) => React.createElement('div', { 'data-testid': 'card' }, children),
  CardContent: ({ children }) => React.createElement('div', { 'data-testid': 'card-content' }, children),
  CardHeader: ({ children }) => React.createElement('div', { 'data-testid': 'card-header' }, children),
}));

jest.mock('../client/src/hooks/useReporteGeneral', () => ({
  __esModule: true,
  useReporteGeneral: () => mockHookState(),
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
  '../client/src/components/reportes/MapaBeneficiariosPorEstado/MapaBeneficiariosPorEstado',
  () => ({
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'mapa' }),
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

jest.mock('../client/src/components/reportes/ReportesLoading/ReportesLoading', () => ({
  __esModule: true,
  default: ({ message }) =>
    React.createElement('div', { role: 'status', 'data-testid': 'loading' }, message),
}));

jest.mock('../client/src/utils/reportesCsvExport', () => ({
  __esModule: true,
  buildCsvReporteGeneral: (...args) => mockBuildCsvReporteGeneral(...args),
  triggerCsvDownload: (...args) => mockTriggerCsvDownload(...args),
  exportTimestampSlug: () => mockExportTimestampSlug(),
}));

const ReporteGeneralModule = await import(
  '../client/src/pages/reportes/ReporteGeneral/ReporteGeneral.jsx'
);
const ReporteGeneral =
  ReporteGeneralModule.default?.default ||
  ReporteGeneralModule.default ||
  ReporteGeneralModule;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const emptyData = {
  totalBeneficiarios: 0,
  beneficiariosActivos: 0,
  beneficiariosInactivos: 0,
  distribucionGenero: [],
  distribucionEtapaVida: [],
  distribucionEstado: [],
};

const baseData = {
  totalBeneficiarios: 150,
  beneficiariosActivos: 120,
  beneficiariosInactivos: 30,
  distribucionGenero: [
    { key: 'F', label: 'Femenino', value: 90 },
    { key: 'M', label: 'Masculino', value: 60 },
  ],
  distribucionEtapaVida: [
    { key: 'ninez', label: 'Niñez', value: 50 },
    { key: 'adulto', label: 'Adulto', value: 100 },
  ],
  distribucionEstado: [
    { key: 'JAL', label: 'Jalisco', value: 30, porcentaje: 20 },
    { key: 'NL', label: 'Nuevo León', value: 80, porcentaje: 53 },
    { key: 'COAH', label: 'Coahuila', value: 70, porcentaje: 47 },
  ],
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
  mockBuildCsvReporteGeneral.mockReturnValue('csv-content');

  // Ensure dialog methods exist in jsdom
  HTMLDialogElement.prototype.showModal = jest.fn(function () {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = jest.fn(function () {
    this.removeAttribute('open');
  });

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
    root.render(React.createElement(ReporteGeneral));
  });
}

function getDialog() {
  return document.body.querySelector('dialog');
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

describe('ReporteGeneral', () => {
  describe('estado de carga', () => {
    test('muestra el mensaje de carga mientras loading es true', async () => {
      mockHookState = jest.fn(() => ({
        data: emptyData,
        loading: true,
        error: '',
        refetch: mockRefetch,
      }));

      await mount();

      expect(container.textContent).toContain('Sincronizando indicadores del tablero…');
      expect(container.querySelector('[data-testid="indicador-card"]')).toBeNull();
    });
  });

  describe('estado de error', () => {
    test('muestra el mensaje de error', async () => {
      mockHookState = jest.fn(() => ({
        data: emptyData,
        loading: false,
        error: 'Error de conexión',
        refetch: mockRefetch,
      }));

      await mount();

      expect(container.textContent).toContain('Error de conexión');
    });

    test('al hacer clic en "Reintentar", llama a refetch', async () => {
      mockHookState = jest.fn(() => ({
        data: emptyData,
        loading: false,
        error: 'Error de conexión',
        refetch: mockRefetch,
      }));

      await mount();

      await act(async () => {
        container.querySelector('[role="alert"] button').click();
      });

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('renderizado de KPI y paneles', () => {
    test('renderiza tres IndicadorCard', async () => {
      await mount();

      expect(container.querySelectorAll('[data-testid="indicador-card"]').length).toBe(3);
    });

    test('muestra la etiqueta "Total de beneficiarios"', async () => {
      await mount();

      const labels = Array.from(container.querySelectorAll('[data-testid="indicador-label"]')).map(
        (el) => el.textContent
      );
      expect(labels).toContain('Total de beneficiarios');
    });

    test('muestra la etiqueta "Beneficiarios activos"', async () => {
      await mount();

      const labels = Array.from(container.querySelectorAll('[data-testid="indicador-label"]')).map(
        (el) => el.textContent
      );
      expect(labels).toContain('Beneficiarios activos');
    });

    test('muestra la etiqueta "Beneficiarios inactivos"', async () => {
      await mount();

      const labels = Array.from(container.querySelectorAll('[data-testid="indicador-label"]')).map(
        (el) => el.textContent
      );
      expect(labels).toContain('Beneficiarios inactivos');
    });

    test('renderiza el mapa, el donut y la lista de etapas', async () => {
      await mount();

      expect(container.querySelector('[data-testid="mapa"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="donut-genero"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="etapa-vida-list"]')).not.toBeNull();
    });

    test('renderiza el botón "Ver detalles >"', async () => {
      await mount();

      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Ver detalles')
      );
      expect(btn).not.toBeNull();
    });
  });

  describe('diálogo de estados', () => {
    test('el diálogo no está abierto inicialmente', async () => {
      await mount();

      expect(getDialog()?.hasAttribute('open')).toBe(false);
    });

    test('al hacer clic en "Ver detalles >", abre el diálogo', async () => {
      await mount();

      await act(async () => {
        Array.from(container.querySelectorAll('button'))
          .find((b) => b.textContent.includes('Ver detalles'))
          .click();
      });

      expect(getDialog()?.hasAttribute('open')).toBe(true);
    });

    test('al hacer clic en el botón de cierre, cierra el diálogo', async () => {
      await mount();

      await act(async () => {
        Array.from(container.querySelectorAll('button'))
          .find((b) => b.textContent.includes('Ver detalles'))
          .click();
      });

      await act(async () => {
        document.body.querySelector('[aria-label="Cerrar"]').click();
      });

      expect(getDialog()?.hasAttribute('open')).toBe(false);
    });

    test('el diálogo muestra los estados ordenados de mayor a menor', async () => {
      await mount();

      const rows = Array.from(document.body.querySelectorAll('dialog tbody tr'));
      expect(rows[0].textContent).toContain('Nuevo León');
      expect(rows[1].textContent).toContain('Coahuila');
      expect(rows[2].textContent).toContain('Jalisco');
    });

    test('muestra el porcentaje de cada estado', async () => {
      await mount();

      const tableText = document.body.querySelector('dialog tbody').textContent;
      expect(tableText).toContain('53%');
      expect(tableText).toContain('47%');
    });

    test('muestra la suma total de beneficiarios por estado', async () => {
      await mount();

      const footerText = document.body.querySelector('dialog').textContent;
      // 80 + 70 + 30 = 180
      expect(footerText).toContain('180');
    });

    test('muestra "No hay datos" cuando distribucionEstado está vacío', async () => {
      mockHookState = jest.fn(() => ({
        data: { ...baseData, distribucionEstado: [] },
        loading: false,
        error: '',
        refetch: mockRefetch,
      }));

      await mount();

      expect(document.body.querySelector('dialog').textContent).toContain(
        'No hay datos por estado para mostrar.'
      );
    });

    test('ordena estados con igual valor alfabéticamente', async () => {
      mockHookState = jest.fn(() => ({
        data: {
          ...baseData,
          distribucionEstado: [
            { key: 'ZAC', label: 'Zacatecas', value: 50, porcentaje: 50 },
            { key: 'COAH', label: 'Coahuila', value: 50, porcentaje: 50 },
          ],
        },
        loading: false,
        error: '',
        refetch: mockRefetch,
      }));

      await mount();

      const rows = Array.from(document.body.querySelectorAll('dialog tbody tr'));
      expect(rows[0].textContent).toContain('Coahuila');
      expect(rows[1].textContent).toContain('Zacatecas');
    });
  });

  describe('exportación CSV', () => {
    test('registra el handler de exportación al montar', async () => {
      await mount();

      expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(expect.any(Function));
    });

    test('el handler llama a buildCsvReporteGeneral con los datos del reporte', async () => {
      await mount();

      await act(async () => {
        getLastCsvHandler()();
      });

      expect(mockBuildCsvReporteGeneral).toHaveBeenCalledWith(baseData);
    });

    test('el handler llama a triggerCsvDownload con el nombre correcto', async () => {
      await mount();

      await act(async () => {
        getLastCsvHandler()();
      });

      expect(mockTriggerCsvDownload).toHaveBeenCalledWith(
        'reporte_general_20260607_120000.csv',
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
