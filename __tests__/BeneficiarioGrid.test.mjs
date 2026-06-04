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

const mockDownloadBeneficiarioPdf = jest.fn();

jest.mock('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/pdfFormatMembresia', () => ({
  __esModule: true,
  downloadBeneficiarioPdf: (...args) => mockDownloadBeneficiarioPdf(...args),
}));

jest.mock('../client/src/utils/pdfFormatMembresia.js', () => ({
  __esModule: true,
  downloadBeneficiarioPdf: (...args) => mockDownloadBeneficiarioPdf(...args),
}));

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioGrid/BeneficiarioGrid.module.css',
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

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioCard/BeneficiarioCard',
  () => ({
    __esModule: true,
    default: ({ beneficiario, onView, onEdit, onCard, onDownloadPdf }) =>
      React.createElement(
        'article',
        { 'data-testid': `beneficiario-card-${beneficiario.id_beneficiario}` },
        React.createElement('p', null, beneficiario.nombre),
        React.createElement('p', null, beneficiario.folio),
        React.createElement('p', null, beneficiario.diagnostico),
        React.createElement('p', null, beneficiario.estatus),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `view-${beneficiario.id_beneficiario}`,
            onClick: onView,
          },
          'Ver'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `edit-${beneficiario.id_beneficiario}`,
            onClick: onEdit,
          },
          'Editar'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `card-${beneficiario.id_beneficiario}`,
            onClick: onCard,
          },
          'Credencial'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `pdf-${beneficiario.id_beneficiario}`,
            onClick: onDownloadPdf,
          },
          'PDF'
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioCard/BeneficiarioCard.jsx',
  () => ({
    __esModule: true,
    default: ({ beneficiario, onView, onEdit, onCard, onDownloadPdf }) =>
      React.createElement(
        'article',
        { 'data-testid': `beneficiario-card-${beneficiario.id_beneficiario}` },
        React.createElement('p', null, beneficiario.nombre),
        React.createElement('p', null, beneficiario.folio),
        React.createElement('p', null, beneficiario.diagnostico),
        React.createElement('p', null, beneficiario.estatus),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `view-${beneficiario.id_beneficiario}`,
            onClick: onView,
          },
          'Ver'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `edit-${beneficiario.id_beneficiario}`,
            onClick: onEdit,
          },
          'Editar'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `card-${beneficiario.id_beneficiario}`,
            onClick: onCard,
          },
          'Credencial'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': `pdf-${beneficiario.id_beneficiario}`,
            onClick: onDownloadPdf,
          },
          'PDF'
        )
      ),
  })
);

jest.mock('../client/src/components/ui/Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalItems, itemsPerPage, onPageChange }) =>
    React.createElement(
      'nav',
      { 'data-testid': 'pagination' },
      React.createElement('span', null, `Página ${currentPage}`),
      React.createElement('span', null, `Total ${totalItems}`),
      React.createElement('span', null, `Por página ${itemsPerPage}`),
      React.createElement(
        'button',
        {
          type: 'button',
          'data-testid': 'go-page-2',
          onClick: () => onPageChange(2),
        },
        'Página 2'
      )
    ),
}));

jest.mock('../client/src/components/ui/Pagination.jsx', () => ({
  __esModule: true,
  default: ({ currentPage, totalItems, itemsPerPage, onPageChange }) =>
    React.createElement(
      'nav',
      { 'data-testid': 'pagination' },
      React.createElement('span', null, `Página ${currentPage}`),
      React.createElement('span', null, `Total ${totalItems}`),
      React.createElement('span', null, `Por página ${itemsPerPage}`),
      React.createElement(
        'button',
        {
          type: 'button',
          'data-testid': 'go-page-2',
          onClick: () => onPageChange(2),
        },
        'Página 2'
      )
    ),
}));

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/BeneficiarioModal',
  () => ({
    __esModule: true,
    default: ({ beneficiario, onClose, startInEditMode, onUpdated }) =>
      React.createElement(
        'section',
        { 'data-testid': 'beneficiario-modal' },
        React.createElement('p', null, beneficiario.identificadores?.nombres || beneficiario.folio),
        React.createElement('p', { 'data-testid': 'modal-mode' }, startInEditMode ? 'Modo edición' : 'Modo lectura'),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'modal-close',
            onClick: onClose,
          },
          'Cerrar modal'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'modal-updated',
            onClick: onUpdated,
          },
          'Actualizar'
        )
      ),
  })
);

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/BeneficiarioModal.jsx',
  () => ({
    __esModule: true,
    default: ({ beneficiario, onClose, startInEditMode, onUpdated }) =>
      React.createElement(
        'section',
        { 'data-testid': 'beneficiario-modal' },
        React.createElement('p', null, beneficiario.identificadores?.nombres || beneficiario.folio),
        React.createElement('p', { 'data-testid': 'modal-mode' }, startInEditMode ? 'Modo edición' : 'Modo lectura'),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'modal-close',
            onClick: onClose,
          },
          'Cerrar modal'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'modal-updated',
            onClick: onUpdated,
          },
          'Actualizar'
        )
      ),
  })
);

