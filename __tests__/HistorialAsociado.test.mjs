/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const HistorialAsociadoModule = await import(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/HistorialAsociado.jsx'
);
const HistorialAsociado =
  HistorialAsociadoModule.default?.default ||
  HistorialAsociadoModule.default ||
  HistorialAsociadoModule;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const beneficiarioMock = {
  id_beneficiario: 42,
  tipo_espina: [{ nombre: 'Espina bífida' }, { nombre: 'Mielomeningocele' }],
  identificadores: { estado_nacimiento: 'Nuevo León' },
  datos_medicos: { tipo_sanguineo: 'O+', valvula: true, hospital: 'Hospital Central' },
};

const ultimosEstudiosMock = {
  gralOrina: '2025-01-15',
  urocultivo: '2025-02-20',
  ecoRenal: '2025-03-10',
  uroTac: '2025-04-05',
  estUrodinamico: '2025-05-01',
  tacCerebro: '2025-06-01',
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container;
let root;
let consoleErrorSpy;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  jest.clearAllMocks();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  localStorage.setItem('token', 'test-token');

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true, data: ultimosEstudiosMock }),
    })
  );
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  localStorage.clear();
  consoleErrorSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function mount(props) {
  await act(async () => {
    root.render(React.createElement(HistorialAsociado, props));
  });
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HistorialAsociado', () => {
  describe('renderizado con datos del beneficiario', () => {
    test('muestra el lugar de nacimiento', async () => {
      await mount({ beneficiario: beneficiarioMock });

      expect(container.textContent).toContain('Nuevo León');
    });

    test('muestra el hospital', async () => {
      await mount({ beneficiario: beneficiarioMock });

      expect(container.textContent).toContain('Hospital Central');
    });

    test('muestra el tipo sanguíneo', async () => {
      await mount({ beneficiario: beneficiarioMock });

      expect(container.textContent).toContain('O+');
    });

    test('muestra el padecimiento concatenando los tipos de espina con ·', async () => {
      await mount({ beneficiario: beneficiarioMock });

      expect(container.textContent).toContain('Espina bífida · Mielomeningocele');
    });

    test('muestra "—" cuando tipo_espina está vacío', async () => {
      const ben = { ...beneficiarioMock, tipo_espina: [] };

      await mount({ beneficiario: ben });

      expect(container.textContent).not.toContain('·');
    });

    test('no lanza error cuando beneficiario es undefined', async () => {
      await expect(mount({ beneficiario: undefined })).resolves.not.toThrow();
    });
  });

  describe('campo válvula', () => {
    test('muestra "Sí" cuando válvula es true', async () => {
      await mount({ beneficiario: beneficiarioMock });

      expect(container.textContent).toContain('Sí');
    });

    test('muestra "No" cuando válvula es false', async () => {
      const ben = {
        ...beneficiarioMock,
        datos_medicos: { ...beneficiarioMock.datos_medicos, valvula: false },
      };

      await mount({ beneficiario: ben });

      expect(container.textContent).toContain('No');
    });

    test('muestra "—" cuando válvula es undefined', async () => {
      const ben = {
        ...beneficiarioMock,
        datos_medicos: { ...beneficiarioMock.datos_medicos, valvula: undefined },
      };

      await mount({ beneficiario: ben });

      // "—" is the fieldValue for válvula when it's undefined
      expect(container.textContent).toContain('—');
    });
  });

  describe('fetch de últimos estudios', () => {
    test('no hace fetch cuando idBeneficiario está indefinido', async () => {
      const ben = { tipo_espina: [], identificadores: {}, datos_medicos: {} };

      await mount({ beneficiario: ben });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('llama a fetch con la URL correcta al montar', async () => {
      await mount({ beneficiario: beneficiarioMock });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/registro_servicios/ultimos-estudios/42',
        expect.any(Object)
      );
    });

    test('incluye el token de autorización en la cabecera', async () => {
      await mount({ beneficiario: beneficiarioMock });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
    });

    test('muestra "Cargando..." mientras la petición está en curso', async () => {
      let resolveJson;
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => new Promise((res) => { resolveJson = res; }),
        })
      );

      await act(async () => {
        root.render(React.createElement(HistorialAsociado, { beneficiario: beneficiarioMock }));
        await Promise.resolve(); // run effect → setLoadingEstudios(true) + fetch() call
        await Promise.resolve(); // fetch() resolves → awaiting json() (still pending)
      });

      expect(container.textContent).toContain('Cargando...');

      // Cleanup: resolve pending promise
      await act(async () => {
        resolveJson({ ok: true, data: {} });
        await Promise.resolve();
        await Promise.resolve();
      });
    });

    test('muestra las fechas de los estudios tras una respuesta exitosa', async () => {
      await mount({ beneficiario: beneficiarioMock });

      const gralOrinaFmt = new Date('2025-01-15').toLocaleDateString('es-MX');
      const ecoRenalFmt = new Date('2025-03-10').toLocaleDateString('es-MX');

      expect(container.textContent).toContain(gralOrinaFmt);
      expect(container.textContent).toContain(ecoRenalFmt);
    });

    test('muestra "—" para fechas null en los estudios', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ ok: true, data: { gralOrina: null, urocultivo: null } }),
        })
      );

      await mount({ beneficiario: beneficiarioMock });

      expect(container.textContent).toContain('—');
    });

    test('maneja response.ok = false sin crashear y registra el error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ ok: false, message: 'Not found' }),
        })
      );

      await mount({ beneficiario: beneficiarioMock });

      expect(container.querySelector('div')).not.toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('maneja result.ok = false sin crashear y registra el error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: false, message: 'Sin datos' }),
        })
      );

      await mount({ beneficiario: beneficiarioMock });

      expect(container.querySelector('div')).not.toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('maneja rechazo de fetch sin crashear y registra el error', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      await mount({ beneficiario: beneficiarioMock });

      expect(container.querySelector('div')).not.toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('resolución de idBeneficiario', () => {
    test('hace fetch usando idBeneficiario (camelCase) cuando id_beneficiario falta', async () => {
      const ben = { ...beneficiarioMock, id_beneficiario: undefined, idBeneficiario: 99 };

      await mount({ beneficiario: ben });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/99'),
        expect.any(Object)
      );
    });

    test('hace fetch usando ID_BENEFICIARIO (mayúsculas) como último fallback', async () => {
      const ben = {
        ...beneficiarioMock,
        id_beneficiario: undefined,
        idBeneficiario: undefined,
        ID_BENEFICIARIO: 77,
      };

      await mount({ beneficiario: ben });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/77'),
        expect.any(Object)
      );
    });
  });

  describe('control urológico', () => {
    test('el radio "No" está marcado por defecto', async () => {
      await mount({ beneficiario: beneficiarioMock });

      const radios = container.querySelectorAll('input[type="radio"]');
      const siRadio = radios[0];
      const noRadio = radios[1];

      expect(siRadio.checked).toBe(false);
      expect(noRadio.checked).toBe(true);
    });

    test('al hacer clic en "Si", ese radio queda marcado', async () => {
      await mount({ beneficiario: beneficiarioMock });

      const siRadio = container.querySelectorAll('input[type="radio"]')[0];

      await act(async () => {
        siRadio.click();
      });

      expect(siRadio.checked).toBe(true);
    });
  });
});
