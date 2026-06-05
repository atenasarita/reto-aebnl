/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.unstable_mockModule('react-icons/fi', () => ({
  __esModule: true,
  FiSearch: () => React.createElement('span', { 'data-testid': 'icon-search' }),
}));

jest.unstable_mockModule(
  '../client/src/components/layout/servicios/Navegacion/Servicioscatalogo.module.css',
  () => ({
    __esModule: true,
    default: new Proxy({}, { get: (_, prop) => String(prop) }),
  })
);

const ServiciosCatalogoModule = await import(
  '../client/src/components/layout/servicios/Navegacion/Servicioscatalogo.jsx'
);
const ServiciosCatalogo =
  ServiciosCatalogoModule.default?.default ||
  ServiciosCatalogoModule.default ||
  ServiciosCatalogoModule;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const tipos = [
  { id: 1, nombre: 'Consulta general',    categoria: 'Consulta', precio: 500  },
  { id: 2, nombre: 'Terapia física',      categoria: 'Terapia',  precio: 300  },
  { id: 3, nombre: 'Consulta pediátrica', categoria: 'Consulta', precio: 400  },
  { id: 4, nombre: 'Odontología',         categoria: 'Dental',   precio: null },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function changeInput(element, value) {
  setNativeValue(element, value);
  element.dispatchEvent(new Event('input',  { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

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

async function mount(props = {}) {
  await act(async () => {
    root.render(React.createElement(ServiciosCatalogo, props));
  });
}

function getSearchInput() {
  return container.querySelector('input[placeholder="Buscar servicio…"]');
}

function getCategorySelect() {
  return container.querySelector('select.dropdown-select');
}

function getRows() {
  return container.querySelectorAll('tbody tr');
}

function getFooter() {
  return container.querySelector('p.tabla-footer');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ServiciosCatalogo — estado cargando', () => {

  test('muestra un contenedor con role="status"', async () => {
    await mount({ loading: true });

    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  test('muestra el aria-label "Cargando catálogo"', async () => {
    await mount({ loading: true });

    expect(container.querySelector('[aria-label="Cargando catálogo"]')).not.toBeNull();
  });

  test('renderiza exactamente 4 filas skeleton', async () => {
    await mount({ loading: true });

    expect(container.querySelectorAll('.skeleton-row').length).toBe(4);
  });

  test('no renderiza la tabla mientras carga', async () => {
    await mount({ loading: true });

    expect(container.querySelector('table')).toBeNull();
  });

});

describe('ServiciosCatalogo — renderizado inicial', () => {

  test('renderiza todos los servicios en la tabla', async () => {
    await mount({ tipos });

    expect(getRows().length).toBe(4);
  });

  test('muestra "4 de 4 servicios" en el pie de página', async () => {
    await mount({ tipos });

    expect(getFooter().textContent).toBe('4 de 4 servicios');
  });

  test('muestra los encabezados Nombre, Categoría y Precio', async () => {
    await mount({ tipos });

    const headers = Array.from(container.querySelectorAll('thead th')).map((h) => h.textContent);
    expect(headers).toEqual(['Nombre', 'Categoría', 'Precio']);
  });

  test('muestra los nombres de los servicios en el cuerpo de la tabla', async () => {
    await mount({ tipos });

    expect(container.textContent).toContain('Consulta general');
    expect(container.textContent).toContain('Terapia física');
    expect(container.textContent).toContain('Odontología');
  });

  test('formatea el precio como moneda MXN', async () => {
    await mount({ tipos });

    const expected = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(500);
    expect(container.textContent).toContain(expected);
  });

  test('muestra "—" para precio null', async () => {
    await mount({ tipos });

    const rows = Array.from(getRows());
    const odontologiaRow = rows.find((r) => r.textContent.includes('Odontología'));
    expect(odontologiaRow.textContent).toContain('—');
  });

  test('renderiza el chip de categoría con el nombre correcto', async () => {
    await mount({ tipos });

    expect(container.textContent).toContain('Consulta');
    expect(container.textContent).toContain('Terapia');
    expect(container.textContent).toContain('Dental');
  });

  test('no muestra "No hay servicios que coincidan." cuando hay resultados', async () => {
    await mount({ tipos });

    expect(container.textContent).not.toContain('No hay servicios que coincidan.');
  });

  test('renderiza el input de búsqueda con el placeholder correcto', async () => {
    await mount({ tipos });

    expect(getSearchInput()).not.toBeNull();
    expect(getSearchInput().placeholder).toBe('Buscar servicio…');
  });

});

describe('ServiciosCatalogo — lista vacía', () => {

  test('muestra "No hay servicios que coincidan." cuando tipos es vacío', async () => {
    await mount({ tipos: [] });

    expect(container.textContent).toContain('No hay servicios que coincidan.');
  });

  test('muestra "0 de 0 servicios" en el pie de página', async () => {
    await mount({ tipos: [] });

    expect(getFooter().textContent).toBe('0 de 0 servicios');
  });

  test('no renderiza la tabla cuando no hay servicios', async () => {
    await mount({ tipos: [] });

    expect(container.querySelector('table')).toBeNull();
  });

  test('muestra "No hay servicios que coincidan." cuando tipos usa el valor por defecto', async () => {
    await mount({});

    expect(container.textContent).toContain('No hay servicios que coincidan.');
  });

});

describe('ServiciosCatalogo — búsqueda por texto', () => {

  test('filtra por nombre del servicio (coincidencia parcial)', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'terapia'); });

    expect(getRows().length).toBe(1);
    expect(container.textContent).toContain('Terapia física');
  });

  test('filtra por nombre de categoría', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'dental'); });

    expect(getRows().length).toBe(1);
    expect(container.textContent).toContain('Odontología');
  });

  test('la búsqueda no distingue mayúsculas/minúsculas', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'CONSULTA'); });

    expect(getRows().length).toBe(2);
  });

  test('muestra "No hay servicios que coincidan." cuando no hay coincidencias', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'zzz'); });

    expect(container.textContent).toContain('No hay servicios que coincidan.');
  });

  test('actualiza el pie de página con el conteo filtrado', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'consulta'); });

    expect(getFooter().textContent).toBe('2 de 4 servicios');
  });

  test('limpiar la búsqueda restaura todos los servicios', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'terapia'); });
    await act(async () => { changeInput(getSearchInput(), ''); });

    expect(getRows().length).toBe(4);
  });

});

