/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockUseInventario = jest.fn();
const mockDeleteProductoInventario = jest.fn();

window.confirm = jest.fn();
window.alert = jest.fn();

jest.mock('../client/src/hooks/useInventario', () => ({
  __esModule: true,
  useInventario: () => mockUseInventario(),
}));

jest.mock('../client/src/hooks/useInventario.js', () => ({
  __esModule: true,
  useInventario: () => mockUseInventario(),
}));

const mockGetInventario = jest.fn();

jest.mock('../client/src/services/inventarioService', () => ({
  __esModule: true,
  getInventario: (...args) => mockGetInventario(...args),
  deleteProductoInventario: (...args) => mockDeleteProductoInventario(...args),
}));

jest.mock('../client/src/services/inventarioService.js', () => ({
  __esModule: true,
  getInventario: (...args) => mockGetInventario(...args),
  deleteProductoInventario: (...args) => mockDeleteProductoInventario(...args),
}));

jest.mock('../client/src/pages/inventario/inventarioUi', () => ({
  __esModule: true,

  mapInventarioApiRowToTableRow: (row) => ({
    id: String(row.ID_INVENTARIO),
    clave: row.CLAVE,
    nombre: row.NOMBRE,
    categoriaId: String(row.ID_CATEGORIA),
    categoria: row.CATEGORIA,
    cantidad: row.CANTIDAD,
  }),

  buildCategoriaFilterOptions: (productos) => {
    const mapa = new Map();

    productos.forEach((producto) => {
      mapa.set(producto.categoriaId, {
        value: producto.categoriaId,
        label: producto.categoria,
      });
    });

    return Array.from(mapa.values());
  },

  filterInventarioTableRows: (productos, filtros) => {
    return productos.filter((producto) => {
      const coincideCategoria =
        !filtros.categoriaId || producto.categoriaId === String(filtros.categoriaId);

      const texto = String(filtros.textoBusqueda || '').toLowerCase().trim();

      const coincideTexto =
        !texto ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.clave.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto);

      return coincideCategoria && coincideTexto;
    });
  },
}));

jest.mock('../client/src/pages/inventario/inventarioUi.js', () => ({
  __esModule: true,

  mapInventarioApiRowToTableRow: (row) => ({
    id: String(row.ID_INVENTARIO),
    clave: row.CLAVE,
    nombre: row.NOMBRE,
    categoriaId: String(row.ID_CATEGORIA),
    categoria: row.CATEGORIA,
    cantidad: row.CANTIDAD,
  }),

  buildCategoriaFilterOptions: (productos) => {
    const mapa = new Map();

    productos.forEach((producto) => {
      mapa.set(producto.categoriaId, {
        value: producto.categoriaId,
        label: producto.categoria,
      });
    });

    return Array.from(mapa.values());
  },

  filterInventarioTableRows: (productos, filtros) => {
    return productos.filter((producto) => {
      const coincideCategoria =
        !filtros.categoriaId || producto.categoriaId === String(filtros.categoriaId);

      const texto = String(filtros.textoBusqueda || '').toLowerCase().trim();

      const coincideTexto =
        !texto ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.clave.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto);

      return coincideCategoria && coincideTexto;
    });
  },
}));

