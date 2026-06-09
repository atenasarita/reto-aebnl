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
const mockRefetchHistorial = jest.fn();

const mockTriggerCsvDownload = jest.fn();
const mockBuildCsvReporteInventarioHistorial = jest.fn(() => 'csv-content');
const mockExportTimestampSlug = jest.fn(() => '20260603_120000');
const mockSanitizeFilenamePart = jest.fn((value) => String(value).replaceAll('-', ''));

let mockHookState;

const baseData = {
  entradasUnidades: 15,
  salidasUnidades: 7,
  movimientosRegistrados: 2,
  productosPorCategoria: [
    {
      key: 'material',
      label: 'Material médico',
      value: 3,
      porcentaje: 60,
    },
    {
      key: 'medicamento',
      label: 'Medicamento',
      value: 2,
      porcentaje: 40,
    },
  ],
  listaBajoStock: [
    {
      id: 1,
      clave: 'SON-01',
      nombre: 'Sonda',
      cantidad: 3,
      unidadMedida: 'pza',
    },
    {
      id: 2,
      clave: 'VEN-01',
      nombre: 'Venda',
      cantidad: 8,
      unidadMedida: 'rollo',
    },
    {
      id: 3,
      clave: 'GAS-01',
      nombre: 'Gasas',
      cantidad: 15,
      unidadMedida: 'caja',
    },
  ],
  historial: [
    {
      id: 1,
      fecha: '2026-06-03T10:30:00Z',
      clave: 'SON-01',
      nombre: 'Sonda',
      tipo: 'entrada',
      tipoLabel: 'Entrada',
      cantidad: 5,
      motivo: 'Compra',
      usuario: 'Ana Ruiz',
    },
    {
      id: 2,
      fecha: '2026-06-04 12:45:00',
      clave: 'VEN-01',
      nombre: 'Venda',
      tipo: 'salida',
      tipoLabel: 'Salida',
      cantidad: 2,
      motivo: 'Uso en consulta',
      usuario: 'Carlos Pérez',
    },
  ],
};

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: () => ({
    registerCsvExportHandler: mockRegisterCsvExportHandler,
  }),
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  AlertTriangle: () => React.createElement('span', { 'data-testid': 'alert-icon' }),
  Package: () => React.createElement('span', { 'data-testid': 'package-icon' }),
  Search: () => React.createElement('span', { 'data-testid': 'search-icon' }),
}));

jest.mock('../client/src/components/ui/card', () => ({
  __esModule: true,
  Card: ({ children, className }) =>
    React.createElement('section', { className }, children),
  CardHeader: ({ children, className }) =>
    React.createElement('header', { className }, children),
  CardContent: ({ children, className }) =>
    React.createElement('div', { className }, children),
}));

jest.mock('../client/src/components/reportes/DistribucionEtapaVidaList/DistribucionEtapaVidaList', () => ({
  __esModule: true,
  default: ({ distribucionEtapaVida, eyebrow, emptyMessage }) =>
    React.createElement(
      'section',
      { 'data-testid': 'distribucion-categorias' },
      React.createElement('h3', null, eyebrow),
      distribucionEtapaVida.length
        ? distribucionEtapaVida.map((item) =>
            React.createElement('p', { key: item.key }, `${item.label}: ${item.value}`)
          )
        : React.createElement('p', null, emptyMessage)
    ),
}));

jest.mock('../client/src/components/ui/SearchBar', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }) =>
    React.createElement('input', {
      'data-testid': 'searchbar',
      placeholder,
      value,
      onChange: (event) => onChange(event.target.value),
    }),
}));

