/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockRegistrarMovimientoInventario = jest.fn();

jest.mock('../client/src/services/inventarioService', () => ({
  __esModule: true,
  registrarMovimientoInventario: (...args) => mockRegistrarMovimientoInventario(...args),
}));

jest.mock('../client/src/services/inventarioService.js', () => ({
  __esModule: true,
  registrarMovimientoInventario: (...args) => mockRegistrarMovimientoInventario(...args),
}));

jest.mock('../client/src/utils/validacionFormularioEs', () => ({
  __esModule: true,
  propsFormularioValidacionEs: {
    noValidate: true,
  },
}));

jest.mock('../client/src/utils/validacionFormularioEs.js', () => ({
  __esModule: true,
  propsFormularioValidacionEs: {
    noValidate: true,
  },
}));

jest.mock(
  '../client/src/components/layout/inventario/InventarioModalShell/InventarioModalShell',
  () => ({
    __esModule: true,
    default: ({ open, onClose, title, subtitle, children }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        {
          'data-testid': 'modal-shell',
        },
        React.createElement('h2', null, title),
        React.createElement('p', null, subtitle),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'shell-close',
            onClick: onClose,
          },
          'Cerrar shell'
        ),
        children
      );
    },
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioModalShell/InventarioModalShell.jsx',
  () => ({
    __esModule: true,
    default: ({ open, onClose, title, subtitle, children }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        {
          'data-testid': 'modal-shell',
        },
        React.createElement('h2', null, title),
        React.createElement('p', null, subtitle),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'shell-close',
            onClick: onClose,
          },
          'Cerrar shell'
        ),
        children
      );
    },
  })
);

jest.mock('../client/src/pages/styles/Inventario.css', () => ({}));

const InventarioMovimientoModalModule = await import(
  '../client/src/components/layout/inventario/InventarioMovimientoModal/InventarioMovimientoModal.jsx'
);

const InventarioMovimientoModal =
  InventarioMovimientoModalModule.default?.default ||
  InventarioMovimientoModalModule.default ||
  InventarioMovimientoModalModule;

let container;
let root;
let onClose;
let onExito;

