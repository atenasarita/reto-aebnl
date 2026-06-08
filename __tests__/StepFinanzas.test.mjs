/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;


jest.mock('../client/src/components/ui/SearchBar', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder, prefix }) =>
    React.createElement('input', {
      type: 'text',
      'data-prefix': prefix ?? '',
      placeholder,
      value: value ?? '',
      onChange: (e) => onChange?.(e.target.value),
    }),
}));

jest.mock('../client/src/components/ui/Dropdown', () => ({
  __esModule: true,
  default: ({ options, value, onChange }) =>
    React.createElement(
      'select',
      {
        value: value ?? '',
        onChange: (e) => onChange?.(e.target.value),
      },
      (options || []).map((opt) =>
        React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
      )
    ),
}));

const StepFinanzasModule = await import(
  '../client/src/components/layout/servicios/Registro/StepFinanzas.jsx'
);
const StepFinanzas =
  StepFinanzasModule.default?.default ||
  StepFinanzasModule.default ||
  StepFinanzasModule;


const donadores = [
  { id_fondo: 1, nombre: 'Fondo García', tipo_origen: 'familia', saldo: 300 },
  { id_fondo: 2, nombre: 'Marca X', tipo_origen: 'marca', saldo: 500 },
];

function makeProps(overrides = {}) {
  return {
    total: 500,
    totalConDescuento: 450,
    saldo: 50,
    saldoGlobal: 1200,
    donadores,
    fondoSeleccionado: '',
    setFondoSeleccionado: jest.fn(),
    metodoPago: '',
    setMetodoPago: jest.fn(),
    montoPagado: 400,
    setMontoPagado: jest.fn(),
    montoDonacion: 0,
    setMontoDonacion: jest.fn(),
    descuento: 50,
    setDescuento: jest.fn(),
    yaAporto: false,
    setYaAporto: jest.fn(),
    ...overrides,
  };
}


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
    root.render(React.createElement(StepFinanzas, props));
  });
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

