/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

global.fetch = jest.fn();

const mockNavigate = jest.fn();
const mockSetSearchParams = jest.fn();
const mockHumanizeError = jest.fn();

let mockSearchParams;
let mockLocation;

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

jest.mock('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/humanizeError', () => ({
  __esModule: true,
  humanizeError: (...args) => mockHumanizeError(...args),
}));

jest.mock('../client/src/utils/humanizeError.js', () => ({
  __esModule: true,
  humanizeError: (...args) => mockHumanizeError(...args),
}));

jest.mock('react-icons/fi', () => ({
  __esModule: true,
  FiUserPlus: () => React.createElement('span', { 'data-testid': 'icon-user-plus' }),
  FiSearch: () => React.createElement('span', { 'data-testid': 'icon-search' }),
}));

jest.mock('../client/src/components/ui/SearchBar', () => ({
  __esModule: true,
  default: ({ onSearch, className }) =>
    React.createElement('input', {
      className,
      'data-testid': 'searchbar',
      placeholder: 'Buscar beneficiario',
      onChange: (event) => onSearch(event.target.value),
    }),
}));

jest.mock('../client/src/components/ui/Dropdown', () => ({
  __esModule: true,
  default: ({ options = [], value, onChange, className }) =>
    React.createElement(
      'select',
      {
        className,
        value,
        'data-testid': 'estatus-dropdown',
        onChange: (event) => onChange(event.target.value),
      },
      options.map((option) =>
        React.createElement(
          'option',
          { key: option.value, value: option.value },
          option.label
        )
      )
    ),
}));

jest.mock('../client/src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, className, iconLeft }) =>
    React.createElement(
      'button',
      {
        type: 'button',
        className,
        onClick,
      },
      iconLeft,
      children
    ),
}));

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioGrid/BenecifiarioGrid',
  () => ({
    __esModule: true,
    default: ({ data, loading, onRefresh, beneficiarioEditId, clearEditQuery }) =>
      React.createElement(
        'section',
        { 'data-testid': 'beneficiario-grid' },
        React.createElement('p', { 'data-testid': 'loading-state' }, loading ? 'Cargando' : 'Listo'),
        React.createElement(
          'p',
          { 'data-testid': 'edit-id' },
          beneficiarioEditId ? `Editando ${beneficiarioEditId}` : 'Sin edición'
        ),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'refresh-btn', onClick: onRefresh },
          'Refrescar'
        ),
        React.createElement(
          'button',
          { type: 'button', 'data-testid': 'clear-edit-btn', onClick: clearEditQuery },
          'Limpiar edit'
        ),
        React.createElement(
          'ul',
          null,
          data.map((b) =>
            React.createElement(
              'li',
              { key: b.id_beneficiario, 'data-testid': 'beneficiario-item' },
              `${b.folio} - ${b.identificadores?.nombres ?? ''} ${b.identificadores?.apellido_paterno ?? ''} - ${b.estado}`
            )
          )
        )
      ),
  })
);

jest.mock('../client/src/pages/styles/GestionBeneficiarios.css', () => ({}));

const GestionBeneficiariosModule = await import(
  '../client/src/pages/GestionBeneficiarios/GestionBeneficiarios.jsx'
);

const GestionBeneficiarios =
  GestionBeneficiariosModule.default?.default ||
  GestionBeneficiariosModule.default ||
  GestionBeneficiariosModule;

let container;
let root;

