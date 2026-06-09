/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.unstable_mockModule(
  '../client/src/components/layout/servicios/Navegacion/ServiciosBeneficiario.module.css',
  () => ({
    __esModule: true,
    default: new Proxy({}, { get: (_, prop) => String(prop) }),
  })
);

jest.unstable_mockModule('react-icons/fi', () => ({
  __esModule: true,
  FiSearch: () => React.createElement('span', { 'data-testid': 'icon-search' }),
  FiX: () => React.createElement('span', { 'data-testid': 'icon-x' }),
  FiDownload: () => React.createElement('span', { 'data-testid': 'icon-download' }),
}));

jest.unstable_mockModule('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
  })),
}));

jest.unstable_mockModule('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const ServiciosBeneficiarioModule = await import(
  '../client/src/components/layout/servicios/Navegacion/ServiciosBeneficiario.jsx'
);
const ServiciosBeneficiario =
  ServiciosBeneficiarioModule.default?.default ||
  ServiciosBeneficiarioModule.default ||
  ServiciosBeneficiarioModule;



const historial = [
  { id: 1, beneficiario: 'Juan García',     nombre: 'Consulta general',    categoria: 'Consulta', cuotaTotal: 500, montoPagado: 500, yaAporto: true  },
  { id: 2, beneficiario: 'Juan García',     nombre: 'Terapia física',      categoria: 'Terapia',  cuotaTotal: 300, montoPagado: 0,   yaAporto: false },
  { id: 3, beneficiario: 'María López',     nombre: 'Consulta pediátrica', categoria: 'Consulta', cuotaTotal: 400, montoPagado: 200, yaAporto: false },
  { id: 4, beneficiario: 'Carlos Martínez', nombre: 'Odontología',         categoria: 'Dental',   cuotaTotal: 600, montoPagado: 600, yaAporto: true  },
];

const historialUnicoServicio = [
  { id: 10, beneficiario: 'Ana Pérez', nombre: 'Fisioterapia', categoria: 'Terapia', cuotaTotal: 250, montoPagado: 250, yaAporto: true },
];


function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype   = Object.getPrototypeOf(element);
  const protoSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (protoSetter && valueSetter !== protoSetter) {
    protoSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

function changeInput(input, value) {
  setNativeValue(input, value);
  input.dispatchEvent(new Event('input',  { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}


let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

async function mount(props = {}) {
  await act(async () => {
    root.render(React.createElement(ServiciosBeneficiario, props));
  });
}

function getInput() {
  return container.querySelector('input[placeholder="Buscar beneficiario…"]');
}

function getDropdown() {
  return container.querySelector('[role="listbox"]');
}

function getDropdownItems() {
  return container.querySelectorAll('[role="option"] button');
}


describe('ServiciosBeneficiario — buscador', () => {

  test('renderiza el input con el placeholder correcto', async () => {
    await mount({ historial });

    expect(getInput()).not.toBeNull();
    expect(getInput().placeholder).toBe('Buscar beneficiario…');
  });

  test('no muestra dropdown con menos de 2 caracteres', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'j'); });

    expect(getDropdown()).toBeNull();
  });

  test('no muestra dropdown con query vacío', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), ''); });

    expect(getDropdown()).toBeNull();
  });

  test('muestra el dropdown cuando el query tiene 2+ caracteres coincidentes', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });

    expect(getDropdown()).not.toBeNull();
    expect(container.textContent).toContain('Juan García');
  });

  test('la búsqueda no distingue mayúsculas/minúsculas', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'JUAN'); });

    expect(getDropdown()).not.toBeNull();
    expect(container.textContent).toContain('Juan García');
  });

  test('deduplica beneficiarios en el dropdown (Juan García aparece una sola vez)', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });

    const items = getDropdownItems();
    const nombres = Array.from(items).map((b) => b.textContent);
    expect(nombres.filter((n) => n === 'Juan García').length).toBe(1);
  });

  test('limita las sugerencias a 5 resultados como máximo', async () => {
    const historialGrande = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      beneficiario: `Beneficiario Test ${i + 1}`,
      nombre: 'Servicio',
      categoria: 'Cat',
      cuotaTotal: 100,
      montoPagado: 100,
      yaAporto: true,
    }));

    await mount({ historial: historialGrande });

    await act(async () => { changeInput(getInput(), 'be'); });

    expect(getDropdownItems().length).toBeLessThanOrEqual(5);
  });

  test('no muestra dropdown cuando el query no coincide con ningún beneficiario', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'zz'); });

    expect(getDropdown()).toBeNull();
  });

});