const itemsMock = [
  {
    ID_INVENTARIO: 1,
    CLAVE: 'MED-001',
    NOMBRE: 'Gasas',
    CANTIDAD: 10,
    UNIDAD_MEDIDA: 'pz',
  },
  {
    ID_INVENTARIO: 2,
    CLAVE: 'MED-002',
    NOMBRE: 'Alcohol',
    CANTIDAD: 5,
    UNIDAD_MEDIDA: 'ml',
  },
];

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mount({
  open = true,
  items = itemsMock,
  loading = false,
  loadError = null,
} = {}) {
  onClose = jest.fn();
  onExito = jest.fn();

  await act(async () => {
    root.render(
      React.createElement(InventarioMovimientoModal, {
        open,
        onClose,
        onExito,
        items,
        loading,
        loadError,
      })
    );
  });

  await flushPromises();
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

async function changeElement(element, value) {
  if (!element) {
    throw new Error('No se encontró el elemento para cambiar valor.');
  }

  await act(async () => {
    setNativeValue(element, value);
    element.dispatchEvent(
      new Event('input', {
        bubbles: true,
      })
    );
    element.dispatchEvent(
      new Event('change', {
        bubbles: true,
      })
    );
  });

  await flushPromises();
}

async function submitForm() {
  const form = container.querySelector('form');

  if (!form) {
    throw new Error('No se encontró el formulario.');
  }

  await act(async () => {
    form.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  await flushPromises();
}

async function clickElement(element) {
  if (!element) {
    throw new Error('No se encontró el elemento para hacer click.');
  }

  await act(async () => {
    element.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  await flushPromises();
}

function getProductoSelect() {
  return container.querySelectorAll('select')[0];
}

function getTipoMovimientoSelect() {
  return container.querySelectorAll('select')[1];
}

function getCantidadInput() {
  return container.querySelector('input[type="number"]');
}

function getMotivoInput() {
  return Array.from(container.querySelectorAll('input')).find(
    (input) => input.placeholder === 'Ej. Compra proveedor'
  );
}

function getFechaInput() {
  return container.querySelector('input[type="datetime-local"]');
}

function getSubmitButton() {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes('Registrar movimiento') ||
    button.textContent.includes('Registrando')
  );
}

function getCancelButton() {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes('Cancelar')
  );
}

describe('InventarioMovimientoModal', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    root = null;
  });

  test('no renderiza contenido cuando open es false', async () => {
    await mount({
      open: false,
    });

    expect(container.textContent).toBe('');
  });

  test('renderiza título, subtítulo y formulario cuando open es true', async () => {
    await mount();

    expect(container.textContent).toContain('Registrar movimiento');
    expect(container.textContent).toContain(
      'Entrada o salida de mercancía; el stock se actualiza al guardar.'
    );
    expect(container.textContent).toContain('Producto');
    expect(container.textContent).toContain('Tipo de movimiento');
    expect(container.textContent).toContain('Cantidad');
    expect(container.textContent).toContain('Motivo, máximo 20 caracteres');
    expect(container.textContent).toContain('Fecha');
  });

  test('muestra estado de carga cuando loading es true', async () => {
    await mount({
      loading: true,
    });

    expect(container.textContent).toContain('Cargando productos…');
    expect(container.querySelector('form')).toBeFalsy();
  });

  test('muestra error de carga cuando loadError existe y no está cargando', async () => {
    await mount({
      loading: false,
      loadError: 'No se pudo cargar inventario',
    });

    expect(container.textContent).toContain('No se pudo cargar inventario');
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(container.querySelector('form')).toBeFalsy();
  });

  test('renderiza productos disponibles en el select', async () => {
    await mount();

    const select = getProductoSelect();

    expect(select.textContent).toContain('Seleccionar…');
    expect(select.textContent).toContain('MED-001');
    expect(select.textContent).toContain('Gasas');
    expect(select.textContent).toContain('stock: 10 pz');
    expect(select.textContent).toContain('MED-002');
    expect(select.textContent).toContain('Alcohol');
  });

  test('deshabilita producto y submit cuando no hay items', async () => {
    await mount({
      items: [],
    });

    expect(getProductoSelect().disabled).toBe(true);
    expect(getSubmitButton().disabled).toBe(true);
  });

  test('cierra modal al hacer click en Cancelar', async () => {
    await mount();

    await clickElement(getCancelButton());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('reinicia campos cuando el modal se abre', async () => {
    await mount();

    expect(getProductoSelect().value).toBe('');
    expect(getTipoMovimientoSelect().value).toBe('entrada');
    expect(getCantidadInput().value).toBe('1');
    expect(getMotivoInput().value).toBe('');
    expect(getFechaInput().value).toBe('');
  });

  test('muestra error si se envía sin seleccionar producto', async () => {
    await mount();

    await changeElement(getMotivoInput(), 'Compra');
    await submitForm();

    expect(mockRegistrarMovimientoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Selecciona un producto.');
  });

  test('muestra error si cantidad no es válida', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '0');
    await changeElement(getMotivoInput(), 'Compra');
    await submitForm();

    expect(mockRegistrarMovimientoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('La cantidad debe ser un entero mayor a 0.');
  });

  test('muestra error si cantidad tiene decimales', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '2.5');
    await changeElement(getMotivoInput(), 'Compra');
    await submitForm();

    expect(mockRegistrarMovimientoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('La cantidad debe ser un entero mayor a 0.');
  });

  test('muestra error si motivo está vacío', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '2');
    await changeElement(getMotivoInput(), '   ');
    await submitForm();

    expect(mockRegistrarMovimientoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain(
      'El motivo es obligatorio y admite hasta 20 caracteres.'
    );
  });

  test('muestra error si motivo tiene más de 20 caracteres', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '2');
    await changeElement(getMotivoInput(), 'motivo con mas de veinte');
    await submitForm();

    expect(mockRegistrarMovimientoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain(
      'El motivo es obligatorio y admite hasta 20 caracteres.'
    );
  });

  test('registra movimiento de entrada sin fecha y ejecuta onExito y onClose', async () => {
    await mount();

    mockRegistrarMovimientoInventario.mockResolvedValue({ ok: true });

    await changeElement(getProductoSelect(), '1');
    await changeElement(getTipoMovimientoSelect(), 'entrada');
    await changeElement(getCantidadInput(), '3');
    await changeElement(getMotivoInput(), 'Compra');

    await submitForm();

    expect(mockRegistrarMovimientoInventario).toHaveBeenCalledWith({
      id_inventario: 1,
      tipo_movimiento: 'entrada',
      cantidad: 3,
      motivo: 'Compra',
    });

    expect(onExito).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('registra movimiento de salida con fecha en formato ISO', async () => {
    await mount();

    mockRegistrarMovimientoInventario.mockResolvedValue({ ok: true });

    await changeElement(getProductoSelect(), '2');
    await changeElement(getTipoMovimientoSelect(), 'salida');
    await changeElement(getCantidadInput(), '2');
    await changeElement(getMotivoInput(), 'Uso interno');
    await changeElement(getFechaInput(), '2026-06-05T10:30');

    await submitForm();

    const payload = mockRegistrarMovimientoInventario.mock.calls[0][0];

    expect(payload).toMatchObject({
      id_inventario: 2,
      tipo_movimiento: 'salida',
      cantidad: 2,
      motivo: 'Uso interno',
    });

    expect(payload.fecha).toEqual(new Date('2026-06-05T10:30').toISOString());
    expect(onExito).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('recorta espacios del motivo antes de enviar', async () => {
    await mount();

    mockRegistrarMovimientoInventario.mockResolvedValue({ ok: true });

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '2');
    await changeElement(getMotivoInput(), '  Compra  ');

    await submitForm();

    expect(mockRegistrarMovimientoInventario).toHaveBeenCalledWith({
      id_inventario: 1,
      tipo_movimiento: 'entrada',
      cantidad: 2,
      motivo: 'Compra',
    });
  });

  test('muestra texto Registrando mientras se envía', async () => {
    await mount();

    let resolver;
    mockRegistrarMovimientoInventario.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        })
    );

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '2');
    await changeElement(getMotivoInput(), 'Compra');

    const form = container.querySelector('form');

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(container.textContent).toContain('Registrando…');
    expect(getSubmitButton().disabled).toBe(true);

    await act(async () => {
      resolver({ ok: true });
    });

    await flushPromises();

    expect(onExito).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('muestra error si el servicio falla con Error', async () => {
    await mount();

    mockRegistrarMovimientoInventario.mockRejectedValue(
      new Error('Stock insuficiente')
    );

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '2');
    await changeElement(getMotivoInput(), 'Salida');

    await submitForm();

    expect(container.textContent).toContain('Stock insuficiente');
    expect(onExito).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('muestra error genérico si el servicio falla con valor no Error', async () => {
    await mount();

    mockRegistrarMovimientoInventario.mockRejectedValue('fallo');

    await changeElement(getProductoSelect(), '1');
    await changeElement(getCantidadInput(), '2');
    await changeElement(getMotivoInput(), 'Salida');

    await submitForm();

    expect(container.textContent).toContain('Error al registrar');
    expect(onExito).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});