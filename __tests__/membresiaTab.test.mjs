/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

global.fetch = jest.fn();
global.alert = jest.fn();

jest.mock('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/BeneficiarioDetalle.module.css',
  () => ({
    __esModule: true,
    default: new Proxy(
      {},
      {
        get: (_, prop) => String(prop),
      }
    ),
  })
);

const Module = await import(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/MembresiaTab'
);

const MembresiaTab = Module.default?.default || Module.default || Module;

let container;
let root;

const mockOnUpdated = jest.fn();

const beneficiarioSinMembresia = {
  id_beneficiario: 10,
};

const beneficiarioConMembresia = {
  id_beneficiario: 20,
  membresia: {
    estado: 'activa',
    metodo_pago: 'tarjeta',
    fecha_inicio: '2026-06-08T00:00:00.000Z',
    fecha_fin: '2027-06-08T00:00:00.000Z',
    precio: 150,
  },
};

const beneficiarioVencido = {
  id_beneficiario: 30,
  membresia: {
    estado: 'vencida',
    metodo_pago: 'efectivo',
    fecha_inicio: '2025-01-15T00:00:00.000Z',
    fecha_fin: '2026-01-15T00:00:00.000Z',
    precio: 150,
  },
};

function okResponse(data = { success: true }) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(message = 'Error al actualizar membresía') {
  return {
    ok: false,
    json: async () => ({
      message,
    }),
  };
}

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
      React.createElement(MembresiaTab, {
        beneficiario: beneficiarioSinMembresia,
        ...props,
      })
    );
  });

  await flushPromises();
}

function getButtonByText(text) {
  const buttons = Array.from(container.querySelectorAll('button'));
  const button = buttons.find((element) => element.textContent.trim() === text);

  if (!button) {
    throw new Error(`No se encontró el botón: ${text}`);
  }

  return button;
}

