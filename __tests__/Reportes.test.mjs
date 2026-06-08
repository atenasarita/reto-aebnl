/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let capturedContext = null;
const mockOutletHandler = jest.fn();

jest.mock('react-router-dom', () => ({
  __esModule: true,
  Outlet: ({ context }) => {
    capturedContext = context;
    return React.createElement(
      'div',
      { 'data-testid': 'outlet' },
      React.createElement(
        'button',
        {
          type: 'button',
          'data-testid': 'register-handler',
          onClick: () => context?.registerCsvExportHandler(mockOutletHandler),
        },
        'Register handler'
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          'data-testid': 'clear-handler',
          onClick: () => context?.registerCsvExportHandler(null),
        },
        'Clear handler'
      )
    );
  },
}));

jest.mock(
  '../client/src/components/layout/reportes/ReportesTabsNav/ReportesTabsNav',
  () => ({
    __esModule: true,
    default: ({ items }) =>
      React.createElement(
        'nav',
        { 'data-testid': 'tabs-nav' },
        items?.map((item) =>
          React.createElement(
            'span',
            { key: item.to, 'data-testid': `tab-${item.to}` },
            item.label
          )
        )
      ),
  })
);

const ReportesModule = await import(
  '../client/src/pages/reportes/Reportes/Reportes.jsx'
);
const Reportes =
  ReportesModule.default?.default || ReportesModule.default || ReportesModule;

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container;
let root;
let consoleErrorSpy;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  capturedContext = null;
  jest.clearAllMocks();
  global.alert = jest.fn();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  consoleErrorSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function mount() {
  await act(async () => {
    root.render(React.createElement(Reportes));
  });
}

function getExportCsvBtn() {
  return Array.from(container.querySelectorAll('button')).find(
    (b) => b.textContent.trim() === 'Exportar CSV'
  );
}

async function clickExportCsv() {
  await act(async () => {
    getExportCsvBtn().click();
  });
}

async function registerHandler() {
  await act(async () => {
    container.querySelector('[data-testid="register-handler"]').click();
  });
}

async function clearHandler() {
  await act(async () => {
    container.querySelector('[data-testid="clear-handler"]').click();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Reportes', () => {
  describe('renderizado', () => {
    test('muestra el título "Panel Reportes"', async () => {
      await mount();

      expect(container.querySelector('h1').textContent).toBe('Panel Reportes');
    });

    test('muestra el subtítulo del panel', async () => {
      await mount();

      expect(container.textContent).toContain(
        'Navega entre los distintos reportes del sistema.'
      );
    });

    test('renderiza el botón "Exportar CSV"', async () => {
      await mount();

      expect(getExportCsvBtn()).not.toBeNull();
    });

    test('renderiza el componente de navegación por pestañas', async () => {
      await mount();

      expect(container.querySelector('[data-testid="tabs-nav"]')).not.toBeNull();
    });

    test('pasa exactamente 5 pestañas al navegador', async () => {
      await mount();

      expect(container.querySelectorAll('[data-testid^="tab-"]').length).toBe(5);
    });

    test('incluye las pestañas general, inventario, donaciones, mensual y personalizado', async () => {
      await mount();

      ['general', 'inventario', 'donaciones', 'mensual', 'personalizado'].forEach((to) => {
        expect(container.querySelector(`[data-testid="tab-${to}"]`)).not.toBeNull();
      });
    });

    test('renderiza el Outlet', async () => {
      await mount();

      expect(container.querySelector('[data-testid="outlet"]')).not.toBeNull();
    });

    test('pasa registerCsvExportHandler como función en el contexto del Outlet', async () => {
      await mount();

      expect(typeof capturedContext?.registerCsvExportHandler).toBe('function');
    });
  });

  describe('exportar CSV sin handler registrado', () => {
    test('muestra alerta cuando no hay handler registrado', async () => {
      await mount();
      await clickExportCsv();

      expect(global.alert).toHaveBeenCalledWith(
        'No hay un reporte listo para exportar en esta pantalla.'
      );
    });

    test('no ejecuta ninguna función de exportación', async () => {
      await mount();
      await clickExportCsv();

      expect(mockOutletHandler).not.toHaveBeenCalled();
    });
  });

  describe('exportar CSV con handler registrado', () => {
    test('llama al handler registrado al hacer clic en Exportar CSV', async () => {
      await mount();
      await registerHandler();
      await clickExportCsv();

      expect(mockOutletHandler).toHaveBeenCalledTimes(1);
    });

    test('no muestra alerta cuando el handler se ejecuta con éxito', async () => {
      await mount();
      await registerHandler();
      await clickExportCsv();

      expect(global.alert).not.toHaveBeenCalled();
    });

    test('muestra alerta de error cuando el handler lanza una excepción', async () => {
      mockOutletHandler.mockImplementationOnce(() => {
        throw new Error('export error');
      });
      await mount();
      await registerHandler();
      await clickExportCsv();

      expect(global.alert).toHaveBeenCalledWith(
        'No se pudo generar el archivo CSV. Revisa la consola para más detalle.'
      );
    });

    test('registra el error en consola cuando el handler falla', async () => {
      mockOutletHandler.mockImplementationOnce(() => {
        throw new Error('export error');
      });
      await mount();
      await registerHandler();
      await clickExportCsv();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('registerCsvExportHandler', () => {
    test('limpiar el handler con null hace que Exportar CSV muestre alerta de "sin handler"', async () => {
      await mount();
      await registerHandler();
      await clearHandler();
      await clickExportCsv();

      expect(global.alert).toHaveBeenCalledWith(
        'No hay un reporte listo para exportar en esta pantalla.'
      );
      expect(mockOutletHandler).not.toHaveBeenCalled();
    });

    test('puede registrarse un nuevo handler después de limpiar', async () => {
      await mount();
      await registerHandler();
      await clearHandler();
      await registerHandler();
      await clickExportCsv();

      expect(mockOutletHandler).toHaveBeenCalledTimes(1);
      expect(global.alert).not.toHaveBeenCalled();
    });
  });
});
