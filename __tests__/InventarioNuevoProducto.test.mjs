/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockGetCategoriasInventario = jest.fn();
const mockCreateProductoInventario = jest.fn();
const mockVistaPreviaClaveInventario = jest.fn();

jest.mock('../client/src/services/inventarioService', () => ({
  __esModule: true,
  getCategoriasInventario: (...args) => mockGetCategoriasInventario(...args),
  createProductoInventario: (...args) => mockCreateProductoInventario(...args),
}));

jest.mock('../client/src/services/inventarioService.js', () => ({
  __esModule: true,
  getCategoriasInventario: (...args) => mockGetCategoriasInventario(...args),
  createProductoInventario: (...args) => mockCreateProductoInventario(...args),
}));

jest.mock('../client/src/utils/inventarioClave', () => ({
  __esModule: true,
  vistaPreviaClaveInventario: (...args) => mockVistaPreviaClaveInventario(...args),
}));

jest.mock('../client/src/utils/inventarioClave.js', () => ({
  __esModule: true,
  vistaPreviaClaveInventario: (...args) => mockVistaPreviaClaveInventario(...args),
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
    default: ({ open, onClose, title, children }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-shell' },
        React.createElement('h2', null, title),
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
    default: ({ open, onClose, title, children }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-shell' },
        React.createElement('h2', null, title),
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

const ModalModule = await import(
  '../client/src/components/layout/inventario/InventarioNuevoProductoModal/InventarioNuevoProductoModal.jsx'
);

const InventarioNuevoProductoModal =
  ModalModule.default?.default || ModalModule.default || ModalModule;

let container;
let root;

const mockOnClose = jest.fn();
const mockOnExito = jest.fn();

const categoriasBase = [
  {
    ID_CATEGORIA: 1,
    DESCRIPCION: 'Material médico',
  },
  {
    ID_CATEGORIA: 2,
    DESCRIPCION: 'Protección',
  },
];

const itemsInventarioBase = [
  {
    ID_INVENTARIO: 1,
    CLAVE: 'MAT-001',
    ID_CATEGORIA: 1,
  },
];

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mount(props = {}) {
  await act(async () => {
    root.render(
      React.createElement(InventarioNuevoProductoModal, {
        open: true,
        onClose: mockOnClose,
        onExito: mockOnExito,
        itemsInventario: itemsInventarioBase,
        ...props,
      })
    );
  });

  await flushPromises();
}

function getInputByName(name) {
  const element = container.querySelector(`[name="${name}"]`);

  if (!element) {
    throw new Error(`No se encontró input/select con name: ${name}`);
  }

  return element;
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

async function changeByName(name, value) {
  const element = getInputByName(name);

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
    throw new Error('No se encontró formulario.');
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

async function clickButton(text) {
  const button = Array.from(container.querySelectorAll('button')).find((item) =>
    item.textContent.includes(text)
  );

  if (!button) {
    throw new Error(`No se encontró botón con texto: ${text}`);
  }

  await act(async () => {
    button.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  await flushPromises();
}

function getSubmitButton() {
  const button = Array.from(container.querySelectorAll('button')).find((item) =>
    item.textContent.includes('Guardar producto') || item.textContent.includes('Guardando…')
  );

  if (!button) {
    throw new Error('No se encontró botón de guardar.');
  }

  return button;
}

function getClavePreviewInput() {
  const inputs = Array.from(container.querySelectorAll('input'));
  return inputs.find((input) => input.disabled && input.readOnly && !input.name);
}

describe('InventarioNuevoProductoModal', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    mockGetCategoriasInventario.mockResolvedValue(categoriasBase);
    mockCreateProductoInventario.mockResolvedValue({});
    mockVistaPreviaClaveInventario.mockImplementation((idCategoria) =>
      idCategoria ? `CLAVE-${idCategoria}` : ''
    );
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });

  test('no renderiza contenido cuando open es false', async () => {
    await mount({
      open: false,
    });

    expect(container.querySelector('[data-testid="modal-shell"]')).toBeFalsy();
  });

  test('renderiza título y formulario cuando open es true', async () => {
    await mount();

    expect(container.querySelector('[data-testid="modal-shell"]')).toBeTruthy();
    expect(container.textContent).toContain('Nuevo producto');

    expect(getInputByName('nombre')).toBeTruthy();
    expect(getInputByName('id_categoria')).toBeTruthy();
    expect(getInputByName('unidad_medida')).toBeTruthy();
    expect(getInputByName('precio')).toBeTruthy();
    expect(getInputByName('cantidad')).toBeTruthy();
  });

  test('inicializa el formulario con valores vacíos y cantidad en cero', async () => {
    await mount();

    expect(getInputByName('nombre').value).toBe('');
    expect(getInputByName('id_categoria').value).toBe('');
    expect(getInputByName('unidad_medida').value).toBe('');
    expect(getInputByName('precio').value).toBe('');
    expect(getInputByName('cantidad').value).toBe('0');
  });

  test('carga categorías al abrir el modal', async () => {
    await mount();

    expect(mockGetCategoriasInventario).toHaveBeenCalledTimes(1);

    const select = getInputByName('id_categoria');

    expect(select.textContent).toContain('Seleccionar…');
    expect(select.textContent).toContain('Material médico');
    expect(select.textContent).toContain('Protección');
  });

  test('muestra error si falla la carga de categorías', async () => {
    mockGetCategoriasInventario.mockRejectedValue(new Error('Error al cargar categorías'));

    await mount();

    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(container.textContent).toContain('Error al cargar categorías');
  });

  test('deshabilita categoría y guardar cuando no hay categorías', async () => {
    mockGetCategoriasInventario.mockResolvedValue([]);

    await mount();

    expect(getInputByName('id_categoria').disabled).toBe(true);
    expect(getSubmitButton().disabled).toBe(true);
  });

  test('actualiza los campos editables del formulario', async () => {
    await mount();

    await changeByName('nombre', 'Sonda');
    await changeByName('id_categoria', '2');
    await changeByName('unidad_medida', 'pieza');
    await changeByName('precio', '120.50');
    await changeByName('cantidad', '3');

    expect(getInputByName('nombre').value).toBe('Sonda');
    expect(getInputByName('id_categoria').value).toBe('2');
    expect(getInputByName('unidad_medida').value).toBe('pieza');
    expect(getInputByName('precio').value).toBe('120.50');
    expect(getInputByName('cantidad').value).toBe('3');
  });

  test('muestra clave automática como guion si no hay categoría seleccionada', async () => {
    await mount();

    const preview = getClavePreviewInput();

    expect(preview).toBeTruthy();
    expect(preview.value).toBe('—');
    expect(preview.disabled).toBe(true);
    expect(preview.readOnly).toBe(true);
    expect(preview.getAttribute('aria-readonly')).not.toBeNull();
  });

  test('muestra vista previa de clave cuando se selecciona categoría', async () => {
    await mount();

    await changeByName('id_categoria', '2');

    const preview = getClavePreviewInput();

    expect(mockVistaPreviaClaveInventario).toHaveBeenCalled();
    expect(preview.value).toBe('CLAVE-2');
    expect(preview.title).toBe('Vista previa; se confirma al guardar');
  });

  test('pasa categorías e inventario existente a vistaPreviaClaveInventario', async () => {
    await mount();

    await changeByName('id_categoria', '1');

    expect(mockVistaPreviaClaveInventario).toHaveBeenLastCalledWith(
      '1',
      categoriasBase,
      itemsInventarioBase
    );
  });

  test('muestra error si no se selecciona categoría válida', async () => {
    await mount();

    await changeByName('id_categoria', '');

    await submitForm();

    expect(mockCreateProductoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Selecciona una categoría válida.');
  });

  test('muestra error si el precio es inválido', async () => {
    await mount();

    await changeByName('id_categoria', '1');
    await changeByName('precio', '-1');

    await submitForm();

    expect(mockCreateProductoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Indica un precio válido (número mayor o igual a 0).');
  });

  test('muestra error si la cantidad es negativa', async () => {
    await mount();

    await changeByName('id_categoria', '1');
    await changeByName('precio', '10');
    await changeByName('cantidad', '-3');

    await submitForm();

    expect(mockCreateProductoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('La cantidad inicial debe ser un entero mayor o igual a 0.');
  });

  test('muestra error si la cantidad no es entera', async () => {
    await mount();

    await changeByName('id_categoria', '1');
    await changeByName('precio', '10');
    await changeByName('cantidad', '2.5');

    await submitForm();

    expect(mockCreateProductoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('La cantidad inicial debe ser un entero mayor o igual a 0.');
  });

  test('crea producto correctamente con activo 1 cuando cantidad es mayor a cero', async () => {
    await mount();

    await changeByName('nombre', '  Sonda  ');
    await changeByName('id_categoria', '2');
    await changeByName('unidad_medida', '  pieza  ');
    await changeByName('precio', '120.50');
    await changeByName('cantidad', '3');

    await submitForm();

    expect(mockCreateProductoInventario).toHaveBeenCalledWith({
      nombre: 'Sonda',
      id_categoria: 2,
      unidad_medida: 'pieza',
      precio: 120.5,
      cantidad: 3,
      activo: '1',
    });

    expect(mockOnExito).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('crea producto con activo 0 cuando cantidad inicial es cero', async () => {
    await mount();

    await changeByName('nombre', 'Guantes');
    await changeByName('id_categoria', '2');
    await changeByName('unidad_medida', 'caja');
    await changeByName('precio', '50');
    await changeByName('cantidad', '0');

    await submitForm();

    expect(mockCreateProductoInventario).toHaveBeenCalledWith(
      expect.objectContaining({
        cantidad: 0,
        activo: '0',
      })
    );
  });

  test('permite crear producto con precio cero', async () => {
    await mount();

    await changeByName('nombre', 'Producto gratis');
    await changeByName('id_categoria', '1');
    await changeByName('unidad_medida', 'pieza');
    await changeByName('precio', '0');
    await changeByName('cantidad', '1');

    await submitForm();

    expect(mockCreateProductoInventario).toHaveBeenCalledWith(
      expect.objectContaining({
        precio: 0,
      })
    );
  });

  test('muestra Guardando mientras se envía el formulario', async () => {
    let resolveCreate;

    mockCreateProductoInventario.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
    );

    await mount();

    await changeByName('nombre', 'Sonda');
    await changeByName('id_categoria', '1');
    await changeByName('unidad_medida', 'pieza');
    await changeByName('precio', '10');
    await changeByName('cantidad', '1');

    const form = container.querySelector('form');

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(container.textContent).toContain('Guardando…');
    expect(getSubmitButton().disabled).toBe(true);

    await act(async () => {
      resolveCreate({});
    });

    await flushPromises();
  });

  test('muestra error si createProductoInventario falla', async () => {
    mockCreateProductoInventario.mockRejectedValue(new Error('No se pudo guardar producto'));

    await mount();

    await changeByName('nombre', 'Sonda');
    await changeByName('id_categoria', '1');
    await changeByName('unidad_medida', 'pieza');
    await changeByName('precio', '10');
    await changeByName('cantidad', '1');

    await submitForm();

    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(container.textContent).toContain('No se pudo guardar producto');
    expect(mockOnExito).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('cierra el modal al presionar Cancelar', async () => {
    await mount();

    await clickButton('Cancelar');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('cierra el modal desde el shell', async () => {
    await mount();

    await clickButton('Cerrar shell');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('reinicia formulario y error cuando se vuelve a abrir', async () => {
    await mount();

    await changeByName('nombre', 'Temporal');
    await changeByName('id_categoria', '');
    await submitForm();

    expect(container.textContent).toContain('Selecciona una categoría válida.');

    await act(async () => {
      root.render(
        React.createElement(InventarioNuevoProductoModal, {
          open: false,
          onClose: mockOnClose,
          onExito: mockOnExito,
          itemsInventario: itemsInventarioBase,
        })
      );
    });

    await flushPromises();

    await act(async () => {
      root.render(
        React.createElement(InventarioNuevoProductoModal, {
          open: true,
          onClose: mockOnClose,
          onExito: mockOnExito,
          itemsInventario: itemsInventarioBase,
        })
      );
    });

    await flushPromises();

    expect(getInputByName('nombre').value).toBe('');
    expect(getInputByName('cantidad').value).toBe('0');
    expect(container.querySelector('[role="alert"]')).toBeFalsy();
  });
});