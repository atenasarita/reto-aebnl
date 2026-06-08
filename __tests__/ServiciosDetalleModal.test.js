/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jest.mock is hoisted by babel, so this runs before any imports.
// Using require('react') inside the factory is required for .test.js mock factories.
jest.mock(
  '../client/src/components/layout/inventario/InventarioModalShell/InventarioModalShell.jsx',
  () => {
    const React = require('react');
    return {
      __esModule: true,
      default: ({ open, onClose, title, subtitle, children }) => {
        if (!open) return null;
        return React.createElement(
          'div',
          { 'data-testid': 'modal-shell', role: 'dialog' },
          React.createElement('h2', { 'data-testid': 'modal-title' }, title),
          subtitle
            ? React.createElement('p', { 'data-testid': 'modal-subtitle' }, subtitle)
            : null,
          children
        );
      },
    };
  }
);

let ServiciosDetalleModal;

beforeAll(async () => {
  const m = await import(
    '../client/src/components/layout/servicios/Navegacion/Serviciosdetallemodal.jsx'
  );
  ServiciosDetalleModal = m.default?.default || m.default || m;
});

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
});

async function mount(props) {
  await act(async () => {
    root.render(React.createElement(ServiciosDetalleModal, props));
  });
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const servicioCompleto = {
  id: 7,
  nombre: 'Consulta general',
  beneficiario: 'Juan García',
  categoria: 'Consulta',
  fechaFormateada: '05/06/2026',
  metodoPago: 'Efectivo',
  montoServicioFormateado: '$500.00',
  montoInventarioFormateado: '$50.00',
  descuentoFormateado: '$0.00',
  cuotaTotalFormateado: '$550.00',
  montoPagadoFormateado: '$550.00',
  yaAporto: 1,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Finds the label span with matching text and returns its sibling value span's
 * textContent. Works for both Campo fields and the custom yaAporto field.
 */
function getValueByLabel(label) {
  const allSpans = Array.from(container.querySelectorAll('span'));
  const labelSpan = allSpans.find((s) => s.textContent === label);
  if (!labelSpan) return null;
  return labelSpan.nextElementSibling?.textContent ?? null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ServiciosDetalleModal — renderizado condicional', () => {

  test('no renderiza nada cuando servicio es null', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: null });

    expect(container.querySelector('[data-testid="modal-shell"]')).toBeNull();
  });

  test('no renderiza nada cuando servicio es undefined', async () => {
    await mount({ open: true, onClose: jest.fn() });

    expect(container.querySelector('[data-testid="modal-shell"]')).toBeNull();
  });

  test('no renderiza contenido cuando open es false', async () => {
    await mount({ open: false, onClose: jest.fn(), servicio: servicioCompleto });

    expect(container.querySelector('[data-testid="modal-shell"]')).toBeNull();
  });

  test('renderiza el modal cuando open es true y servicio está definido', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(container.querySelector('[data-testid="modal-shell"]')).not.toBeNull();
  });

});

describe('ServiciosDetalleModal — título y subtítulo', () => {

  test('muestra el título "Detalle del servicio"', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(container.querySelector('[data-testid="modal-title"]').textContent)
      .toBe('Detalle del servicio');
  });

  test('muestra el subtítulo con el folio y nombre del servicio', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(container.querySelector('[data-testid="modal-subtitle"]').textContent)
      .toBe('Folio #7 · Consulta general');
  });

});

describe('ServiciosDetalleModal — secciones', () => {

  test('muestra el encabezado de la sección financiera', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    const headings = Array.from(container.querySelectorAll('h3'));
    expect(headings.some((h) => h.textContent === 'Información financiera')).toBe(true);
  });

});

describe('ServiciosDetalleModal — campos', () => {

  test('muestra el campo Fecha de registro con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Fecha de registro')).toBe('05/06/2026');
  });

  test('muestra el campo Beneficiario con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Beneficiario')).toBe('Juan García');
  });

  test('muestra el campo Servicio con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Servicio')).toBe('Consulta general');
  });

  test('muestra el campo Categoría con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Categoría')).toBe('Consulta');
  });

  test('muestra el campo Método de pago con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Método de pago')).toBe('Efectivo');
  });

  test('muestra el campo Monto servicio con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Monto servicio')).toBe('$500.00');
  });

  test('muestra el campo Monto insumos con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Monto insumos')).toBe('$50.00');
  });

  test('muestra el campo Descuento con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Descuento')).toBe('$0.00');
  });

  test('muestra el campo Cuota total con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Cuota total')).toBe('$550.00');
  });

  test('muestra el campo Monto pagado con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getValueByLabel('Monto pagado')).toBe('$550.00');
  });

  test('muestra "—" para un campo cuyo valor es null', async () => {
    const servicio = { ...servicioCompleto, metodoPago: null };
    await mount({ open: true, onClose: jest.fn(), servicio });

    expect(getValueByLabel('Método de pago')).toBe('—');
  });

  test('muestra "—" para un campo cuyo valor es undefined', async () => {
    const servicio = { ...servicioCompleto, categoria: undefined };
    await mount({ open: true, onClose: jest.fn(), servicio });

    expect(getValueByLabel('Categoría')).toBe('—');
  });

  test('los campos no son inputs editables', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(container.querySelectorAll('input').length).toBe(0);
  });

  test('se renderizan los 11 campos esperados', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    const expectedLabels = [
      'Fecha de registro', 'Beneficiario', 'Servicio', 'Categoría',
      'Método de pago', 'Monto servicio', 'Monto insumos',
      'Descuento', 'Cuota total', 'Monto pagado', 'Ya aportó',
    ];
    for (const label of expectedLabels) {
      expect(getValueByLabel(label)).not.toBeNull();
    }
  });

});

describe('ServiciosDetalleModal — campo Ya aportó', () => {

  test('muestra "Sí" cuando yaAporto es 1', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: 1 } });

    expect(getValueByLabel('Ya aportó')).toBe('Sí');
  });

  test('muestra "No" cuando yaAporto es 0', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: 0 } });

    expect(getValueByLabel('Ya aportó')).toBe('No');
  });

  test('muestra "—" cuando yaAporto es null', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: null } });

    expect(getValueByLabel('Ya aportó')).toBe('—');
  });

  test('muestra "—" cuando yaAporto es undefined', async () => {
    const { yaAporto: _, ...sinYaAporto } = servicioCompleto;
    await mount({ open: true, onClose: jest.fn(), servicio: sinYaAporto });

    expect(getValueByLabel('Ya aportó')).toBe('—');
  });

  test('muestra "—" cuando yaAporto es un valor distinto de 0 y 1', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: 2 } });

    expect(getValueByLabel('Ya aportó')).toBe('—');
  });

});

describe('ServiciosDetalleModal — botón Cerrar', () => {

  test('el botón Cerrar llama a onClose al hacer clic', async () => {
    const onClose = jest.fn();
    await mount({ open: true, onClose, servicio: servicioCompleto });

    const btnCerrar = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Cerrar'
    );

    await act(async () => { btnCerrar.click(); });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

});