const beneficiariosMock = [
  {
    id_beneficiario: 1,
    folio: 'BEN-001',
    estado: 'activo',
    dias_para_vencer: 3,
    identificadores: {
      nombres: 'Ana',
      apellido_paterno: 'García',
    },
  },
  {
    id_beneficiario: 2,
    folio: 'BEN-002',
    estado: 'inactivo',
    dias_para_vencer: 20,
    identificadores: {
      nombres: 'Luis',
      apellido_paterno: 'Pérez',
    },
  },
  {
    id_beneficiario: 3,
    folio: 'BEN-003',
    estado: 'activo',
    dias_para_vencer: null,
    identificadores: {
      nombres: 'María',
      apellido_paterno: 'López',
    },
  },
];

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(message = 'Error del servidor') {
  return {
    ok: false,
    json: async () => ({ message }),
  };
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

function changeInput(input, value) {
  setNativeValue(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function getButton(text) {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes(text)
  );
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mount() {
  await act(async () => {
    root.render(React.createElement(GestionBeneficiarios));
  });

  await flushPromises();
}

describe('GestionBeneficiarios', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.fetch.mockReset();

    localStorage.clear();
    localStorage.setItem('token', 'token-123');

    mockSearchParams = new URLSearchParams('');
    mockLocation = { state: null };
    mockHumanizeError.mockImplementation((err) => `Error humano: ${err.message}`);

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    global.fetch.mockResolvedValue(okResponse(beneficiariosMock));
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

  test('carga beneficiarios al renderizar y los muestra en el grid', async () => {
    await mount();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(container.textContent).toContain('Gestion de Beneficiarios');
    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).toContain('María López');

    expect(localStorage.getItem('aebnl_cache_beneficiarios')).toBeTruthy();
  });

  test('navega al registro de beneficiario al presionar Nuevo Beneficiario', async () => {
    await mount();

    await act(async () => {
      getButton('Nuevo Beneficiario').click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/registro_beneficiario');
  });

  test('filtra beneficiarios por texto escrito en el buscador', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'ana');
    });

    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).not.toContain('Luis Pérez');
    expect(container.textContent).not.toContain('María López');
  });

  test('filtra beneficiarios por folio', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'BEN-002');
    });

    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).not.toContain('Ana García');
    expect(container.textContent).not.toContain('María López');
  });

  test('filtra beneficiarios por estatus activo', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="estatus-dropdown"]'), 'activo');
    });

    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).toContain('María López');
    expect(container.textContent).not.toContain('Luis Pérez');
  });

  test('filtra beneficiarios por estatus inactivo', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="estatus-dropdown"]'), 'inactivo');
    });

    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).not.toContain('Ana García');
    expect(container.textContent).not.toContain('María López');
  });

  test('filtra beneficiarios por vencer', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="estatus-dropdown"]'), 'por-vencer');
    });

    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).not.toContain('Luis Pérez');
    expect(container.textContent).not.toContain('María López');
  });

  test('combina búsqueda por texto con filtro de estatus', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'maría');
      changeInput(container.querySelector('[data-testid="estatus-dropdown"]'), 'activo');
    });

    expect(container.textContent).toContain('María López');
    expect(container.textContent).not.toContain('Ana García');
    expect(container.textContent).not.toContain('Luis Pérez');
  });

  test('si existe query param edit, muestra solo el beneficiario editado', async () => {
    mockSearchParams = new URLSearchParams('edit=2');

    await mount();

    expect(container.textContent).toContain('Editando 2');
    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).not.toContain('Ana García');
    expect(container.textContent).not.toContain('María López');
  });

  test('clearEditQuery elimina el parámetro edit', async () => {
    mockSearchParams = new URLSearchParams('edit=2');

    await mount();

    await act(async () => {
      container.querySelector('[data-testid="clear-edit-btn"]').click();
    });

    expect(mockSetSearchParams).toHaveBeenCalled();

    const params = mockSetSearchParams.mock.calls[0][0];
    expect(params.get('edit')).toBeNull();
  });

  test('si viene beneficiarioCreado en location.state lo ordena primero', async () => {
    mockLocation = {
      state: {
        beneficiarioCreado: {
          id_beneficiario: 3,
        },
      },
    };

    await mount();

    const items = Array.from(container.querySelectorAll('[data-testid="beneficiario-item"]'));

    expect(items[0].textContent).toContain('María López');
    expect(items[1].textContent).toContain('Ana García');
    expect(items[2].textContent).toContain('Luis Pérez');
  });

  test('handleBuscar sin query limpia edit y vuelve a cargar beneficiarios', async () => {
    mockSearchParams = new URLSearchParams('edit=2');

    await mount();

    global.fetch.mockClear();
    global.fetch.mockResolvedValueOnce(okResponse(beneficiariosMock));

    await act(async () => {
      getButton('Buscar').click();
    });

    await flushPromises();

    expect(mockSetSearchParams).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios',
      expect.any(Object)
    );
  });

  test('handleBuscar online busca por folio en endpoint específico', async () => {
    await mount();

    global.fetch.mockClear();
    global.fetch.mockResolvedValueOnce(
      okResponse({
        id_beneficiario: 2,
        folio: 'BEN-002',
        estado: 'inactivo',
        identificadores: {
          nombres: 'Luis',
          apellido_paterno: 'Pérez',
        },
      })
    );

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'BEN-002');
    });

    await act(async () => {
      getButton('Buscar').click();
    });

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios/folio/BEN-002',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).not.toContain('Ana García');
  });

  test('handleBuscar online acepta respuesta en arreglo', async () => {
    await mount();

    global.fetch.mockClear();
    global.fetch.mockResolvedValueOnce(okResponse([beneficiariosMock[0]]));

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'BEN-001');
    });

    await act(async () => {
      getButton('Buscar').click();
    });

    await flushPromises();

    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).not.toContain('Luis Pérez');
  });

  test('handleBuscar offline filtra localmente sin llamar endpoint de folio', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    await mount();

    global.fetch.mockClear();

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'luis');
    });

    await act(async () => {
      getButton('Buscar').click();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).not.toContain('Ana García');
  });

  test('muestra error humanizado si falla la carga inicial y no hay caché', async () => {
    global.fetch.mockResolvedValueOnce(errorResponse('Servidor caído'));

    await mount();

    expect(mockHumanizeError).toHaveBeenCalled();
    expect(container.textContent).toContain('Error humano: Servidor caído');
  });

  test('usa caché si falla la carga inicial', async () => {
    localStorage.setItem(
      'aebnl_cache_beneficiarios',
      JSON.stringify([beneficiariosMock[1]])
    );

    global.fetch.mockResolvedValueOnce(errorResponse('Servidor caído'));

    await mount();

    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).not.toContain('Error humano');
  });

  test('si el caché está corrupto muestra error humanizado', async () => {
    localStorage.setItem('aebnl_cache_beneficiarios', '{mal json');

    global.fetch.mockResolvedValueOnce(errorResponse('Servidor caído'));

    await mount();

    expect(container.textContent).toContain('Error humano: Servidor caído');
  });

  test('muestra error si búsqueda online por folio falla', async () => {
    await mount();

    global.fetch.mockClear();
    global.fetch.mockResolvedValueOnce(errorResponse('No se encontró el beneficiario'));

    await act(async () => {
      changeInput(container.querySelector('[data-testid="searchbar"]'), 'NO-EXISTE');
    });

    await act(async () => {
      getButton('Buscar').click();
    });

    await flushPromises();

    expect(mockHumanizeError).toHaveBeenCalled();
    expect(container.textContent).toContain('Error humano: No se encontró el beneficiario');
  });

  test('BeneficiarioGrid puede refrescar la lista llamando onRefresh', async () => {
    await mount();

    global.fetch.mockClear();
    global.fetch.mockResolvedValueOnce(okResponse([beneficiariosMock[0]]));

    await act(async () => {
      container.querySelector('[data-testid="refresh-btn"]').click();
    });

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios',
      expect.any(Object)
    );

    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).not.toContain('Luis Pérez');
  });
});