jest.mock(
  '../client/src/components/layout/inventario/InventarioBarraAcciones/InventarioBarraAcciones',
  () => ({
    __esModule: true,
    default: ({
      onBusqueda,
      categoria,
      opcionesCategoria,
      onCategoriaChange,
      ordenCantidad,
      onOrdenCantidadChange,
      onNuevoProducto,
      onRegistrarMovimiento,
    }) =>
      React.createElement(
        'section',
        { 'data-testid': 'barra-acciones' },

        React.createElement('input', {
          'data-testid': 'busqueda-input',
          value: '',
          placeholder: 'Buscar',
          onChange: (e) => onBusqueda(e.target.value),
        }),

        React.createElement(
          'select',
          {
            'data-testid': 'categoria-select',
            value: categoria,
            onChange: (e) => onCategoriaChange(e.target.value),
          },
          React.createElement('option', { value: '' }, 'Todas'),
          opcionesCategoria.map((opcion) =>
            React.createElement(
              'option',
              {
                key: opcion.value,
                value: opcion.value,
              },
              opcion.label
            )
          )
        ),

        React.createElement(
          'select',
          {
            'data-testid': 'orden-select',
            value: ordenCantidad,
            onChange: (e) => onOrdenCantidadChange(e.target.value),
          },
          React.createElement('option', { value: '' }, 'Sin orden'),
          React.createElement('option', { value: 'asc' }, 'Menor a mayor'),
          React.createElement('option', { value: 'desc' }, 'Mayor a menor')
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'nuevo-producto-btn',
            onClick: onNuevoProducto,
          },
          'Nuevo producto'
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'movimiento-btn',
            onClick: onRegistrarMovimiento,
          },
          'Registrar movimiento'
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioBarraAcciones/InventarioBarraAcciones.jsx',
  () => ({
    __esModule: true,
    default: ({
      onBusqueda,
      categoria,
      opcionesCategoria,
      onCategoriaChange,
      ordenCantidad,
      onOrdenCantidadChange,
      onNuevoProducto,
      onRegistrarMovimiento,
    }) =>
      React.createElement(
        'section',
        { 'data-testid': 'barra-acciones' },

        React.createElement('input', {
          'data-testid': 'busqueda-input',
          value: '',
          placeholder: 'Buscar',
          onChange: (e) => onBusqueda(e.target.value),
        }),

        React.createElement(
          'select',
          {
            'data-testid': 'categoria-select',
            value: categoria,
            onChange: (e) => onCategoriaChange(e.target.value),
          },
          React.createElement('option', { value: '' }, 'Todas'),
          opcionesCategoria.map((opcion) =>
            React.createElement(
              'option',
              {
                key: opcion.value,
                value: opcion.value,
              },
              opcion.label
            )
          )
        ),

        React.createElement(
          'select',
          {
            'data-testid': 'orden-select',
            value: ordenCantidad,
            onChange: (e) => onOrdenCantidadChange(e.target.value),
          },
          React.createElement('option', { value: '' }, 'Sin orden'),
          React.createElement('option', { value: 'asc' }, 'Menor a mayor'),
          React.createElement('option', { value: 'desc' }, 'Mayor a menor')
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'nuevo-producto-btn',
            onClick: onNuevoProducto,
          },
          'Nuevo producto'
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'movimiento-btn',
            onClick: onRegistrarMovimiento,
          },
          'Registrar movimiento'
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioTabla/InventarioTabla',
  () => ({
    __esModule: true,
    default: ({
      filas,
      paginaActual,
      totalItems,
      itemsPorPagina,
      onCambiarPagina,
      onEditarProducto,
      onBorrarProducto,
      accionesDeshabilitadas,
    }) =>
      React.createElement(
        'section',
        { 'data-testid': 'inventario-tabla' },

        React.createElement('p', { 'data-testid': 'pagina-actual' }, `Página ${paginaActual}`),
        React.createElement('p', { 'data-testid': 'total-items' }, `Total ${totalItems}`),
        React.createElement('p', { 'data-testid': 'items-pagina' }, `Por página ${itemsPorPagina}`),
        React.createElement(
          'p',
          { 'data-testid': 'acciones-deshabilitadas' },
          accionesDeshabilitadas ? 'Acciones deshabilitadas' : 'Acciones habilitadas'
        ),

        filas.map((fila) =>
          React.createElement(
            'article',
            {
              key: fila.id,
              'data-testid': `fila-${fila.id}`,
            },
            React.createElement('p', { 'data-testid': `nombre-${fila.id}` }, fila.nombre),
            React.createElement('p', null, fila.clave),
            React.createElement('p', null, fila.categoria),
            React.createElement('p', { 'data-testid': `cantidad-${fila.id}` }, fila.cantidad),

            React.createElement(
              'button',
              {
                type: 'button',
                'data-testid': `editar-${fila.id}`,
                onClick: () => onEditarProducto(fila.id),
              },
              'Editar'
            ),

            React.createElement(
              'button',
              {
                type: 'button',
                'data-testid': `borrar-${fila.id}`,
                onClick: () => onBorrarProducto(fila.id),
              },
              'Borrar'
            )
          )
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'pagina-previa',
            onClick: () => onCambiarPagina(paginaActual - 1),
          },
          'Anterior'
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'pagina-siguiente',
            onClick: () => onCambiarPagina(paginaActual + 1),
          },
          'Siguiente'
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioTabla/InventarioTabla.jsx',
  () => ({
    __esModule: true,
    default: ({
      filas,
      paginaActual,
      totalItems,
      itemsPorPagina,
      onCambiarPagina,
      onEditarProducto,
      onBorrarProducto,
      accionesDeshabilitadas,
    }) =>
      React.createElement(
        'section',
        { 'data-testid': 'inventario-tabla' },

        React.createElement('p', { 'data-testid': 'pagina-actual' }, `Página ${paginaActual}`),
        React.createElement('p', { 'data-testid': 'total-items' }, `Total ${totalItems}`),
        React.createElement('p', { 'data-testid': 'items-pagina' }, `Por página ${itemsPorPagina}`),
        React.createElement(
          'p',
          { 'data-testid': 'acciones-deshabilitadas' },
          accionesDeshabilitadas ? 'Acciones deshabilitadas' : 'Acciones habilitadas'
        ),

        filas.map((fila) =>
          React.createElement(
            'article',
            {
              key: fila.id,
              'data-testid': `fila-${fila.id}`,
            },
            React.createElement('p', { 'data-testid': `nombre-${fila.id}` }, fila.nombre),
            React.createElement('p', null, fila.clave),
            React.createElement('p', null, fila.categoria),
            React.createElement('p', { 'data-testid': `cantidad-${fila.id}` }, fila.cantidad),

            React.createElement(
              'button',
              {
                type: 'button',
                'data-testid': `editar-${fila.id}`,
                onClick: () => onEditarProducto(fila.id),
              },
              'Editar'
            ),

            React.createElement(
              'button',
              {
                type: 'button',
                'data-testid': `borrar-${fila.id}`,
                onClick: () => onBorrarProducto(fila.id),
              },
              'Borrar'
            )
          )
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'pagina-previa',
            onClick: () => onCambiarPagina(paginaActual - 1),
          },
          'Anterior'
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'pagina-siguiente',
            onClick: () => onCambiarPagina(paginaActual + 1),
          },
          'Siguiente'
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioNuevoProductoModal/InventarioNuevoProductoModal',
  () => ({
    __esModule: true,
    default: ({ open, onClose, onExito, itemsInventario }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-nuevo-producto' },
        React.createElement('p', null, `Items ${itemsInventario.length}`),
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
  '../client/src/components/layout/inventario/InventarioNuevoProductoModal/InventarioNuevoProductoModal.jsx',
  () => ({
    __esModule: true,
    default: ({ open, onClose, onExito, itemsInventario }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-nuevo-producto' },
        React.createElement('p', null, `Items ${itemsInventario.length}`),
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
  '../client/src/components/layout/inventario/InventarioMovimientoModal/InventarioMovimientoModal',
  () => ({
    __esModule: true,
    default: ({ open, onClose, onExito, items, loading, loadError }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-movimiento' },
        React.createElement('p', null, `Items ${items.length}`),
        React.createElement('p', null, loading ? 'Cargando modal' : 'Modal listo'),
        React.createElement('p', null, loadError || 'Sin error'),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'cerrar-modal-movimiento',
            onClick: onClose,
          },
          'Cerrar'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'exito-modal-movimiento',
            onClick: onExito,
          },
          'Éxito'
        )
      );
    },
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioMovimientoModal/InventarioMovimientoModal.jsx',
  () => ({
    __esModule: true,
    default: ({ open, onClose, onExito, items, loading, loadError }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-movimiento' },
        React.createElement('p', null, `Items ${items.length}`),
        React.createElement('p', null, loading ? 'Cargando modal' : 'Modal listo'),
        React.createElement('p', null, loadError || 'Sin error'),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'cerrar-modal-movimiento',
            onClick: onClose,
          },
          'Cerrar'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'exito-modal-movimiento',
            onClick: onExito,
          },
          'Éxito'
        )
      );
    },
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioEditarProductoModal/InventarioEditarProductoModal',
  () => ({
    __esModule: true,
    default: ({ open, producto, onClose, onExito }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-editar-producto' },
        React.createElement('p', null, producto?.NOMBRE || 'Sin producto'),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'cerrar-modal-editar',
            onClick: onClose,
          },
          'Cerrar'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'exito-modal-editar',
            onClick: onExito,
          },
          'Éxito'
        )
      );
    },
  })
);

jest.mock(
  '../client/src/components/layout/inventario/InventarioEditarProductoModal/InventarioEditarProductoModal.jsx',
  () => ({
    __esModule: true,
    default: ({ open, producto, onClose, onExito }) => {
      if (!open) return null;

      return React.createElement(
        'section',
        { 'data-testid': 'modal-editar-producto' },
        React.createElement('p', null, producto?.NOMBRE || 'Sin producto'),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'cerrar-modal-editar',
            onClick: onClose,
          },
          'Cerrar'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'exito-modal-editar',
            onClick: onExito,
          },
          'Éxito'
        )
      );
    },
  })
);

jest.mock('../client/src/pages/styles/Inventario.css', () => ({
  __esModule: true,
  default: {},
}));

const InventarioModule = await import('../client/src/pages/inventario/Inventario.jsx');

const Inventario = InventarioModule.default?.default || InventarioModule.default || InventarioModule;

let container;
let root;

const mockFetchInventario = jest.fn();

const inventarioItems = [
  {
    ID_INVENTARIO: 1,
    CLAVE: 'AGU-001',
    NOMBRE: 'Aguja',
    ID_CATEGORIA: 1,
    CATEGORIA: 'Material médico',
    CANTIDAD: '10 piezas',
  },
  {
    ID_INVENTARIO: 2,
    CLAVE: 'GUA-001',
    NOMBRE: 'Guantes',
    ID_CATEGORIA: 2,
    CATEGORIA: 'Protección',
    CANTIDAD: '2 cajas',
  },
  {
    ID_INVENTARIO: 3,
    CLAVE: 'GAS-001',
    NOMBRE: 'Gasas',
    ID_CATEGORIA: 1,
    CATEGORIA: 'Material médico',
    CANTIDAD: '30 paquetes',
  },
  {
    ID_INVENTARIO: 4,
    CLAVE: 'JER-001',
    NOMBRE: 'Jeringa',
    ID_CATEGORIA: 1,
    CATEGORIA: 'Material médico',
    CANTIDAD: '4 piezas',
  },
  {
    ID_INVENTARIO: 5,
    CLAVE: 'VEN-001',
    NOMBRE: 'Vendas',
    ID_CATEGORIA: 3,
    CATEGORIA: 'Curación',
    CANTIDAD: '15 rollos',
  },
  {
    ID_INVENTARIO: 6,
    CLAVE: 'SON-001',
    NOMBRE: 'Sonda',
    ID_CATEGORIA: 2,
    CATEGORIA: 'Protección',
    CANTIDAD: '1 pieza',
  },
];

function setUseInventarioState(overrides = {}) {
  mockUseInventario.mockReturnValue({
    items: inventarioItems,
    loading: false,
    error: '',
    fetchInventario: mockFetchInventario,
    ...overrides,
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
    root.render(React.createElement(Inventario));
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

function getVisibleProductNames() {
  return Array.from(container.querySelectorAll('[data-testid^="nombre-"]')).map((element) =>
    element.textContent.trim()
  );
}

describe('Inventario', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    window.confirm.mockReset();
    window.alert.mockReset();

    mockGetInventario.mockResolvedValue(inventarioItems);
    mockDeleteProductoInventario.mockResolvedValue({});
    setUseInventarioState();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });


  test('renderiza encabezado, barra de acciones y tabla cuando no está cargando ni hay error', async () => {
    await mount();

    expect(container.textContent).toContain('Inventario General');
    expect(container.textContent).toContain('Gestión de productos e insumos médicos.');
    expect(container.querySelector('[data-testid="barra-acciones"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="inventario-tabla"]')).toBeTruthy();
  });

  test('muestra estado de carga y no muestra tabla cuando loading es true', async () => {
    setUseInventarioState({
      loading: true,
    });

    await mount();

    expect(container.textContent).toContain('Cargando inventario');
    expect(container.querySelector('[data-testid="inventario-tabla"]')).toBeFalsy();
  });

  test('muestra mensaje de error y no muestra tabla cuando existe error', async () => {
    setUseInventarioState({
      loading: false,
      error: 'Error al cargar inventario',
    });

    await mount();

    expect(container.textContent).toContain('Error al cargar inventario');
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="inventario-tabla"]')).toBeFalsy();
  });

  test('muestra solo 5 productos por página', async () => {
    await mount();

    expect(getVisibleProductNames()).toEqual([
      'Aguja',
      'Guantes',
      'Gasas',
      'Jeringa',
      'Vendas',
    ]);

    expect(container.textContent).toContain('Total 6');
    expect(container.textContent).toContain('Por página 5');
  });

  test('permite cambiar a la siguiente página', async () => {
    await mount();

    await clickByTestId('pagina-siguiente');

    expect(container.textContent).toContain('Página 2');
    expect(getVisibleProductNames()).toEqual(['Sonda']);
  });

  test('no permite bajar de la página 1', async () => {
    await mount();

    await clickByTestId('pagina-previa');

    expect(container.textContent).toContain('Página 1');
  });

  test('filtra productos por texto de búsqueda y reinicia a página 1', async () => {
    await mount();

    await clickByTestId('pagina-siguiente');
    expect(container.textContent).toContain('Página 2');

    await changeByTestId('busqueda-input', 'aguja');

    expect(container.textContent).toContain('Página 1');
    expect(getVisibleProductNames()).toEqual(['Aguja']);
  });

  test('filtra productos por categoría', async () => {
    await mount();

    await changeByTestId('categoria-select', '2');

    expect(getVisibleProductNames()).toEqual(['Guantes', 'Sonda']);
    expect(container.textContent).toContain('Total 2');
  });

  test('ordena productos por cantidad ascendente', async () => {
    await mount();

    await changeByTestId('orden-select', 'asc');

    expect(getVisibleProductNames()).toEqual([
      'Sonda',
      'Guantes',
      'Jeringa',
      'Aguja',
      'Vendas',
    ]);
  });

  test('ordena productos por cantidad descendente', async () => {
    await mount();

    await changeByTestId('orden-select', 'desc');

    expect(getVisibleProductNames()).toEqual([
      'Gasas',
      'Vendas',
      'Aguja',
      'Jeringa',
      'Guantes',
    ]);
  });

  test('abre y cierra el modal de nuevo producto', async () => {
    await mount();

    expect(container.querySelector('[data-testid="modal-nuevo-producto"]')).toBeFalsy();

    await clickByTestId('nuevo-producto-btn');

    expect(container.querySelector('[data-testid="modal-nuevo-producto"]')).toBeTruthy();

    await clickByTestId('cerrar-modal-nuevo');

    expect(container.querySelector('[data-testid="modal-nuevo-producto"]')).toBeFalsy();
  });

  test('al guardar nuevo producto vuelve a consultar el inventario', async () => {
    await mount();

    await clickByTestId('nuevo-producto-btn');
    await clickByTestId('exito-modal-nuevo');

    expect(mockFetchInventario).toHaveBeenCalledTimes(1);
  });

  test('abre y cierra el modal de movimiento', async () => {
    await mount();

    expect(container.querySelector('[data-testid="modal-movimiento"]')).toBeFalsy();

    await clickByTestId('movimiento-btn');

    expect(container.querySelector('[data-testid="modal-movimiento"]')).toBeTruthy();
    expect(container.textContent).toContain('Items 6');

    await clickByTestId('cerrar-modal-movimiento');

    expect(container.querySelector('[data-testid="modal-movimiento"]')).toBeFalsy();
  });

  test('al guardar movimiento vuelve a consultar el inventario', async () => {
    await mount();

    await clickByTestId('movimiento-btn');
    await clickByTestId('exito-modal-movimiento');

    expect(mockFetchInventario).toHaveBeenCalledTimes(1);
  });

  test('abre modal de edición con el producto seleccionado', async () => {
    await mount();

    await clickByTestId('editar-2');

    expect(container.querySelector('[data-testid="modal-editar-producto"]')).toBeTruthy();
    expect(container.textContent).toContain('Guantes');
  });

  test('cierra modal de edición', async () => {
    await mount();

    await clickByTestId('editar-2');

    expect(container.querySelector('[data-testid="modal-editar-producto"]')).toBeTruthy();

    await clickByTestId('cerrar-modal-editar');

    expect(container.querySelector('[data-testid="modal-editar-producto"]')).toBeFalsy();
  });

  test('al guardar edición vuelve a consultar el inventario', async () => {
    await mount();

    await clickByTestId('editar-2');
    await clickByTestId('exito-modal-editar');

    expect(mockFetchInventario).toHaveBeenCalledTimes(1);
  });

  test('no elimina producto si el usuario cancela confirmación', async () => {
    window.confirm.mockReturnValue(false);

    await mount();

    await clickByTestId('borrar-2');

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteProductoInventario).not.toHaveBeenCalled();
    expect(mockFetchInventario).not.toHaveBeenCalled();
  });

  test('elimina producto si el usuario confirma y recarga inventario', async () => {
    window.confirm.mockReturnValue(true);
    mockDeleteProductoInventario.mockResolvedValue({});

    await mount();

    await clickByTestId('borrar-2');

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Eliminar «Guantes» del inventario?\n\nEl producto se desactivará y dejará de aparecer en el listado.'
    );

    expect(mockDeleteProductoInventario).toHaveBeenCalledWith(2);
    expect(mockFetchInventario).toHaveBeenCalledTimes(1);
  });

  test('muestra alert si falla la eliminación del producto', async () => {
    window.confirm.mockReturnValue(true);
    mockDeleteProductoInventario.mockRejectedValue(new Error('No se pudo eliminar el producto.'));

    await mount();

    await clickByTestId('borrar-2');

    expect(mockDeleteProductoInventario).toHaveBeenCalledWith(2);
    expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar el producto.');
  });

  test('si cambia filtro de búsqueda después de ordenar, conserva el filtro correcto', async () => {
    await mount();

    await changeByTestId('orden-select', 'desc');
    await changeByTestId('busqueda-input', 'gas');

    expect(getVisibleProductNames()).toEqual(['Gasas']);
    expect(container.textContent).toContain('Total 1');
  });
});