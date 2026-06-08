/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockGetCategoriasInventario = jest.fn();
const mockUpdateProductoInventario = jest.fn();

jest.mock('../client/src/services/inventarioService', () => ({
  __esModule: true,
  getCategoriasInventario: (...args) => mockGetCategoriasInventario(...args),
  updateProductoInventario: (...args) => mockUpdateProductoInventario(...args),
}));

jest.mock('../client/src/services/inventarioService.js', () => ({
  __esModule: true,
  getCategoriasInventario: (...args) => mockGetCategoriasInventario(...args),
  updateProductoInventario: (...args) => mockUpdateProductoInventario(...args),
}));

jest.mock(
  '../client/src/components/layout/inventario/InventarioModalShell/InventarioModalShell',
  () => ({
    __esModule: true,
    default: ({ open, onClose, title, subtitle, children }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-shell' },
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
        { 'data-testid': 'modal-shell' },
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

jest.mock('../client/src/pages/styles/Inventario.css', () => ({}));

const ModalModule = await import(
  '../client/src/components/layout/inventario/InventarioEditarProductoModal/InventarioEditarProductoModal.jsx'
);

const InventarioEditarProductoModal =
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

const productoBase = {
  ID_INVENTARIO: 10,
  CLAVE: 'AGU-001',
  NOMBRE: 'Aguja',
  ID_CATEGORIA: 1,
  UNIDAD_MEDIDA: 'piezas',
  PRECIO: 25.5,
  CANTIDAD: 8,
};

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
      React.createElement(InventarioEditarProductoModal, {
        open: true,
        producto: productoBase,
        onClose: mockOnClose,
        onExito: mockOnExito,
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

describe('InventarioEditarProductoModal', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    mockGetCategoriasInventario.mockResolvedValue(categoriasBase);
    mockUpdateProductoInventario.mockResolvedValue({});
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });

  test('no renderiza nada si no recibe producto', async () => {
    await mount({
      producto: null,
    });

    expect(container.querySelector('[data-testid="modal-shell"]')).toBeFalsy();
    expect(container.textContent).toBe('');
  });

  test('no muestra contenido cuando open es false', async () => {
    await mount({
      open: false,
    });

    expect(container.querySelector('[data-testid="modal-shell"]')).toBeFalsy();
  });

  test('renderiza título, subtítulo y valores iniciales del producto', async () => {
    await mount();

    expect(container.textContent).toContain('Editar producto');
    expect(container.textContent).toContain(
      'Actualiza los datos del producto. La existencia se modifica con «Registrar movimiento».'
    );

    expect(getInputByName('clave').value).toBe('AGU-001');
    expect(getInputByName('nombre').value).toBe('Aguja');
    expect(getInputByName('id_categoria').value).toBe('1');
    expect(getInputByName('unidad_medida').value).toBe('piezas');
    expect(getInputByName('precio').value).toBe('25.5');
  });

  test('la clave es read only y disabled', async () => {
    await mount();

    const claveInput = getInputByName('clave');

    expect(claveInput.disabled).toBe(true);
    expect(claveInput.readOnly).toBe(true);
    expect(claveInput.getAttribute('aria-readonly')).not.toBeNull();
  });

  test('muestra existencia actual con cantidad y unidad de medida', async () => {
    await mount();

    const inputs = Array.from(container.querySelectorAll('input'));
    const existenciaInput = inputs.find((input) => input.value === '8 piezas');

    expect(existenciaInput).toBeTruthy();
    expect(existenciaInput.disabled).toBe(true);
    expect(existenciaInput.readOnly).toBe(true);
  });

  test('muestra existencia como cantidad si no hay unidad de medida', async () => {
    await mount({
      producto: {
        ...productoBase,
        UNIDAD_MEDIDA: '',
        CANTIDAD: 12,
      },
    });

    const inputs = Array.from(container.querySelectorAll('input'));
    const existenciaInput = inputs.find((input) => input.value === '12');

    expect(existenciaInput).toBeTruthy();
  });

  test('muestra existencia como guion cuando no hay cantidad', async () => {
    await mount({
      producto: {
        ...productoBase,
        CANTIDAD: null,
      },
    });

    const inputs = Array.from(container.querySelectorAll('input'));
    const existenciaInput = inputs.find((input) => input.value === '—');

    expect(existenciaInput).toBeTruthy();
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
    mockGetCategoriasInventario.mockRejectedValue(new Error('Error cargando categorías'));

    await mount();

    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(container.textContent).toContain('Error cargando categorías');
  });

  test('deshabilita select y botón guardar si no hay categorías', async () => {
    mockGetCategoriasInventario.mockResolvedValue([]);

    await mount();

    const select = getInputByName('id_categoria');
    const guardar = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Guardar cambios')
    );

    expect(select.disabled).toBe(true);
    expect(guardar.disabled).toBe(true);
  });

  test('actualiza campos editables con handleChange', async () => {
    await mount();

    await changeByName('nombre', 'Sonda');
    await changeByName('unidad_medida', 'cajas');
    await changeByName('precio', '99.99');
    await changeByName('id_categoria', '2');

    expect(getInputByName('nombre').value).toBe('Sonda');
    expect(getInputByName('unidad_medida').value).toBe('cajas');
    expect(getInputByName('precio').value).toBe('99.99');
    expect(getInputByName('id_categoria').value).toBe('2');
  });

  test('muestra error si el producto no tiene ID válido', async () => {
    await mount({
      producto: {
        ...productoBase,
        ID_INVENTARIO: null,
      },
    });

    await submitForm();

    expect(mockUpdateProductoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Producto no válido.');
  });

  test('muestra error si la categoría no es válida', async () => {
    await mount();

    await changeByName('id_categoria', '');

    await submitForm();

    expect(mockUpdateProductoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Selecciona una categoría válida.');
  });

  test('muestra error si el precio es inválido', async () => {
    await mount();

    await changeByName('precio', '-10');

    await submitForm();

    expect(mockUpdateProductoInventario).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Indica un precio válido (número mayor o igual a 0).');
  });

  test('guarda cambios correctamente con valores limpios y numéricos', async () => {
    await mount();

    await changeByName('nombre', '  Sonda nueva  ');
    await changeByName('unidad_medida', '  cajas  ');
    await changeByName('precio', '99.99');
    await changeByName('id_categoria', '2');

    await submitForm();

    expect(mockUpdateProductoInventario).toHaveBeenCalledWith(10, {
      clave: 'AGU-001',
      nombre: 'Sonda nueva',
      id_categoria: 2,
      unidad_medida: 'cajas',
      precio: 99.99,
    });

    expect(mockOnExito).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('permite guardar precio en cero', async () => {
    await mount();

    await changeByName('precio', '0');

    await submitForm();

    expect(mockUpdateProductoInventario).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        precio: 0,
      })
    );
  });

  test('muestra Guardando mientras se envía el formulario', async () => {
    let resolveUpdate;

    mockUpdateProductoInventario.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        })
    );

    await mount();

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

    await act(async () => {
      resolveUpdate({});
    });

    await flushPromises();
  });

  test('muestra error si falla updateProductoInventario', async () => {
    mockUpdateProductoInventario.mockRejectedValue(new Error('No se pudo guardar'));

    await mount();

    await submitForm();

    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(container.textContent).toContain('No se pudo guardar');
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

  test('reinicia formulario cuando cambia el producto abierto', async () => {
    await mount();

    await changeByName('nombre', 'Nombre temporal');

    expect(getInputByName('nombre').value).toBe('Nombre temporal');

    await act(async () => {
      root.render(
        React.createElement(InventarioEditarProductoModal, {
          open: true,
          producto: {
            ...productoBase,
            ID_INVENTARIO: 20,
            CLAVE: 'GUA-002',
            NOMBRE: 'Guantes',
            ID_CATEGORIA: 2,
            UNIDAD_MEDIDA: 'cajas',
            PRECIO: 150,
            CANTIDAD: 3,
          },
          onClose: mockOnClose,
          onExito: mockOnExito,
        })
      );
    });

    await flushPromises();

    expect(getInputByName('clave').value).toBe('GUA-002');
    expect(getInputByName('nombre').value).toBe('Guantes');
    expect(getInputByName('id_categoria').value).toBe('2');
    expect(getInputByName('unidad_medida').value).toBe('cajas');
    expect(getInputByName('precio').value).toBe('150');
  });
});