function changeInput(element, value) {
  setNativeValue(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

// Inputs: [0] descuento, [1] montoPagado, [2] montoDonacion
// Selects: [0] fondo, [1] método de pago
function getInputDescuento() { return container.querySelectorAll('input[type="text"]')[0]; }
function getInputMontoPagado() { return container.querySelectorAll('input[type="text"]')[1]; }
function getInputMontoDonacion() { return container.querySelectorAll('input[type="text"]')[2]; }
function getSelectFondo() { return container.querySelectorAll('select')[0]; }
function getSelectMetodo() { return container.querySelectorAll('select')[1]; }
function getCheckbox() { return container.querySelector('input[type="checkbox"]'); }


describe('StepFinanzas', () => {
  describe('saldo global de fondos', () => {
    test('muestra el saldo total en fondos de donación formateado', async () => {
      await mount(makeProps({ saldoGlobal: 1200 }));

      expect(container.textContent).toContain('$1200.00');
    });

    test('muestra $0.00 cuando saldoGlobal no está definido', async () => {
      await mount(makeProps({ saldoGlobal: undefined }));

      expect(container.textContent).toContain('$0.00');
    });
  });

  describe('resumen financiero', () => {
    test('muestra el subtotal', async () => {
      await mount(makeProps({ total: 500 }));

      expect(container.textContent).toContain('Subtotal');
      expect(container.textContent).toContain('$500.00');
    });

    test('muestra el total a pagar', async () => {
      await mount(makeProps({ totalConDescuento: 450 }));

      expect(container.textContent).toContain('Total a pagar');
      expect(container.textContent).toContain('$450.00');
    });

    test('muestra la aportación de la familia', async () => {
      await mount(makeProps({ montoPagado: 400 }));

      expect(container.textContent).toContain('Aportación familia');
      expect(container.textContent).toContain('$400.00');
    });

    test('muestra el aporte de la Asociación cuando descuento es mayor que cero', async () => {
      await mount(makeProps({ descuento: 50 }));

      expect(container.textContent).toContain('Aporte de la Asociación');
      expect(container.textContent).toContain('- $50.00');
    });

    test('oculta el aporte de la Asociación cuando descuento es cero', async () => {
      await mount(makeProps({ descuento: 0 }));

      expect(container.textContent).not.toContain('- $');
    });

    test('muestra la donación cuando montoDonacion es mayor que cero', async () => {
      await mount(makeProps({ montoDonacion: 100 }));

      expect(container.textContent).toContain('Donación');
      expect(container.textContent).toContain('$100.00');
    });

    test('incluye el nombre del fondo en la fila de donación cuando hay fondo activo', async () => {
      await mount(makeProps({ montoDonacion: 100, fondoSeleccionado: '1' }));

      expect(container.textContent).toContain('Fondo García');
    });

    test('oculta la fila de donación cuando montoDonacion es cero', async () => {
      await mount(makeProps({ montoDonacion: 0, fondoSeleccionado: '1' }));

      const resumenText = container.querySelector('.finanzasResumen')?.textContent ?? '';
      expect(resumenText).not.toContain('Donación');
    });

    test('muestra "Saldo pendiente" cuando saldo es positivo', async () => {
      await mount(makeProps({ saldo: 50 }));

      expect(container.textContent).toContain('Saldo pendiente');
      expect(container.textContent).toContain('$50.00');
    });

    test('muestra "Cambio" cuando saldo es negativo', async () => {
      await mount(makeProps({ saldo: -25 }));

      expect(container.textContent).toContain('Cambio');
      expect(container.textContent).toContain('$25.00');
    });

    test('muestra "Saldo" cuando saldo es cero', async () => {
      await mount(makeProps({ saldo: 0 }));

      expect(container.textContent).toContain('Saldo');
      expect(container.textContent).toContain('$0.00');
    });

    test('muestra "Sí" en "Ya aportó" cuando yaAporto es true', async () => {
      await mount(makeProps({ yaAporto: true }));

      expect(container.textContent).toContain('Sí');
    });

    test('muestra "No" en "Ya aportó" cuando yaAporto es false', async () => {
      await mount(makeProps({ yaAporto: false }));

      expect(container.textContent).toContain('No');
    });
  });

  describe('validaciones de donación', () => {
    test('muestra aviso de fondo faltante cuando hay monto de donación pero no hay fondo seleccionado', async () => {
      await mount(makeProps({ montoDonacion: 100, fondoSeleccionado: '' }));

      expect(container.textContent).toContain('Seleccione el fondo de donación a utilizar.');
    });

    test('no muestra aviso de fondo cuando montoDonacion es cero', async () => {
      await mount(makeProps({ montoDonacion: 0, fondoSeleccionado: '' }));

      expect(container.textContent).not.toContain('Seleccione el fondo de donación');
    });

    test('muestra aviso cuando el monto de donación excede el saldo del fondo', async () => {
      await mount(makeProps({ montoDonacion: 400, fondoSeleccionado: '1' })); // saldo=300

      expect(container.textContent).toContain('El monto excede el saldo del fondo seleccionado');
    });

    test('no muestra aviso de exceso cuando el monto está dentro del saldo', async () => {
      await mount(makeProps({ montoDonacion: 100, fondoSeleccionado: '1' })); // saldo=300

      expect(container.textContent).not.toContain('El monto excede el saldo');
    });
  });

  describe('fondo activo', () => {
    test('muestra el saldo disponible del fondo cuando hay fondo seleccionado', async () => {
      await mount(makeProps({ fondoSeleccionado: '1' }));

      expect(container.textContent).toContain('Saldo disponible en este fondo: $300.00');
    });

    test('no muestra saldo disponible cuando no hay fondo seleccionado', async () => {
      await mount(makeProps({ fondoSeleccionado: '' }));

      expect(container.textContent).not.toContain('Saldo disponible en este fondo');
    });
  });

  describe('opciones del dropdown de fondos', () => {
    test('muestra el tipo "Familia" para donadores con tipo_origen familia', async () => {
      await mount(makeProps());

      const optionTexts = Array.from(getSelectFondo().options).map((o) => o.textContent);
      expect(optionTexts.some((t) => t.includes('(Familia)'))).toBe(true);
    });

    test('muestra el tipo "Marca" para donadores con tipo_origen marca', async () => {
      await mount(makeProps());

      const optionTexts = Array.from(getSelectFondo().options).map((o) => o.textContent);
      expect(optionTexts.some((t) => t.includes('(Marca)'))).toBe(true);
    });

    test('incluye el saldo del fondo en la etiqueta de la opción', async () => {
      await mount(makeProps());

      const optionTexts = Array.from(getSelectFondo().options).map((o) => o.textContent);
      expect(optionTexts.some((t) => t.includes('$300.00'))).toBe(true);
    });
  });

  describe('callbacks de interacción', () => {
    test('llama a setDescuento al cambiar el input de aporte de la Asociación', async () => {
      const props = makeProps();
      await mount(props);

      await act(async () => { changeInput(getInputDescuento(), '80'); });

      expect(props.setDescuento).toHaveBeenCalledWith('80');
    });

    test('llama a setMontoPagado al cambiar el input de aportación familiar', async () => {
      const props = makeProps();
      await mount(props);

      await act(async () => { changeInput(getInputMontoPagado(), '350'); });

      expect(props.setMontoPagado).toHaveBeenCalledWith('350');
    });

    test('llama a setMontoDonacion al cambiar el input de monto cubierto con donación', async () => {
      const props = makeProps();
      await mount(props);

      await act(async () => { changeInput(getInputMontoDonacion(), '150'); });

      expect(props.setMontoDonacion).toHaveBeenCalledWith('150');
    });

    test('llama a setFondoSeleccionado al cambiar el dropdown de fondo', async () => {
      const props = makeProps();
      await mount(props);

      await act(async () => { changeInput(getSelectFondo(), '2'); });

      expect(props.setFondoSeleccionado).toHaveBeenCalledWith('2');
    });

    test('llama a setMetodoPago al cambiar el dropdown de método de pago', async () => {
      const props = makeProps();
      await mount(props);

      await act(async () => { changeInput(getSelectMetodo(), 'transferencia'); });

      expect(props.setMetodoPago).toHaveBeenCalledWith('transferencia');
    });

    test('llama a setYaAporto con true al marcar el checkbox', async () => {
      const props = makeProps({ yaAporto: false });
      await mount(props);

      await act(async () => { getCheckbox().click(); });

      expect(props.setYaAporto).toHaveBeenCalledWith(true);
    });

    test('llama a setYaAporto con false al desmarcar el checkbox', async () => {
      const props = makeProps({ yaAporto: true });
      await mount(props);

      await act(async () => { getCheckbox().click(); });

      expect(props.setYaAporto).toHaveBeenCalledWith(false);
    });
  });
});
