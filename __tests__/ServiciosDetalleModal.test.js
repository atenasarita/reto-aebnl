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

function getInputByLabel(label) {
  const labels = Array.from(container.querySelectorAll('label'));
  const found = labels.find((l) => l.querySelector('span')?.textContent === label);
  return found?.querySelector('input') ?? null;
}

function getYaAportoValue() {
  return getInputByLabel('Ya aportó')?.value ?? null;
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

  test('muestra el subtítulo con el id y nombre del servicio', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(container.querySelector('[data-testid="modal-subtitle"]').textContent)
      .toBe('ID #7 · Consulta general');
  });

});

describe('ServiciosDetalleModal — campos', () => {

  test('muestra el campo Beneficiario con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Beneficiario').value).toBe('Juan García');
  });

  test('muestra el campo Servicio con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Servicio').value).toBe('Consulta general');
  });

  test('muestra el campo Categoría con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Categoría').value).toBe('Consulta');
  });

  test('muestra el campo Método de pago con el valor correcto', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Método de pago').value).toBe('Efectivo');
  });

  test('muestra el campo Monto servicio con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Monto servicio').value).toBe('$500.00');
  });

  test('muestra el campo Monto inventario con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Monto inventario').value).toBe('$50.00');
  });

  test('muestra el campo Descuento con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Descuento').value).toBe('$0.00');
  });

  test('muestra el campo Cuota total con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Cuota total').value).toBe('$550.00');
  });

  test('muestra el campo Monto pagado con el valor formateado', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(getInputByLabel('Monto pagado').value).toBe('$550.00');
  });

  test('muestra "—" para un campo cuyo valor es null', async () => {
    const servicio = { ...servicioCompleto, metodoPago: null };
    await mount({ open: true, onClose: jest.fn(), servicio });

    expect(getInputByLabel('Método de pago').value).toBe('—');
  });

  test('muestra "—" para un campo cuyo valor es undefined', async () => {
    const servicio = { ...servicioCompleto, categoria: undefined };
    await mount({ open: true, onClose: jest.fn(), servicio });

    expect(getInputByLabel('Categoría').value).toBe('—');
  });

  test('todos los campos tienen readOnly', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    const inputs = container.querySelectorAll('input');
    inputs.forEach((input) => {
      expect(input.readOnly).toBe(true);
    });
  });

  test('se renderizan exactamente 10 campos', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: servicioCompleto });

    expect(container.querySelectorAll('input').length).toBe(10);
  });

});

describe('ServiciosDetalleModal — campo Ya aportó', () => {

  test('muestra "Sí" cuando yaAporto es 1', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: 1 } });

    expect(getYaAportoValue()).toBe('Sí');
  });

  test('muestra "No" cuando yaAporto es 0', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: 0 } });

    expect(getYaAportoValue()).toBe('No');
  });

  test('muestra "—" cuando yaAporto es null', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: null } });

    expect(getYaAportoValue()).toBe('—');
  });

  test('muestra "—" cuando yaAporto es undefined', async () => {
    const { yaAporto: _, ...sinYaAporto } = servicioCompleto;
    await mount({ open: true, onClose: jest.fn(), servicio: sinYaAporto });

    expect(getYaAportoValue()).toBe('—');
  });

  test('muestra "—" cuando yaAporto es un valor distinto de 0 y 1', async () => {
    await mount({ open: true, onClose: jest.fn(), servicio: { ...servicioCompleto, yaAporto: 2 } });

    expect(getYaAportoValue()).toBe('—');
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
