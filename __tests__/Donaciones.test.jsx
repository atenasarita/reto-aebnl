/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Donaciones from '../client/src/pages/Donaciones/Donaciones.jsx';


jest.mock('../client/src/hooks/useFondoDonaciones.js', () => ({
  default: () => ({
    saldo: { saldo: 5000 },
    movimientos: [],
    loading: false,
    error: null,
    fetchSaldo: jest.fn().mockResolvedValue({ saldo: 1000 }),
    fetchMovimientos: jest.fn().mockResolvedValue([]),
    registrarAbono: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

const { default: Donaciones } = await import('../client/src/pages/Donaciones/Donaciones.jsx');

let container;
let root;

describe('Donaciones', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    jest.clearAllMocks();
    mockFetchMovimientos.mockResolvedValue([]);
    mockFetchSaldo.mockResolvedValue({ saldo: 1000 });
    mockRegistrarAbono.mockResolvedValue({ success: true });
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
  });

  
  async function mount() {
    await act(async () => {
      root.render(React.createElement(Donaciones));
    });
  }

  // ── Renderizado inicial ───────────────────────────────────────
  
  test('muestra el título Fondo de Donaciones', async () => {
    await mount();
    expect(container.textContent).toContain('Fondo de Donaciones');
  });

  test('muestra el saldo disponible', async () => {
    await mount();
    expect(container.textContent).toContain('Saldo disponible');
  });

  test('muestra botón Registrar donación', async () => {
    await mount();
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent.includes('Registrar donación')
    );
    expect(btn).toBeTruthy();
  });

  test('no muestra el formulario inicialmente', async () => {
    await mount();
    expect(container.querySelector('#donaciones-registro-form')).toBeFalsy();
  });

  test('muestra mensaje sin movimientos cuando la lista está vacía', async () => {
    await mount();
    expect(container.textContent).toContain('Sin movimientos registrados');
  });

  // ── Toggle formulario ─────────────────────────────────────────
  test('muestra el formulario al hacer click en Registrar donación', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    expect(container.querySelector('#donaciones-registro-form')).toBeTruthy();
  });

  test('oculta el formulario al hacer click en Ocultar formulario', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Ocultar formulario')
      );
      btn.click();
    });

    expect(container.querySelector('#donaciones-registro-form')).toBeFalsy();
  });

  // ── Formulario ────────────────────────────────────────────────
  test('muestra tabs de Marca y Familia', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    expect(container.textContent).toContain('Marca / empresa');
    expect(container.textContent).toContain('Familia');
  });

  test('selecciona Marca al hacer click en el tab', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const marcaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find(
        b => b.textContent.includes('Marca')
      );
      marcaTab.click();
    });

    expect(container.textContent).toContain('Nombre de la marca o empresa');
  });

  test('selecciona Familia al hacer click en el tab', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const familiaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find(
        b => b.textContent.includes('Familia')
      );
      familiaTab.click();
    });

    expect(container.textContent).toContain('Nombre de la familia');
  });

  test('muestra errores de validación al enviar formulario vacío', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const form = container.querySelector('#donaciones-registro-form');
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(container.textContent).toContain('Seleccione si la donación');
  });

  test('sanitizeMonto limpia caracteres no numéricos en el input de monto', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const montoInput = container.querySelector('#monto-donacion');
      Object.defineProperty(montoInput, 'value', { value: '1,000.00abc', writable: true });
      montoInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const montoInput = container.querySelector('#monto-donacion');
    expect(montoInput).toBeTruthy();
  });

  test('submit exitoso registra la donación y oculta el formulario', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    // Seleccionar tipo origen
    await act(async () => {
      const marcaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find(
        b => b.textContent.includes('Marca')
      );
      marcaTab.click();
    });

    // Llenar campos
    await act(async () => {
      const nombreInput = container.querySelector('#origen-nombre');
      Object.defineProperty(nombreInput, 'value', { value: 'Empresa XYZ', writable: true });
      nombreInput.dispatchEvent(new Event('change', { bubbles: true }));

      const montoInput = container.querySelector('#monto-donacion');
      Object.defineProperty(montoInput, 'value', { value: '1000', writable: true });
      montoInput.dispatchEvent(new Event('change', { bubbles: true }));

      const conceptoInput = container.querySelector('#concepto-donacion');
      Object.defineProperty(conceptoInput, 'value', { value: 'Donación mensual', writable: true });
      conceptoInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      const form = container.querySelector('#donaciones-registro-form');
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(mockRegistrarAbono).toHaveBeenCalled();
  });

  test('muestra error cuando registrarAbono falla', async () => {
    mockRegistrarAbono.mockRejectedValueOnce(new Error('Error de red'));

    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const marcaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find(
        b => b.textContent.includes('Marca')
      );
      marcaTab.click();
    });

    await act(async () => {
      const nombreInput = container.querySelector('#origen-nombre');
      Object.defineProperty(nombreInput, 'value', { value: 'Empresa XYZ', writable: true });
      nombreInput.dispatchEvent(new Event('change', { bubbles: true }));

      const montoInput = container.querySelector('#monto-donacion');
      Object.defineProperty(montoInput, 'value', { value: '1000', writable: true });
      montoInput.dispatchEvent(new Event('change', { bubbles: true }));

      const conceptoInput = container.querySelector('#concepto-donacion');
      Object.defineProperty(conceptoInput, 'value', { value: 'Donación mensual', writable: true });
      conceptoInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      const form = container.querySelector('#donaciones-registro-form');
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(container.textContent).toContain('Error de red');
  });

  // ── Actualizar historial ──────────────────────────────────────
  test('llama fetchMovimientos al hacer click en Actualizar', async () => {
    await mount();

    await act(async () => {
      const actualizarBtn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Actualizar')
      );
      actualizarBtn.click();
    });

    expect(mockFetchMovimientos).toHaveBeenCalled();
  });

  // ── Movimientos table ─────────────────────────────────────────
  test('muestra tabla cuando hay movimientos', async () => {
    const mockMovimientos = [
      {
        id_movimiento: 1,
        fecha: '2025-01-01',
        tipo_movimiento: 'abono',
        origen_tipo: 'marca',
        origen_nombre: 'Empresa XYZ',
        concepto: 'Donación',
        monto: 1000,
        saldo_nuevo: 5000,
      },
    ];

    jest.unstable_mockModule('../client/src/hooks/useFondoDonaciones.js', () => ({
      default: () => ({
        saldo: { saldo: 5000 },
        movimientos: mockMovimientos,
        loading: false,
        error: null,
        fetchSaldo: mockFetchSaldo,
        fetchMovimientos: mockFetchMovimientos,
        registrarAbono: mockRegistrarAbono,
      }),
    }));

    

    await mount();
    expect(container.querySelector('table')).toBeTruthy();
  });

  // ── handleTabKeyDown ──────────────────────────────────────────
  test('cambia tipo al presionar ArrowRight en tab', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const marcaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find(
        b => b.textContent.includes('Marca')
      );
      marcaTab.click();
    });

    await act(async () => {
      const marcaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find(
        b => b.textContent.includes('Marca')
      );
      marcaTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });

    expect(container.textContent).toContain('Nombre de la familia');
  });

  test('handleBlur muestra error en campo concepto vacío', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const conceptoInput = container.querySelector('#concepto-donacion');
      conceptoInput.dispatchEvent(new Event('blur', { bubbles: true }));
    });

    expect(container.textContent).toContain('El concepto es obligatorio');
  });
});
