/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockUseProductos = jest.fn();

jest.mock('../client/src/hooks/useProductos', () => ({
  __esModule: true,
  useProductos: () => mockUseProductos(),
}));

jest.mock('../client/src/hooks/useProductos.js', () => ({
  __esModule: true,
  useProductos: () => mockUseProductos(),
}));

jest.mock('../client/src/components/ui/Dropdown', () => ({
  __esModule: true,
  default: ({ options, value, onChange, className }) =>
    React.createElement(
      'select',
      {
        className,
        'data-testid': 'producto-select',
        value,
        onChange: (e) => onChange(e.target.value),
      },
      options.map((option) =>
        React.createElement(
          'option',
          {
            key: option.value,
            value: option.value,
          },
          option.label
        )
      )
    ),
}));

jest.mock('../client/src/components/ui/Dropdown.jsx', () => ({
  __esModule: true,
  default: ({ options, value, onChange, className }) =>
    React.createElement(
      'select',
      {
        className,
        'data-testid': 'producto-select',
        value,
        onChange: (e) => onChange(e.target.value),
      },
      options.map((option) =>
        React.createElement(
          'option',
          {
            key: option.value,
            value: option.value,
          },
          option.label
        )
      )
    ),
}));

jest.mock('../client/src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled, className, iconLeft }) =>
    React.createElement(
      'button',
      {
        type: 'button',
        className,
        disabled,
        onClick,
      },
      iconLeft,
      children
    ),
}));

jest.mock('../client/src/components/ui/Button.jsx', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled, className, iconLeft }) =>
    React.createElement(
      'button',
      {
        type: 'button',
        className,
        disabled,
        onClick,
      },
      iconLeft,
      children
    ),
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  Plus: () => React.createElement('span', { 'data-testid': 'plus-icon' }),
  Trash2: () => React.createElement('span', { 'data-testid': 'trash-icon' }),
}));

jest.mock('../client/src/components/layout/servicios/Registro/RegistroSteps.css', () => ({}));

const StepInsumosModule = await import(
  '../client/src/components/layout/servicios/Registro/StepInsumos.jsx'
);

const StepInsumos =
  StepInsumosModule.default?.default || StepInsumosModule.default || StepInsumosModule;

const productosMock = [
  {
    id: 1,
    nombre: 'Gasas',
    stock: 10,
    precio: 20,
  },
  {
    id: 2,
    nombre: 'Alcohol',
    stock: 3,
    precio: 50,
  },
];

let container;
let root;
let setInsumos;

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mount({
  insumos = [],
  productos = productosMock,
  loading = false,
  error = null,
} = {}) {
  mockUseProductos.mockReturnValue({
    productos,
    loading,
    error,
  });

  setInsumos = jest.fn();

  await act(async () => {
    root.render(
      React.createElement(StepInsumos, {
        insumos,
        setInsumos,
      })
    );
  });

  await flushPromises();
}

function setReactInputValue(element, value) {
  // Obtiene el setter del prototipo de HTMLInputElement
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;

  nativeInputValueSetter.call(element, value);
}

function setReactSelectValue(element, value) {
  const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    'value'
  ).set;

  nativeSelectValueSetter.call(element, value);
}

