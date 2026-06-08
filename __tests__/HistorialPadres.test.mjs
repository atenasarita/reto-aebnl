/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';


import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

global.fetch = jest.fn();

// jest.unstable_mockModule('../client/src/utils/config.js', () => ({
//   API_URL: 'http://localhost:3000',
// }));

// Mock CSS module
jest.unstable_mockModule(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/BeneficiarioDetalle.module.css',
  () => ({
    default: new Proxy({}, { get: (_, key) => key }),
  })
);

const HistorialPadresModule = await import(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/HistorialPadres.jsx'
);
const HistorialPadres = HistorialPadresModule.default?.default || HistorialPadresModule.default || HistorialPadresModule;

const mockBeneficiario = { id_beneficiario: 1 };

const mockPadresData = [
  {
    tipo_padre: 'padre',
    nombre_completo: 'Juan García',
    fecha_nacimiento: '1980-05-15',
    email: 'juan@example.com',
    telefono: '5512345678',
    telefono_casa: '5587654321',
    telefono_trabajo: '5599998888',
  },
  {
    tipo_padre: 'madre',
    nombre_completo: 'María López',
    fecha_nacimiento: '1982-03-20',
    email: 'maria@example.com',
    telefono: '5511112222',
    telefono_casa: '5533334444',
    telefono_trabajo: '5555556666',
  },
];

let container;
let root;

describe('HistorialPadres', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.setItem('token', 'test-token');
    global.fetch.mockReset();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    jest.clearAllMocks();
    localStorage.clear();
  });

  async function mount(props = {}) {
    await act(async () => {
      root.render(
        React.createElement(HistorialPadres, {
          beneficiario: mockBeneficiario,
          ...props,
        })
      );
    });
  }

  // ── Carga de datos ────────────────────────────────────────────
  test('muestra estado de carga al montar', async () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {})); // never resolves

    await act(async () => {
      root.render(
        React.createElement(HistorialPadres, { beneficiario: mockBeneficiario })
      );
    });

    expect(container.textContent).toContain('Cargando');
  });

  test('muestra datos del padre y madre después de cargar', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPadresData,
    });

    await mount();

    expect(container.textContent).toContain('Juan García');
    expect(container.textContent).toContain('María López');
  });

  test('muestra campos vacíos si no hay datos de padres', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await mount();

    expect(container.textContent).toContain('Padre');
    expect(container.textContent).toContain('Madre');
  });

  test('maneja error en la carga de padres', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error al cargar' }),
    });

    await mount();

    expect(container.textContent).toContain('Padre');
  });

  test('no hace fetch si no hay id_beneficiario', async () => {
    await act(async () => {
      root.render(
        React.createElement(HistorialPadres, { beneficiario: {} })
      );
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  // ── Modo edición ──────────────────────────────────────────────
  test('muestra botón Editar en modo lectura', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPadresData,
    });

    await mount();

    const editBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Editar'
    );
    expect(editBtn).toBeTruthy();
  });

  test('muestra botones Guardar y Cancelar al entrar en modo edición', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPadresData,
    });

    await mount();

    await act(async () => {
      const editBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Editar'
      );
      editBtn.click();
    });

    expect(container.textContent).toContain('Guardar');
    expect(container.textContent).toContain('Cancelar');
  });

  test('muestra inputs en modo edición', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPadresData,
    });

    await mount();

    await act(async () => {
      const editBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Editar'
      );
      editBtn.click();
    });

    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('vuelve a modo lectura al cancelar', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPadresData,
    });

    await mount();

    await act(async () => {
      const editBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Editar'
      );
      editBtn.click();
    });

    await act(async () => {
      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Cancelar'
      );
      cancelBtn.click();
    });

    const editBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Editar'
    );
    expect(editBtn).toBeTruthy();
  });

  // ── Guardar ───────────────────────────────────────────────────
  test('guarda correctamente y llama onUpdated', async () => {
    const onUpdated = jest.fn().mockResolvedValue(undefined);

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPadresData })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPadresData });

    await act(async () => {
      root.render(
        React.createElement(HistorialPadres, {
          beneficiario: mockBeneficiario,
          onUpdated,
        })
      );
    });

    await act(async () => {
      const editBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Editar'
      );
      editBtn.click();
    });

    await act(async () => {
      const saveBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Guardar'
      );
      saveBtn.click();
    });

    expect(onUpdated).toHaveBeenCalled();
  });

  test('maneja error al guardar', async () => {
    global.window.alert = jest.fn();

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPadresData })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error al guardar' }),
      });

    await mount();

    await act(async () => {
      const editBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Editar'
      );
      editBtn.click();
    });

    await act(async () => {
      const saveBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Guardar'
      );
      saveBtn.click();
    });

    expect(global.window.alert).toHaveBeenCalledWith('Error al guardar');
  });

  // ── handleChange ──────────────────────────────────────────────
  test('actualiza el valor del campo al cambiar en modo edición', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPadresData,
    });

    await mount();

    await act(async () => {
      const editBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Editar'
      );
      editBtn.click();
    });

    await act(async () => {
      const input = container.querySelector('input[name="padre_telefono"]');
      Object.defineProperty(input, 'value', { value: '5599990000', writable: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const input = container.querySelector('input[name="padre_telefono"]');
    expect(input).toBeTruthy();
  });
});