describe('ServiciosCatalogo — filtro por categoría', () => {

  test('el dropdown incluye "Todas las categorías" como primera opción con value vacío', async () => {
    await mount({ tipos });

    const options = Array.from(getCategorySelect().options);
    expect(options[0].textContent).toBe('Todas las categorías');
    expect(options[0].value).toBe('');
  });

  test('el dropdown incluye las categorías únicas ordenadas alfabéticamente', async () => {
    await mount({ tipos });

    const options = Array.from(getCategorySelect().options).slice(1).map((o) => o.value);
    expect(options).toEqual(['Consulta', 'Dental', 'Terapia']);
  });

  test('el dropdown deduplica categorías repetidas', async () => {
    await mount({ tipos });

    // tipos tiene 'Consulta' en ids 1 y 3, debe aparecer una sola vez
    const options = Array.from(getCategorySelect().options).slice(1);
    expect(options.length).toBe(3);
  });

  test('filtra la tabla al seleccionar una categoría', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getCategorySelect(), 'Consulta'); });

    expect(getRows().length).toBe(2);
    expect(container.textContent).toContain('Consulta general');
    expect(container.textContent).toContain('Consulta pediátrica');
    expect(container.textContent).not.toContain('Terapia física');
  });

  test('actualiza el pie de página tras filtrar por categoría', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getCategorySelect(), 'Terapia'); });

    expect(getFooter().textContent).toBe('1 de 4 servicios');
  });

  test('seleccionar "Todas las categorías" restaura todos los servicios', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getCategorySelect(), 'Dental'); });
    await act(async () => { changeInput(getCategorySelect(), ''); });

    expect(getRows().length).toBe(4);
  });

});

describe('ServiciosCatalogo — búsqueda y categoría combinadas', () => {

  test('aplica texto y categoría simultáneamente', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'consulta'); });
    await act(async () => { changeInput(getCategorySelect(), 'Consulta'); });

    expect(getRows().length).toBe(2);
    expect(container.textContent).toContain('Consulta general');
    expect(container.textContent).toContain('Consulta pediátrica');
    expect(container.textContent).not.toContain('Terapia física');
  });

  test('muestra "No hay servicios que coincidan." cuando la combinación no tiene resultados', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'odont'); });
    await act(async () => { changeInput(getCategorySelect(), 'Consulta'); });

    expect(container.textContent).toContain('No hay servicios que coincidan.');
  });

  test('el conteo del pie de página refleja el filtro combinado', async () => {
    await mount({ tipos });

    await act(async () => { changeInput(getSearchInput(), 'consulta'); });
    await act(async () => { changeInput(getCategorySelect(), 'Consulta'); });

    expect(getFooter().textContent).toBe('2 de 4 servicios');
  });

});

describe('ServiciosCatalogo — botón Nuevo servicio', () => {

  test('llama a onNuevoServicio al hacer clic', async () => {
    const onNuevoServicio = jest.fn();
    await mount({ tipos, onNuevoServicio });

    const btn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === '+ Nuevo servicio'
    );

    await act(async () => { btn.click(); });

    expect(onNuevoServicio).toHaveBeenCalledTimes(1);
  });

  test('no lanza error cuando onNuevoServicio no se pasa como prop', async () => {
    await mount({ tipos });

    const btn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === '+ Nuevo servicio'
    );

    await expect(act(async () => { btn.click(); })).resolves.not.toThrow();
  });

});
