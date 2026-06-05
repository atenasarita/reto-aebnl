/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockUseHistorialServicios = jest.fn();
const mockUseServicios = jest.fn();

let lastIntersectionObserver = null;

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    lastIntersectionObserver = this;
  }

  trigger(isIntersecting = true) {
    this.callback([{ isIntersecting }]);
  }
}

global.IntersectionObserver = MockIntersectionObserver;

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

jest.mock('../client/src/hooks/useHistorialServicios', () => ({
  __esModule: true,
  default: () => mockUseHistorialServicios(),
}));

jest.mock('../client/src/hooks/useHistorialServicios.js', () => ({
  __esModule: true,
  default: () => mockUseHistorialServicios(),
}));

jest.mock('../client/src/hooks/useServicios', () => ({
  __esModule: true,
  default: () => mockUseServicios(),
}));

jest.mock('../client/src/hooks/useServicios.js', () => ({
  __esModule: true,
  default: () => mockUseServicios(),
}));

jest.mock('react-icons/fi', () => ({
  __esModule: true,
  FiSearch: () => React.createElement('span', { 'data-testid': 'icon-search' }),
}));

jest.mock('../client/src/components/ui/SearchBar', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }) =>
    React.createElement('input', {
      'data-testid': 'search-input',
      value,
      placeholder,
      onChange: (event) => onChange(event.target.value),
    }),
}));

jest.mock('../client/src/components/ui/SearchBar.jsx', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }) =>
    React.createElement('input', {
      'data-testid': 'search-input',
      value,
      placeholder,
      onChange: (event) => onChange(event.target.value),
    }),
}));