describe('ServiciosBeneficiario — selección y tarjeta', () => {

  test('seleccionar una sugerencia oculta el dropdown', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => {
      const items = getDropdownItems();
      items[0].click();
    });

    expect(getDropdown()).toBeNull();
  });

  test('seleccionar una sugerencia muestra el nombre del beneficiario en la tarjeta', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('Juan García');
  });

  test('muestra el conteo plural cuando el beneficiario tiene más de 1 servicio', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('2 servicios registrados');
  });

  test('muestra el conteo singular cuando el beneficiario tiene exactamente 1 servicio', async () => {
    await mount({ historial: historialUnicoServicio });

    await act(async () => { changeInput(getInput(), 'an'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('1 servicio registrado');
  });

  test('muestra el total acumulado correcto en la tarjeta', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    // Juan García: cuotaTotal 500 + 300 = 800
    expect(container.textContent).toContain('$800.00');
  });

  test('muestra el total pagado correcto en la tarjeta', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    // Juan García: montoPagado 500 + 0 = 500
    expect(container.textContent).toContain('$500.00');
  });

  test('muestra "Pagado" para servicios con yaAporto = true', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('Pagado');
  });

  test('muestra "Pendiente" para servicios con yaAporto = false', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('Pendiente');
  });

  test('muestra el folio, nombre y categoría de cada servicio en la lista', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('#1');
    expect(container.textContent).toContain('Consulta general');
    expect(container.textContent).toContain('Consulta');
    expect(container.textContent).toContain('#2');
    expect(container.textContent).toContain('Terapia física');
    expect(container.textContent).toContain('Terapia');
  });

  test('muestra "—" cuando cuotaTotal es null', async () => {
    const historialConNull = [
      { id: 5, beneficiario: 'Pedro Ruiz', nombre: 'Servicio sin costo', categoria: 'General', cuotaTotal: null, montoPagado: 0, yaAporto: false },
    ];

    await mount({ historial: historialConNull });

    await act(async () => { changeInput(getInput(), 'pe'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('—');
  });

  test('no muestra tarjeta cuando no hay historial', async () => {
    await mount({ historial: [] });

    expect(container.querySelector('[class*="tarjeta"]')).toBeNull();
  });

  test('pone el nombre del beneficiario en el input al seleccionarlo', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(getInput().value).toBe('Juan García');
  });

});

describe('ServiciosBeneficiario — botón limpiar', () => {

  test('muestra el botón limpiar cuando hay texto en el input', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });

    expect(container.querySelector('[aria-label="Limpiar búsqueda"]')).not.toBeNull();
  });

  test('no muestra el botón limpiar cuando el input está vacío', async () => {
    await mount({ historial });

    expect(container.querySelector('[aria-label="Limpiar búsqueda"]')).toBeNull();
  });

  test('al hacer clic en limpiar se borra el input', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => {
      container.querySelector('[aria-label="Limpiar búsqueda"]').click();
    });

    expect(getInput().value).toBe('');
  });

  test('al hacer clic en limpiar se oculta la tarjeta del beneficiario', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });
    await act(async () => {
      container.querySelector('[aria-label="Limpiar búsqueda"]').click();
    });

    expect(container.textContent).not.toContain('Juan García');
    expect(getDropdown()).toBeNull();
  });

});

describe('ServiciosBeneficiario — ver detalle', () => {

  test('al hacer clic en "Ver detalle" llama a onVerDetalle con el servicio correcto', async () => {
    const onVerDetalle = jest.fn();

    await mount({ historial, onVerDetalle });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    const botonesVer = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent === 'Ver detalle'
    );

    await act(async () => { botonesVer[0].click(); });

    expect(onVerDetalle).toHaveBeenCalledTimes(1);
    expect(onVerDetalle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, beneficiario: 'Juan García' })
    );
  });

  test('no lanza error cuando onVerDetalle no se pasa como prop', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    const botonVer = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Ver detalle'
    );

    await expect(act(async () => { botonVer.click(); })).resolves.not.toThrow();
  });

});

describe('ServiciosBeneficiario — reseteo al escribir', () => {

  test('escribir en el input después de seleccionar oculta la tarjeta', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });

    expect(container.textContent).toContain('Juan García');

    await act(async () => { changeInput(getInput(), 'ma'); });

    expect(container.textContent).not.toContain('2 servicios registrados');
  });

  test('escribir en el input después de seleccionar puede mostrar nuevo dropdown', async () => {
    await mount({ historial });

    await act(async () => { changeInput(getInput(), 'ju'); });
    await act(async () => { getDropdownItems()[0].click(); });
    await act(async () => { changeInput(getInput(), 'ma'); });

    expect(getDropdown()).not.toBeNull();
    expect(container.textContent).toContain('María López');
  });

});