jest.mock('../client/src/components/ui/Dropdown', () => ({
  __esModule: true,
  default: ({ value, onChange, options = [] }) =>
    React.createElement(
      'select',
      {
        'data-testid': 'dropdown-tipo',
        value,
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

jest.mock('../client/src/components/ui/Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalItems, itemsPerPage, onPageChange }) =>
    React.createElement(
      'div',
      { 'data-testid': 'pagination' },
      React.createElement('span', null, `Página ${currentPage}`),
      React.createElement('span', null, `Total ${totalItems}`),
      React.createElement('span', null, `Por página ${itemsPerPage}`),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => onPageChange(currentPage + 1),
        },
        'Siguiente'
      )
    ),
}));

jest.mock('../client/src/components/reportes/ReportePersonalizado/ReportePersonalizadoShell/ReportePersonalizadoShell', () => ({
  __esModule: true,
  default: ({ children }) =>
    React.createElement('main', { 'data-testid': 'reporte-shell' }, children),
}));

jest.mock('../client/src/components/reportes/ReportesLoading/ReportesLoading', () => ({
  __esModule: true,
  default: ({ message }) =>
    React.createElement('div', { role: 'status' }, message),
}));

jest.mock('../client/src/components/reportes/ReportePersonalizado/reportePersonalizado.utils', () => ({
  __esModule: true,
  defaultRangoMesActual: () => ({
    desde: '2026-06-01',
    hasta: '2026-06-30',
  }),
  esRangoFechaValido: (desde, hasta) => Boolean(desde && hasta && desde <= hasta),
  formatRangoLegible: (desde, hasta) => `${desde} al ${hasta}`,
}));

jest.mock('../client/src/hooks/useReporteInventario', () => ({
  __esModule: true,
  useReporteInventario: (...args) => mockHookState(...args),
}));

jest.mock('../client/src/hooks/useReporteInventario.js', () => ({
  __esModule: true,
  useReporteInventario: (...args) => mockHookState(...args),
}));

jest.mock('../client/src/utils/reportesCsvExport', () => ({
  __esModule: true,
  buildCsvReporteInventarioHistorial: (...args) =>
    mockBuildCsvReporteInventarioHistorial(...args),
  exportTimestampSlug: () => mockExportTimestampSlug(),
  sanitizeFilenamePart: (...args) => mockSanitizeFilenamePart(...args),
  triggerCsvDownload: (...args) => mockTriggerCsvDownload(...args),
}));

jest.mock('../client/src/components/reportes/ReportePersonalizado/PersonalizadoKpiSection/PersonalizadoKpiSection.css', () => ({}));
jest.mock('../client/src/pages/reportes/ReportesMensual/ReportesMensual.css', () => ({}));
jest.mock('../client/src/pages/reportes/ReporteInventario/ReporteInventario.css', () => ({}));

const ReporteInventarioModule = await import(
  '../client/src/pages/reportes/ReporteInventario/ReporteInventario.jsx'
);

const ReporteInventario =
  ReporteInventarioModule.default?.default ||
  ReporteInventarioModule.default ||
  ReporteInventarioModule;

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

describe('ReporteInventario', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.alert = jest.fn();

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

  async function mount() {
    await act(async () => {
      root.render(React.createElement(ReporteInventario));
    });
  }

  test('muestra productos con bajo stock y distribución por categoría', async () => {
    await mount();

    expect(container.textContent).toContain('Productos con bajo stock');
    expect(container.textContent).toContain('Sonda');
    expect(container.textContent).toContain('Venda');
    expect(container.textContent).toContain('Gasas');
    expect(container.textContent).toContain('Productos por categoría');
    expect(container.textContent).toContain('Material médico');
    expect(container.textContent).toContain('Medicamento');
  });

  test('muestra mensaje live con resumen del reporte', async () => {
    await mount();

    expect(container.textContent).toContain('Reporte listo');
    expect(container.textContent).toContain('15 entradas');
    expect(container.textContent).toContain('7 salidas');
    expect(container.textContent).toContain('2 movimientos');
  });

  test('muestra historial de movimientos', async () => {
    await mount();

    expect(container.textContent).toContain('Historial de movimientos');
    expect(container.textContent).toContain('Sonda');
    expect(container.textContent).toContain('Entrada');
    expect(container.textContent).toContain('Ana Ruiz');
    expect(container.textContent).toContain('Venda');
    expect(container.textContent).toContain('Salida');
    expect(container.textContent).toContain('Carlos Pérez');
  });

  test('filtra historial por búsqueda', async () => {
    await mount();

    const searchInput = container.querySelector('[data-testid="searchbar"]');

    await act(async () => {
      changeInput(searchInput, 'Venda');
    });

    expect(container.textContent).toContain('Venda');
    expect(container.textContent).toContain('Carlos Pérez');
    expect(container.textContent).not.toContain('Ana Ruiz');
  });

  test('filtra historial por tipo de movimiento', async () => {
    await mount();

    const dropdown = container.querySelector('[data-testid="dropdown-tipo"]');

    await act(async () => {
      changeInput(dropdown, 'salida');
    });

    const table = container.querySelector('table');

    expect(table.textContent).toContain('Salida');
    expect(table.textContent).toContain('Venda');
    expect(table.textContent).toContain('Carlos Pérez');

    expect(table.textContent).not.toContain('Sonda');
    expect(table.textContent).not.toContain('Ana Ruiz');
  });

  test('muestra mensaje cuando no hay movimientos con los filtros seleccionados', async () => {
    await mount();

    const searchInput = container.querySelector('[data-testid="searchbar"]');

    await act(async () => {
      changeInput(searchInput, 'No existe');
    });

    expect(container.textContent).toContain('No hay movimientos para los filtros seleccionados');
  });

  test('muestra error cuando el rango de fechas es inválido', async () => {
    await mount();

    const fechas = container.querySelectorAll('input[type="date"]');
    const fechaInicial = fechas[0];

    await act(async () => {
      changeInput(fechaInicial, '2026-07-01');
    });

    expect(container.textContent).toContain('La fecha inicial no puede ser posterior a la fecha final');
  });

  test('muestra estado de carga del reporte principal', async () => {
    mockHookState = jest.fn(() => ({
      data: baseData,
      loading: true,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.textContent).toContain('Cargando indicadores de inventario');
  });

  test('muestra error principal y permite reintentar', async () => {
    mockHookState = jest.fn(() => ({
      data: baseData,
      loading: false,
      error: 'Error al cargar inventario',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.textContent).toContain('Error al cargar inventario');

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((button) =>
        button.textContent.includes('Reintentar')
      );
      btn.click();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('muestra estado vacío si no hay productos con bajo stock ni categorías', async () => {
    mockHookState = jest.fn(() => ({
      data: {
        ...baseData,
        productosPorCategoria: [],
        listaBajoStock: [],
        historial: [],
      },
      loading: false,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.textContent).toContain('Sin productos en nivel de bajo stock');
    expect(container.textContent).toContain('Sin productos activos por categoría');
    expect(container.textContent).toContain('Sin movimientos en el periodo');
  });

  test('muestra error del historial y permite reintentar historial', async () => {
    mockHookState = jest.fn((desde, hasta) => {
      if (mockHookState.mock.calls.length % 2 === 0) {
        return {
          data: baseData,
          loading: false,
          error: 'Error historial',
          refetch: mockRefetchHistorial,
        };
      }

      return {
        data: baseData,
        loading: false,
        error: '',
        refetch: mockRefetch,
      };
    });

    await mount();

    expect(container.textContent).toContain('Error historial');

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((button) =>
        button.textContent.includes('Reintentar')
      );
      btn.click();
    });

    expect(mockRefetchHistorial).toHaveBeenCalled();
  });

  test('registra handler de exportación CSV y exporta historial', async () => {
    await mount();

    expect(mockRegisterCsvExportHandler).toHaveBeenCalled();

    const exportHandler = mockRegisterCsvExportHandler.mock.calls.find(
      ([arg]) => typeof arg === 'function'
    )?.[0];

    expect(exportHandler).toBeTruthy();

    await act(async () => {
      exportHandler();
    });

    expect(mockBuildCsvReporteInventarioHistorial).toHaveBeenCalledWith(
      baseData.historial,
      '2026-06-01',
      '2026-06-30'
    );

    expect(mockTriggerCsvDownload).toHaveBeenCalledWith(
      'historial_movimientos_20260601_20260630_20260603_120000.csv',
      'csv-content'
    );
  });

  test('alerta si se intenta exportar con historial cargando', async () => {
    mockHookState = jest.fn(() => ({
      data: baseData,
      loading: true,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    const exportHandler = mockRegisterCsvExportHandler.mock.calls.find(
      ([arg]) => typeof arg === 'function'
    )?.[0];

    await act(async () => {
      exportHandler();
    });

    expect(global.alert).toHaveBeenCalledWith(
      'Espera a que termine de cargar el historial de movimientos.'
    );
  });

  test('limpia handler de exportación al desmontar', async () => {
    await mount();

    await act(async () => {
      root.unmount();
    });

    expect(mockRegisterCsvExportHandler).toHaveBeenCalledWith(null);
  });

  test('Pagination cambia página del historial', async () => {
    const historialGrande = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      fecha: '2026-06-03T10:30:00Z',
      clave: `ITEM-${index + 1}`,
      nombre: `Producto ${index + 1}`,
      tipo: 'entrada',
      tipoLabel: 'Entrada',
      cantidad: index + 1,
      motivo: 'Compra',
      usuario: 'Ana Ruiz',
    }));

    mockHookState = jest.fn(() => ({
      data: {
        ...baseData,
        historial: historialGrande,
      },
      loading: false,
      error: '',
      refetch: mockRefetch,
    }));

    await mount();

    expect(container.textContent).toContain('Producto 1');

    await act(async () => {
      const nextBtn = Array.from(container.querySelectorAll('button')).find((button) =>
        button.textContent.includes('Siguiente')
      );
      nextBtn.click();
    });

    expect(container.textContent).toContain('Página 2');
  });
});