async function clickButton(text) {
  const button = getButtonByText(text);

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

async function changeField(selector, value) {
  const field = container.querySelector(selector);

  if (!field) {
    throw new Error(`No se encontró el campo: ${selector}`);
  }

  await act(async () => {
    setNativeValue(field, value);

    field.dispatchEvent(
      new Event('input', {
        bubbles: true,
      })
    );

    field.dispatchEvent(
      new Event('change', {
        bubbles: true,
      })
    );
  });

  await flushPromises();

  return field;
}

function text() {
  return container.textContent;
}

describe('MembresiaTab', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.fetch.mockReset();
    global.alert.mockReset();

    localStorage.clear();
    localStorage.setItem('token', 'token-test');
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    localStorage.clear();
  });

  test('renderiza valores por defecto cuando el beneficiario no tiene membresía', async () => {
    await mount({
      beneficiario: beneficiarioSinMembresia,
    });

    expect(text()).toContain('Membresía');
    expect(text()).toContain('Vigencia, costo y método de pago del beneficiario.');
    expect(text()).toContain('sin registro');
    expect(text()).toContain('$150 MXN');
    expect(text()).toContain('Editar membresía');

    const emptyValues = Array.from(container.querySelectorAll('span')).filter(
      (element) => element.textContent.trim() === '—'
    );

    expect(emptyValues.length).toBeGreaterThanOrEqual(3);
  });

  test('renderiza una membresía existente con método, precio, estado y fechas formateadas', async () => {
    await mount({
      beneficiario: beneficiarioConMembresia,
    });

    expect(text()).toContain('activa');
    expect(text()).toContain('tarjeta');
    expect(text()).toContain('$150 MXN');
    expect(text()).toContain('08/06/2026');
    expect(text()).toContain('08/06/2027');
  });

  test('renderiza una membresía vencida y muestra sus datos', async () => {
    await mount({
      beneficiario: beneficiarioVencido,
    });

    expect(text()).toContain('vencida');
    expect(text()).toContain('efectivo');
    expect(text()).toContain('$150 MXN');
    expect(text()).toContain('15/01/2025');
    expect(text()).toContain('15/01/2026');
  });

  test('entra en modo edición y muestra campos editables', async () => {
    await mount({
      beneficiario: beneficiarioConMembresia,
    });

    await clickButton('Editar membresía');

    expect(text()).toContain('Guardar');
    expect(text()).toContain('Cancelar');

    expect(container.querySelector('select[name="metodo_pago"]')).toBeTruthy();
    expect(container.querySelector('input[name="precio"]')).toBeTruthy();
    expect(container.querySelector('input[name="fecha_inicio"]')).toBeTruthy();
    expect(container.querySelector('input[name="fecha_fin"]')).toBeTruthy();

    expect(container.querySelector('select[name="metodo_pago"]').value).toBe('tarjeta');
    expect(container.querySelector('input[name="precio"]').value).toBe('150');
    expect(container.querySelector('input[name="fecha_inicio"]').value).toBe('2026-06-08');
    expect(container.querySelector('input[name="fecha_fin"]').value).toBe('2027-06-08');
  });

  test('al cambiar fecha de inicio calcula fecha fin y cambia estado a activa', async () => {
    await mount({
      beneficiario: beneficiarioSinMembresia,
    });

    await clickButton('Editar membresía');

    await changeField('input[name="fecha_inicio"]', '2026-06-08');

    expect(container.querySelector('input[name="fecha_inicio"]').value).toBe('2026-06-08');
    expect(container.querySelector('input[name="fecha_fin"]').value).toBe('2027-06-08');
    expect(text()).toContain('activa');
  });

  test('al borrar fecha de inicio deja fecha fin vacía y estado sin registro en edición', async () => {
    await mount({
      beneficiario: beneficiarioConMembresia,
    });

    await clickButton('Editar membresía');

    await changeField('input[name="fecha_inicio"]', '');

    expect(container.querySelector('input[name="fecha_inicio"]').value).toBe('');
    expect(container.querySelector('input[name="fecha_fin"]').value).toBe('');
    expect(text()).toContain('sin registro');
  });

  test('permite cambiar método de pago y mantiene precio de membresía en 150', async () => {
  await mount({
    beneficiario: beneficiarioSinMembresia,
  });

  await clickButton('Editar membresía');

  await changeField('select[name="metodo_pago"]', 'donacion');

  expect(container.querySelector('select[name="metodo_pago"]').value).toBe('donacion');
  expect(container.querySelector('input[name="precio"]').value).toBe('150');
});

  test('cancelar edición restaura los datos originales', async () => {
    await mount({
      beneficiario: beneficiarioConMembresia,
    });

    await clickButton('Editar membresía');

    await changeField('input[name="precio"]', '999');
    await changeField('select[name="metodo_pago"]', 'efectivo');
    await changeField('input[name="fecha_inicio"]', '2026-01-01');

    await clickButton('Cancelar');

    expect(text()).toContain('$150 MXN');
    expect(text()).toContain('tarjeta');
    expect(text()).toContain('08/06/2026');
    expect(text()).toContain('08/06/2027');
    expect(text()).toContain('Editar membresía');
    expect(text()).not.toContain('Guardar');
  });

  test('guarda una membresía activa enviando el payload correcto', async () => {
    global.fetch.mockResolvedValueOnce(okResponse());

    await mount({
      beneficiario: beneficiarioSinMembresia,
      onUpdated: mockOnUpdated,
    });

    await clickButton('Editar membresía');

    await changeField('select[name="metodo_pago"]', 'efectivo');
    await changeField('input[name="precio"]', '150');
    await changeField('input[name="fecha_inicio"]', '2026-06-08');

    await clickButton('Guardar');

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios/10/membresia',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-test',
        },
        body: JSON.stringify({
          estado: 'activa',
          metodo_pago: 'efectivo',
          fecha_inicio: '2026-06-08',
          fecha_fin: '2027-06-08',
          precio: 150,
        }),
      }
    );

    expect(mockOnUpdated).toHaveBeenCalledTimes(1);
    expect(text()).toContain('Editar membresía');
    expect(text()).not.toContain('Guardar');
  });

  test('guarda como vencida cuando no hay fecha de inicio', async () => {
    global.fetch.mockResolvedValueOnce(okResponse());

    await mount({
      beneficiario: beneficiarioSinMembresia,
    });

    await clickButton('Editar membresía');

    await changeField('select[name="metodo_pago"]', 'donacion');

    await clickButton('Guardar');

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [, options] = global.fetch.mock.calls[0];

    expect(JSON.parse(options.body)).toEqual({
      estado: 'vencida',
      metodo_pago: 'donacion',
      fecha_inicio: null,
      fecha_fin: null,
      precio: 150,
    });
  });

  test('si precio queda vacío guarda precio 150 por defecto', async () => {
    global.fetch.mockResolvedValueOnce(okResponse());

    await mount({
      beneficiario: beneficiarioConMembresia,
    });

    await clickButton('Editar membresía');

    await changeField('input[name="precio"]', '');
    await changeField('input[name="fecha_inicio"]', '2026-06-08');

    await clickButton('Guardar');

    await flushPromises();

    const [, options] = global.fetch.mock.calls[0];

    expect(JSON.parse(options.body)).toEqual({
      estado: 'activa',
      metodo_pago: 'tarjeta',
      fecha_inicio: '2026-06-08',
      fecha_fin: '2027-06-08',
      precio: 150,
    });
  });

  test('deshabilita botones mientras guarda', async () => {
    let resolveFetch;

    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    await mount({
      beneficiario: beneficiarioSinMembresia,
    });

    await clickButton('Editar membresía');

    await act(async () => {
      getButtonByText('Guardar').dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(text()).toContain('Guardando...');
    expect(getButtonByText('Guardando...').disabled).toBe(true);
    expect(getButtonByText('Cancelar').disabled).toBe(true);

    await act(async () => {
      resolveFetch(okResponse());
    });

    await flushPromises();

    expect(text()).toContain('Editar membresía');
  });

  test('muestra alert cuando backend responde error y mantiene el modo edición', async () => {
    global.fetch.mockResolvedValueOnce(
      errorResponse('No se pudo actualizar la membresía')
    );

    await mount({
      beneficiario: beneficiarioSinMembresia,
    });

    await clickButton('Editar membresía');
    await clickButton('Guardar');

    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith('No se pudo actualizar la membresía');
    expect(text()).toContain('Guardar');
    expect(text()).toContain('Cancelar');
  });

  test('muestra mensaje genérico si backend responde error sin message', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await mount({
      beneficiario: beneficiarioSinMembresia,
    });

    await clickButton('Editar membresía');
    await clickButton('Guardar');

    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith('Error al actualizar membresía');
    expect(text()).toContain('Guardar');
  });

  test('cuando cambia el beneficiario reinicia formulario y sale de modo edición', async () => {
    await mount({
      beneficiario: beneficiarioConMembresia,
    });

    await clickButton('Editar membresía');

    expect(text()).toContain('Guardar');

    await act(async () => {
      root.render(
        React.createElement(MembresiaTab, {
          beneficiario: beneficiarioSinMembresia,
        })
      );
    });

    await flushPromises();

    expect(text()).toContain('Editar membresía');
    expect(text()).toContain('sin registro');
    expect(text()).toContain('$150 MXN');
    expect(text()).not.toContain('Guardar');
  });

  test('cuando cambia a otro beneficiario con membresía muestra los nuevos datos', async () => {
    await mount({
      beneficiario: beneficiarioSinMembresia,
    });

    expect(text()).toContain('sin registro');
    expect(text()).toContain('$150 MXN');

    await act(async () => {
      root.render(
        React.createElement(MembresiaTab, {
          beneficiario: beneficiarioVencido,
        })
      );
    });

    await flushPromises();

    expect(text()).toContain('vencida');
    expect(text()).toContain('efectivo');
    expect(text()).toContain('$150 MXN');
    expect(text()).toContain('15/01/2025');
    expect(text()).toContain('15/01/2026');
  });
});