async function inputElement(element, value) {
  if (!element) throw new Error('No se encontró el input para cambiar valor.');

  await act(async () => {
    setReactInputValue(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await flushPromises();
}

async function changeElement(element, value) {
  if (!element) throw new Error('No se encontró el elemento para cambiar valor.');

  await act(async () => {
    // Detecta si es select o input
    if (element.tagName === 'SELECT') {
      setReactSelectValue(element, value);
    } else {
      setReactInputValue(element, value);
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await flushPromises();
}

async function blurElement(element) {
  if (!element) throw new Error('No se encontró el elemento para blur.');

  await act(async () => {
    // Enfoca primero para que el blur tenga efecto real
    element.focus();
  });

  await act(async () => {
    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    // También dispara el evento de React
    element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
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
  return container.querySelector('[data-testid="producto-select"]');
}

function getAgregarButton() {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes('Agregar')
  );
}

function getCantidadAgregarInput() {
  return container.querySelector('.insumoAddRow input[type="number"]');
}

function getPrecioUnitarioInput() {
  return container.querySelector('.insumoAddRow input[type="text"]');
}

function getCantidadTablaInputByValue(value) {
  return Array.from(container.querySelectorAll('.inputQty')).find(
    (input) => input.value === String(value)
  );
}

function getDeleteButtons() {
  return Array.from(container.querySelectorAll('.btnDanger'));
}

describe('StepInsumos', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    setInsumos = jest.fn();
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

  test('muestra mensaje de carga cuando loading es true', async () => {
    await mount({
      loading: true,
    });

    expect(container.textContent).toContain('Cargando productos…');
  });

  test('muestra mensaje de error cuando useProductos devuelve error', async () => {
    await mount({
      error: new Error('Error al cargar'),
    });

    expect(container.textContent).toContain('Error al cargar productos.');
  });

  test('renderiza tabla vacía y botón Agregar deshabilitado al inicio', async () => {
    await mount();

    expect(container.textContent).toContain('Producto');
    expect(container.textContent).toContain('Cantidad');
    expect(container.textContent).toContain('Precio unitario');
    expect(container.textContent).toContain('Sin productos agregados');

    expect(getAgregarButton()).toBeTruthy();
    expect(getAgregarButton().disabled).toBe(true);
  });

  test('renderiza opciones de productos con stock disponible', async () => {
    await mount();

    const select = getProductoSelect();

    expect(select).toBeTruthy();
    expect(select.textContent).toContain('Seleccionar...');
    expect(select.textContent).toContain('Gasas (10 disp.)');
    expect(select.textContent).toContain('Alcohol (3 disp.)');
  });

  test('habilita botón Agregar y muestra precio unitario al seleccionar producto', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');

    expect(getAgregarButton().disabled).toBe(false);
    expect(getPrecioUnitarioInput().value).toBe('$20');
  });

  test('agrega un insumo nuevo cuando producto y cantidad son válidos', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');
    await inputElement(getCantidadAgregarInput(), '2');
    await clickElement(getAgregarButton());

    expect(setInsumos).toHaveBeenCalledWith([
      {
        id: 1,
        nombre: 'Gasas',
        stock: 10,
        precio: 20,
        cantidad: 2,
      },
    ]);
  });

  test('no agrega insumo si no hay producto seleccionado', async () => {
    await mount();

    await clickElement(getAgregarButton());

    expect(setInsumos).not.toHaveBeenCalled();
  });

  test('no agrega insumo si la cantidad es cero', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');
    await inputElement(getCantidadAgregarInput(), '0');
    await clickElement(getAgregarButton());

    expect(setInsumos).not.toHaveBeenCalled();
  });

  test('no agrega insumo si la cantidad es negativa', async () => {
    await mount();

    await changeElement(getProductoSelect(), '1');
    await inputElement(getCantidadAgregarInput(), '-3');
    await clickElement(getAgregarButton());

    expect(setInsumos).not.toHaveBeenCalled();
  });

  test('restablece cantidad a 1 cuando queda vacía y pierde foco', async () => {
    await mount();

    const cantidadInput = getCantidadAgregarInput();

    await inputElement(cantidadInput, '');
    await blurElement(cantidadInput);

    expect(getCantidadAgregarInput().value).toBe('1');
  });

  test('suma cantidad cuando el producto ya existe en insumos', async () => {
    await mount({
      insumos: [
        {
          id: 1,
          nombre: 'Gasas',
          stock: 10,
          precio: 20,
          cantidad: 2,
        },
      ],
    });

    await changeElement(getProductoSelect(), '1');
    await inputElement(getCantidadAgregarInput(), '3');
    await clickElement(getAgregarButton());

    expect(setInsumos).toHaveBeenCalledWith([
      {
        id: 1,
        nombre: 'Gasas',
        stock: 10,
        precio: 20,
        cantidad: 5,
      },
    ]);
  });

  test('muestra error y no agrega si cantidad nueva supera stock', async () => {
    await mount({
      insumos: [
        {
          id: 2,
          nombre: 'Alcohol',
          stock: 3,
          precio: 50,
          cantidad: 2,
        },
      ],
    });

    await changeElement(getProductoSelect(), '2');
    await inputElement(getCantidadAgregarInput(), '2');
    await clickElement(getAgregarButton());

    expect(setInsumos).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Solo hay 3 unidades disponibles de Alcohol');
  });

  test('actualiza cantidad de un insumo existente si no supera stock', async () => {
    await mount({
      insumos: [
        {
          id: 1,
          nombre: 'Gasas',
          stock: 10,
          precio: 20,
          cantidad: 2,
        },
      ],
    });

    const inputCantidadTabla = getCantidadTablaInputByValue(2);

    await inputElement(inputCantidadTabla, '5');

    expect(setInsumos).toHaveBeenCalledWith([
      {
        id: 1,
        nombre: 'Gasas',
        stock: 10,
        precio: 20,
        cantidad: 5,
      },
    ]);
  });

  test('no actualiza cantidad de tabla si la nueva cantidad es inválida', async () => {
    await mount({
      insumos: [
        {
          id: 1,
          nombre: 'Gasas',
          stock: 10,
          precio: 20,
          cantidad: 2,
        },
      ],
    });

    const inputCantidadTabla = getCantidadTablaInputByValue(2);

    await inputElement(inputCantidadTabla, '0');

    expect(setInsumos).not.toHaveBeenCalled();
  });

  test('muestra error si al actualizar cantidad se supera stock', async () => {
    await mount({
      insumos: [
        {
          id: 2,
          nombre: 'Alcohol',
          stock: 3,
          precio: 50,
          cantidad: 1,
        },
      ],
    });

    const inputCantidadTabla = getCantidadTablaInputByValue(1);

    await inputElement(inputCantidadTabla, '5');

    expect(setInsumos).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Solo hay 3 unidades disponibles de Alcohol');
  });

  test('elimina un insumo de la tabla', async () => {
    await mount({
      insumos: [
        {
          id: 1,
          nombre: 'Gasas',
          stock: 10,
          precio: 20,
          cantidad: 2,
        },
        {
          id: 2,
          nombre: 'Alcohol',
          stock: 3,
          precio: 50,
          cantidad: 1,
        },
      ],
    });

    const deleteButtons = getDeleteButtons();

    expect(deleteButtons.length).toBe(2);

    await clickElement(deleteButtons[0]);

    expect(setInsumos).toHaveBeenCalledWith([
      {
        id: 2,
        nombre: 'Alcohol',
        stock: 3,
        precio: 50,
        cantidad: 1,
      },
    ]);
  });

  test('muestra precio, subtotal por producto y total general', async () => {
    await mount({
      insumos: [
        {
          id: 1,
          nombre: 'Gasas',
          stock: 10,
          precio: 20,
          cantidad: 2,
        },
        {
          id: 2,
          nombre: 'Alcohol',
          stock: 3,
          precio: 50,
          cantidad: 1,
        },
      ],
    });

    expect(container.textContent).toContain('Gasas');
    expect(container.textContent).toContain('Alcohol');
    expect(container.textContent).toContain('$20.00');
    expect(container.textContent).toContain('$40.00');
    expect(container.textContent).toContain('$50.00');
    expect(container.textContent).toContain('$90.00');
    expect(container.textContent).toContain('Total');
  });

  test('limpia mensaje de error al cambiar producto', async () => {
    await mount({
      insumos: [
        {
          id: 2,
          nombre: 'Alcohol',
          stock: 3,
          precio: 50,
          cantidad: 2,
        },
      ],
    });

    await changeElement(getProductoSelect(), '2');
    await inputElement(getCantidadAgregarInput(), '2');
    await clickElement(getAgregarButton());

    expect(container.textContent).toContain('Solo hay 3 unidades disponibles de Alcohol');

    await changeElement(getProductoSelect(), '1');

    expect(container.textContent).not.toContain('Solo hay 3 unidades disponibles de Alcohol');
  });

  test('limpia mensaje de error al cambiar cantidad', async () => {
    await mount({
      insumos: [
        {
          id: 2,
          nombre: 'Alcohol',
          stock: 3,
          precio: 50,
          cantidad: 2,
        },
      ],
    });

    await changeElement(getProductoSelect(), '2');
    await inputElement(getCantidadAgregarInput(), '2');
    await clickElement(getAgregarButton());

    expect(container.textContent).toContain('Solo hay 3 unidades disponibles de Alcohol');

    await inputElement(getCantidadAgregarInput(), '1');

    expect(container.textContent).not.toContain('Solo hay 3 unidades disponibles de Alcohol');
  });
});