jest.mock('../client/src/components/ui/Dropdown', () => ({
  __esModule: true,
  default: ({ value, onChange, options }) =>
    React.createElement(
      'select',
      {
        'data-testid': 'categoria-dropdown',
        value,
        onChange: (event) => onChange(event.target.value),
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
  default: ({ value, onChange, options }) =>
    React.createElement(
      'select',
      {
        'data-testid': 'categoria-dropdown',
        value,
        onChange: (event) => onChange(event.target.value),
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

jest.mock(
  '../client/src/components/layout/servicios/Navegacion/ServiciosTabla.jsx',
  () => ({
    __esModule: true,
    default: ({ filas, loading, error, onVerDetalle, onVerRecibo }) =>
      React.createElement(
        'section',
        { 'data-testid': 'servicios-tabla' },
        loading && React.createElement('p', { 'data-testid': 'tabla-loading' }, 'Tabla cargando'),
        error && React.createElement('p', { 'data-testid': 'tabla-error' }, error),
        filas.map((fila) =>
          React.createElement(
            'article',
            {
              key: fila.id,
              'data-testid': `fila-${fila.id}`,
            },
            React.createElement('p', { 'data-testid': `nombre-${fila.id}` }, fila.nombre),
            React.createElement('p', null, fila.categoria),
            React.createElement('p', null, fila.beneficiario),
            React.createElement('p', { 'data-testid': `cuota-${fila.id}` }, fila.cuotaTotalFormateado),
            React.createElement(
              'button',
              {
                type: 'button',
                'data-testid': `detalle-${fila.id}`,
                onClick: () => onVerDetalle(fila),
              },
              'Ver detalle'
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                'data-testid': `recibo-${fila.id}`,
                onClick: () => onVerRecibo(fila),
              },
              'Ver recibo'
            )
          )
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/servicios/Navegacion/Serviciosnuevoserviciomodal.jsx',
  () => ({
    __esModule: true,
    default: ({ open, onClose, onExito, serviciosExistentes, categorias }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-nuevo-servicio' },
        React.createElement('p', null, `Servicios existentes: ${serviciosExistentes.length}`),
        React.createElement('p', null, `Categorías: ${categorias.join(', ')}`),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'cerrar-modal-nuevo',
            onClick: onClose,
          },
          'Cerrar'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'exito-modal-nuevo',
            onClick: onExito,
          },
          'Éxito'
        )
      );
    },
  })
);

jest.mock(
  '../client/src/components/layout/servicios/Navegacion/Serviciosdetallemodal.jsx',
  () => ({
    __esModule: true,
    default: ({ open, onClose, servicio }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-detalle-servicio' },
        React.createElement('p', null, servicio?.nombre || 'Sin servicio'),
        React.createElement('p', null, servicio?.cuotaTotalFormateado || ''),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'cerrar-modal-detalle',
            onClick: onClose,
          },
          'Cerrar detalle'
        )
      );
    },
  })
);

jest.mock(
  '../client/src/components/layout/servicios/Navegacion/ServiciosBeneficiario.jsx',
  () => ({
    __esModule: true,
    default: ({ historial, onVerDetalle }) =>
      React.createElement(
        'section',
        { 'data-testid': 'servicios-beneficiario' },
        React.createElement('p', null, `Historial beneficiario: ${historial.length}`),
        historial.map((item) =>
          React.createElement(
            'button',
            {
              key: item.id,
              type: 'button',
              'data-testid': `beneficiario-detalle-${item.id}`,
              onClick: () => onVerDetalle(item),
            },
            item.beneficiario
          )
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/servicios/Navegacion/Servicioscatalogo.jsx',
  () => ({
    __esModule: true,
    default: ({ tipos, loading, onNuevoServicio }) =>
      React.createElement(
        'section',
        { 'data-testid': 'servicios-catalogo' },
        loading && React.createElement('p', null, 'Catálogo cargando'),
        React.createElement('p', null, `Tipos: ${tipos.length}`),
        tipos.map((tipo) =>
          React.createElement('p', { key: tipo.id }, tipo.nombre)
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'catalogo-nuevo-servicio',
            onClick: onNuevoServicio,
          },
          'Nuevo desde catálogo'
        )
      ),
  })
);

jest.mock('../client/src/pages/styles/Recibos.css', () => ({}));
jest.mock('../client/src/pages/styles/OperationalPage.css', () => ({}));
jest.mock('../client/src/pages/styles/RegistroServicio.css', () => ({}));
jest.mock('../client/src/pages/styles/Servicios.css', () => ({}));
jest.mock('../client/src/pages/styles/Inventario.css', () => ({}));

const ServiciosModule = await import('../client/src/pages/Servicios/Servicios.jsx');

const Servicios = ServiciosModule.default?.default || ServiciosModule.default || ServiciosModule;

let container;
let root;

const mockLoadMore = jest.fn();
const mockRefetchHistorial = jest.fn();
const mockRefetchTipos = jest.fn();

const historialBase = [
  {
    id: 'srv-1',
    nombre: 'Consulta general',
    categoria: 'Consultas',
    beneficiario: 'Juan García',
    montoServicio: 500,
    montoInventario: 100,
    descuento: 50,
    cuotaTotal: 550,
    montoPagado: 300,
  },
  {
    id: 'srv-2',
    nombre: 'Terapia física',
    categoria: 'Terapia',
    beneficiario: 'Ana López',
    montoServicio: 700,
    montoInventario: 0,
    descuento: 0,
    cuotaTotal: 700,
    montoPagado: 700,
  },
  {
    id: 'srv-3',
    nombre: 'Estudio renal',
    categoria: 'Estudios',
    beneficiario: 'Luis Pérez',
    montoServicio: 900,
    montoInventario: 50,
    descuento: 100,
    cuotaTotal: 850,
    montoPagado: 400,
  },
];

const tiposBase = [
  {
    id: 1,
    nombre: 'Consulta general',
    categoria: 'Consultas',
  },
  {
    id: 2,
    nombre: 'Terapia física',
    categoria: 'Terapia',
  },
  {
    id: 3,
    nombre: 'Estudio renal',
    categoria: 'Estudios',
  },
];

function setHooks({
  historial = historialBase,
  hasMore = false,
  loading = false,
  error = '',
  tipos = tiposBase,
  loadingTipos = false,
} = {}) {
  mockUseHistorialServicios.mockReturnValue({
    servicios: historial,
    hasMore,
    loading,
    error,
    loadMore: mockLoadMore,
    refetch: mockRefetchHistorial,
  });

  mockUseServicios.mockReturnValue({
    tipos,
    loading: loadingTipos,
    refetch: mockRefetchTipos,
  });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mount() {
  await act(async () => {
    root.render(React.createElement(Servicios));
  });

  await flushPromises();
}

async function clickByTestId(testId) {
  const element = container.querySelector(`[data-testid="${testId}"]`);

  if (!element) {
    throw new Error(`No se encontró ${testId}`);
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

async function clickByText(text) {
  const element = Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes(text)
  );

  if (!element) {
    throw new Error(`No se encontró botón con texto: ${text}`);
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

async function changeByTestId(testId, value) {
  const element = container.querySelector(`[data-testid="${testId}"]`);

  if (!element) {
    throw new Error(`No se encontró ${testId}`);
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

async function keyDownTablist(key) {
  const tablist = container.querySelector('[role="tablist"]');

  if (!tablist) {
    throw new Error('No se encontró tablist');
  }

  await act(async () => {
    tablist.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
      })
    );
  });

  await flushPromises();
}

function getActiveTabText() {
  const selected = container.querySelector('[role="tab"][aria-selected="true"]');
  return selected?.textContent || '';
}

describe('Servicios', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    lastIntersectionObserver = null;

    setHooks();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });

  test('renderiza encabezado, acciones principales y vista historial por defecto', async () => {
    await mount();

    expect(container.textContent).toContain('Servicios otorgados');
    expect(container.textContent).toContain('Registro e historial de servicios brindados.');
    expect(container.textContent).toContain('+ Nuevo servicio');
    expect(container.textContent).toContain('+ Registrar atención');

    expect(getActiveTabText()).toBe('Historial general');
    expect(container.querySelector('[data-testid="servicios-tabla"]')).toBeTruthy();
    expect(container.textContent).toContain('3 servicios registrados');
  });

  test('navega a registro de servicios al hacer click en Registrar atención', async () => {
    await mount();

    await clickByText('+ Registrar atención');

    expect(mockNavigate).toHaveBeenCalledWith('/registro_servicios');
  });

  test('abre y cierra el modal de nuevo servicio desde el encabezado', async () => {
    await mount();

    expect(container.querySelector('[data-testid="modal-nuevo-servicio"]')).toBeFalsy();

    await clickByText('+ Nuevo servicio');

    expect(container.querySelector('[data-testid="modal-nuevo-servicio"]')).toBeTruthy();
    expect(container.textContent).toContain('Servicios existentes: 3');

    await clickByTestId('cerrar-modal-nuevo');

    expect(container.querySelector('[data-testid="modal-nuevo-servicio"]')).toBeFalsy();
  });

  test('al guardar un nuevo servicio refresca historial y catálogo', async () => {
    await mount();

    await clickByText('+ Nuevo servicio');
    await clickByTestId('exito-modal-nuevo');

    expect(mockRefetchHistorial).toHaveBeenCalledTimes(1);
    expect(mockRefetchTipos).toHaveBeenCalledTimes(1);
  });

  test('mapea montos a formato moneda antes de enviarlos a la tabla', async () => {
    await mount();

    expect(container.querySelector('[data-testid="cuota-srv-1"]').textContent).toContain('$550.00');
    expect(container.querySelector('[data-testid="cuota-srv-2"]').textContent).toContain('$700.00');
  });

  test('filtra historial por texto de búsqueda', async () => {
    await mount();

    await changeByTestId('search-input', 'terapia');

    expect(container.querySelector('[data-testid="fila-srv-1"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="fila-srv-2"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fila-srv-3"]')).toBeFalsy();
    expect(container.textContent).toContain('Mostrando 1 de 3 servicios');
  });

  test('filtra historial por categoría', async () => {
    await mount();

    await changeByTestId('categoria-dropdown', 'Estudios');

    expect(container.querySelector('[data-testid="fila-srv-1"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="fila-srv-2"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="fila-srv-3"]')).toBeTruthy();
    expect(container.textContent).toContain('Mostrando 1 de 3 servicios');
  });

  test('combina búsqueda y categoría', async () => {
    await mount();

    await changeByTestId('categoria-dropdown', 'Consultas');
    await changeByTestId('search-input', 'juan');

    expect(container.querySelector('[data-testid="fila-srv-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fila-srv-2"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="fila-srv-3"]')).toBeFalsy();
  });

  test('usa categorías fallback cuando no hay tipos cargados', async () => {
    setHooks({
      tipos: [],
    });

    await mount();

    const dropdown = container.querySelector('[data-testid="categoria-dropdown"]');

    expect(dropdown.textContent).toContain('Consultas');
    expect(dropdown.textContent).toContain('Estudios');
    expect(dropdown.textContent).toContain('Laboratorio');
    expect(dropdown.textContent).toContain('Material');
  });

  test('muestra loading inicial en historial cuando no hay registros', async () => {
    setHooks({
      historial: [],
      loading: true,
    });

    await mount();

    expect(container.textContent).toContain('Cargando…');
    expect(container.querySelector('[data-testid="tabla-loading"]')).toBeTruthy();
  });

  test('pasa error a la tabla de historial', async () => {
    setHooks({
      error: 'Error al cargar servicios',
    });

    await mount();

    expect(container.querySelector('[data-testid="tabla-error"]')).toBeTruthy();
    expect(container.textContent).toContain('Error al cargar servicios');
  });

  test('abre y cierra modal de detalle desde la tabla', async () => {
    await mount();

    await clickByTestId('detalle-srv-1');

    expect(container.querySelector('[data-testid="modal-detalle-servicio"]')).toBeTruthy();
    expect(container.textContent).toContain('Consulta general');
    expect(container.textContent).toContain('$550.00');

    await clickByTestId('cerrar-modal-detalle');

    expect(container.querySelector('[data-testid="modal-detalle-servicio"]')).toBeFalsy();
  });

  test('navega a recibos con folio del servicio', async () => {
    await mount();

    await clickByTestId('recibo-srv-1');

    expect(mockNavigate).toHaveBeenCalledWith('/recibos?folio=srv-1');
  });

  test('cambia a vista Por beneficiario con click en tab', async () => {
    await mount();

    await clickByText('Por beneficiario');

    expect(getActiveTabText()).toBe('Por beneficiario');
    expect(container.querySelector('[data-testid="servicios-beneficiario"]')).toBeTruthy();
    expect(container.textContent).toContain('Consulta el historial completo de un beneficiario');
  });

  test('abre detalle desde la vista Por beneficiario', async () => {
    await mount();

    await clickByText('Por beneficiario');
    await clickByTestId('beneficiario-detalle-srv-2');

    expect(container.querySelector('[data-testid="modal-detalle-servicio"]')).toBeTruthy();
    expect(container.textContent).toContain('Terapia física');
    expect(container.textContent).toContain('$700.00');
  });

  test('cambia a vista Catálogo y muestra servicios disponibles', async () => {
    await mount();

    await clickByText('Catálogo');

    expect(getActiveTabText()).toBe('Catálogo');
    expect(container.querySelector('[data-testid="servicios-catalogo"]')).toBeTruthy();
    expect(container.textContent).toContain('3 servicios disponibles');
    expect(container.textContent).toContain('Consulta general');
    expect(container.textContent).toContain('Terapia física');
  });

  test('muestra estado de carga en catálogo', async () => {
    setHooks({
      loadingTipos: true,
    });

    await mount();

    await clickByText('Catálogo');

    expect(container.textContent).toContain('Cargando…');
    expect(container.textContent).toContain('Catálogo cargando');
  });

  test('abre modal de nuevo servicio desde catálogo', async () => {
    await mount();

    await clickByText('Catálogo');
    await clickByTestId('catalogo-nuevo-servicio');

    expect(container.querySelector('[data-testid="modal-nuevo-servicio"]')).toBeTruthy();
  });

  test('navega tabs con teclado usando flechas, Home y End', async () => {
    await mount();

    expect(getActiveTabText()).toBe('Historial general');

    await keyDownTablist('ArrowRight');
    expect(getActiveTabText()).toBe('Por beneficiario');

    await keyDownTablist('ArrowRight');
    expect(getActiveTabText()).toBe('Catálogo');

    await keyDownTablist('ArrowLeft');
    expect(getActiveTabText()).toBe('Por beneficiario');

    await keyDownTablist('Home');
    expect(getActiveTabText()).toBe('Historial general');

    await keyDownTablist('End');
    expect(getActiveTabText()).toBe('Catálogo');
  });

  test('llama loadMore cuando el sentinel intersecta y hay más registros', async () => {
    setHooks({
      hasMore: true,
      loading: false,
    });

    await mount();

    expect(lastIntersectionObserver).toBeTruthy();

    await act(async () => {
      lastIntersectionObserver.trigger(true);
    });

    expect(mockLoadMore).toHaveBeenCalledTimes(1);
  });

  test('no llama loadMore si no hay más registros', async () => {
    setHooks({
      hasMore: false,
      loading: false,
    });

    await mount();

    await act(async () => {
      lastIntersectionObserver.trigger(true);
    });

    expect(mockLoadMore).not.toHaveBeenCalled();
  });

  test('no llama loadMore si está cargando', async () => {
    setHooks({
      hasMore: true,
      loading: true,
    });

    await mount();

    await act(async () => {
      lastIntersectionObserver.trigger(true);
    });

    expect(mockLoadMore).not.toHaveBeenCalled();
  });

  test('muestra mensaje de cargando más cuando hay historial y loading es true', async () => {
    setHooks({
      loading: true,
      historial: historialBase,
    });

    await mount();

    expect(container.textContent).toContain('Cargando más…');
  });

  test('muestra mensaje cuando todos los registros están cargados', async () => {
    setHooks({
      hasMore: false,
      historial: historialBase,
    });

    await mount();

    expect(container.textContent).toContain('Todos los registros cargados.');
  });
});