const GridModule = await import(
  '../client/src/components/layout/beneficiarios/BeneficiarioGrid/BenecifiarioGrid.jsx'
);

const BeneficiarioGrid = GridModule.default?.default || GridModule.default || GridModule;

let container;
let root;

const mockOnRefresh = jest.fn();
const mockClearEditQuery = jest.fn();

function makeBeneficiario(id, overrides = {}) {
  return {
    id_beneficiario: id,
    folio: `BEN-${String(id).padStart(3, '0')}`,
    estado: id % 2 === 0 ? 'inactivo' : 'activo',
    dias_para_vencer: id,
    identificadores: {
      nombres: `Nombre${id}`,
      apellido_paterno: `Apellido${id}`,
      apellido_materno: id % 2 === 0 ? '' : `Materno${id}`,
    },
    tipo_espina: [{ nombre: `Diagnóstico ${id}` }],
    ...overrides,
  };
}

const dataBase = [
  makeBeneficiario(1),
  makeBeneficiario(2),
  makeBeneficiario(3, { tipo_espina: [] }),
];

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse() {
  return {
    ok: false,
    json: async () => ({}),
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
      React.createElement(BeneficiarioGrid, {
        data: dataBase,
        loading: false,
        onRefresh: mockOnRefresh,
        clearEditQuery: mockClearEditQuery,
        ...props,
      })
    );
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

describe('BeneficiarioGrid', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.fetch.mockReset();
    global.alert.mockReset();

    localStorage.clear();
    localStorage.setItem('token', 'token-123');

    global.fetch.mockResolvedValue(okResponse(makeBeneficiario(1)));
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

  test('muestra estado de carga cuando loading es true', async () => {
    await mount({
      loading: true,
    });

    expect(container.textContent).toContain('Cargando...');
    expect(container.querySelector('[data-testid="beneficiario-card-1"]')).toBeFalsy();
  });

  test('muestra mensaje vacío cuando no hay beneficiarios', async () => {
    await mount({
      data: [],
      loading: false,
    });

    expect(container.textContent).toContain('No se encontraron beneficiarios.');
    expect(container.querySelector('[data-testid="pagination"]')).toBeFalsy();
  });

  test('renderiza beneficiarios normalizados en cards', async () => {
    await mount();

    expect(container.textContent).toContain('Nombre1 Apellido1 Materno1');
    expect(container.textContent).toContain('BEN-001');
    expect(container.textContent).toContain('Diagnóstico 1');
    expect(container.textContent).toContain('Activo');

    expect(container.textContent).toContain('Nombre2 Apellido2');
    expect(container.textContent).toContain('Inactivo');

    expect(container.textContent).toContain('Sin diagnóstico');
  });

  test('muestra paginación con total e items por página', async () => {
    await mount();

    expect(container.querySelector('[data-testid="pagination"]')).toBeTruthy();
    expect(container.textContent).toContain('Página 1');
    expect(container.textContent).toContain('Total 3');
    expect(container.textContent).toContain('Por página 8');
  });

  test('muestra solo 8 beneficiarios por página y permite cambiar a página 2', async () => {
    const data = Array.from({ length: 10 }, (_, index) => makeBeneficiario(index + 1));

    await mount({
        data,
    });

    expect(container.textContent).toContain('Nombre1 Apellido1 Materno1');
    expect(container.textContent).toContain('Nombre8 Apellido8');
    expect(container.textContent).not.toContain('Nombre9 Apellido9 Materno9');

    await clickByTestId('go-page-2');

    expect(container.textContent).not.toContain('Nombre1 Apellido1 Materno1');
    expect(container.textContent).toContain('Nombre9 Apellido9 Materno9');
    expect(container.textContent).toContain('Nombre10 Apellido10');
    expect(container.textContent).toContain('Página 2');
    });
    
  test('reinicia a página 1 cuando cambia data', async () => {
    const data = Array.from({ length: 10 }, (_, index) => makeBeneficiario(index + 1));

    await mount({
      data,
    });

    await clickByTestId('go-page-2');

    expect(container.textContent).toContain('Página 2');

    await act(async () => {
      root.render(
        React.createElement(BeneficiarioGrid, {
          data: dataBase,
          loading: false,
          onRefresh: mockOnRefresh,
          clearEditQuery: mockClearEditQuery,
        })
      );
    });

    await flushPromises();

    expect(container.textContent).toContain('Página 1');
  });

  test('abre modal en modo lectura al hacer click en Ver', async () => {
    global.fetch.mockResolvedValueOnce(okResponse(makeBeneficiario(1)));

    await mount();

    await clickByTestId('view-1');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios/1',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeTruthy();
    expect(container.textContent).toContain('Modo lectura');
  });

  test('abre modal en modo edición al hacer click en Editar', async () => {
    global.fetch.mockResolvedValueOnce(okResponse(makeBeneficiario(2)));

    await mount();

    await clickByTestId('edit-2');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios/2',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeTruthy();
    expect(container.textContent).toContain('Modo edición');
  });

  test('cierra el modal y limpia modo edición', async () => {
    global.fetch.mockResolvedValueOnce(okResponse(makeBeneficiario(2)));

    await mount();

    await clickByTestId('edit-2');

    expect(container.textContent).toContain('Modo edición');

    await clickByTestId('modal-close');

    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeFalsy();
  });

  test('llama onRefresh desde el modal cuando se actualiza', async () => {
    global.fetch.mockResolvedValueOnce(okResponse(makeBeneficiario(1)));

    await mount();

    await clickByTestId('view-1');

    await clickByTestId('modal-updated');

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  test('abre automáticamente en edición si recibe beneficiarioEditId', async () => {
    global.fetch.mockResolvedValueOnce(okResponse(makeBeneficiario(2)));

    await mount({
      beneficiarioEditId: 2,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios/2',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(mockClearEditQuery).toHaveBeenCalled();
    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeTruthy();
    expect(container.textContent).toContain('Modo edición');
  });

  test('no abre automáticamente en edición si está loading', async () => {
    await mount({
      beneficiarioEditId: 2,
      loading: true,
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockClearEditQuery).not.toHaveBeenCalled();
  });

  test('abre automáticamente el beneficiario creado una sola vez', async () => {
    global.fetch.mockResolvedValueOnce(okResponse(makeBeneficiario(3)));

    await mount({
      beneficiarioCreadoId: 3,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios/3',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeTruthy();
    expect(container.textContent).toContain('Modo lectura');

    global.fetch.mockClear();

    await act(async () => {
      root.render(
        React.createElement(BeneficiarioGrid, {
          data: dataBase,
          loading: false,
          onRefresh: mockOnRefresh,
          clearEditQuery: mockClearEditQuery,
          beneficiarioCreadoId: 3,
        })
      );
    });

    await flushPromises();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('no abre beneficiario creado si no existe en data', async () => {
    await mount({
      beneficiarioCreadoId: 999,
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeFalsy();
  });

  test('muestra alerta si falla abrir detalle', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockResolvedValueOnce(errorResponse());

    await mount();

    await clickByTestId('view-1');

    expect(global.alert).toHaveBeenCalledWith('No se pudo abrir el detalle del beneficiario.');
    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeFalsy();

    consoleSpy.mockRestore();
  });

  test('muestra alerta si falla abrir edición', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockResolvedValueOnce(errorResponse());

    await mount();

    await clickByTestId('edit-1');

    expect(global.alert).toHaveBeenCalledWith('No se pudo abrir la edición del beneficiario.');
    expect(container.querySelector('[data-testid="beneficiario-modal"]')).toBeFalsy();

    consoleSpy.mockRestore();
  });

  test('descarga PDF con beneficiario y padres cuando ambas respuestas son correctas', async () => {
    const beneficiario = makeBeneficiario(1);
    const padres = [
      { nombre: 'Padre 1' },
      { nombre: 'Madre 1' },
    ];

    global.fetch
      .mockResolvedValueOnce(okResponse(beneficiario))
      .mockResolvedValueOnce(okResponse(padres));

    await mount();

    await clickByTestId('pdf-1');

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/api/beneficiarios/1',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/beneficiarios/1/padres',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(mockDownloadBeneficiarioPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        id_beneficiario: 1,
        padres,
      }),
      1
    );
  });

  test('descarga PDF aunque padres falle, si el beneficiario sí se obtuvo', async () => {
    const beneficiario = makeBeneficiario(1);

    global.fetch
      .mockResolvedValueOnce(okResponse(beneficiario))
      .mockResolvedValueOnce(errorResponse());

    await mount();

    await clickByTestId('pdf-1');

    expect(mockDownloadBeneficiarioPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        id_beneficiario: 1,
      }),
      1
    );

    const pdfArg = mockDownloadBeneficiarioPdf.mock.calls[0][0];
    expect(pdfArg.padres).toBeUndefined();
  });

  test('muestra alerta si falla descargar PDF desde beneficiario', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch.mockResolvedValueOnce(errorResponse());

    await mount();

    await clickByTestId('pdf-1');

    expect(global.alert).toHaveBeenCalledWith('Error al descargar el archivo PDF.');
    expect(mockDownloadBeneficiarioPdf).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('botón credencial ejecuta console.log sin romper', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await mount();

    await clickByTestId('card-1');

    expect(consoleSpy).toHaveBeenCalledWith('credencial', 1);

    consoleSpy.mockRestore();
  });
});