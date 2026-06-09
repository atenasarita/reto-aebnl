/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockFetchMovimientos = jest.fn();
const mockFetchSaldo = jest.fn();
const mockFetchDonadores = jest.fn();
const mockRegistrarAbono = jest.fn();
const mockCrearDonador = jest.fn();

let mockMovimientos = [];
let mockDonadores = [
  {
    id_donador: 1,
    nombre: 'Empresa XYZ',
    tipo_origen: 'marca',
    saldo: 5000,
  },
];

const mockUseFondoDonaciones = jest.fn(() => ({
  saldo: { saldo: 5000 },
  donadores: mockDonadores,
  movimientos: mockMovimientos,
  loading: false,
  error: null,
  fetchSaldo: mockFetchSaldo,
  fetchDonadores: mockFetchDonadores,
  fetchMovimientos: mockFetchMovimientos,
  registrarAbono: mockRegistrarAbono,
  crearDonador: mockCrearDonador,
}));

jest.mock('lucide-react', () => ({
  CheckCircle2: () => null,
  RefreshCw: () => null,
}));

jest.mock('../client/src/hooks/useFondoDonaciones', () => ({
  __esModule: true,
  default: mockUseFondoDonaciones,
}));

jest.mock('../client/src/hooks/useFondoDonaciones.js', () => ({
  __esModule: true,
  default: mockUseFondoDonaciones,
}));

jest.mock('../client/src/components/ui/Dropdown', () => ({
  __esModule: true,
  default: ({ options = [], value, onChange }) =>
    React.createElement(
      'select',
      {
        id: 'donador-abono',
        value,
        onChange: (e) => onChange(e.target.value),
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

jest.mock('../client/src/components/fondo/FondoMovimientosDisplay', () => ({
  __esModule: true,
  fmtMontoFondo: (n) => `$${Number(n ?? 0).toFixed(2)}`,
  formatConceptoMovimiento: (m) => m.concepto || m.motivo || '—',
  formatOrigenMovimiento: (m) => m.origen_nombre || m.nombre || '—',
  MontoCell: ({ tipo, monto }) =>
    React.createElement(
      'td',
      { className: `monto-${tipo}` },
      `$${Number(monto ?? 0).toFixed(2)}`
    ),
  SaldoCell: ({ value }) =>
    React.createElement(
      'td',
      { className: 'saldo-cell' },
      `$${Number(value ?? 0).toFixed(2)}`
    ),
}));

const mod = await import('../client/src/pages/Donaciones/Donaciones.jsx');
const Donaciones = mod.default.default ?? mod.default;

let container;
let root;

describe('Donaciones', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    mockMovimientos = [];
    mockDonadores = [
      {
        id_donador: 1,
        nombre: 'Empresa XYZ',
        tipo_origen: 'marca',
        saldo: 5000,
      },
    ];

    mockUseFondoDonaciones.mockImplementation(() => ({
      saldo: { saldo: 5000 },
      donadores: mockDonadores,
      movimientos: mockMovimientos,
      loading: false,
      error: null,
      fetchSaldo: mockFetchSaldo,
      fetchDonadores: mockFetchDonadores,
      fetchMovimientos: mockFetchMovimientos,
      registrarAbono: mockRegistrarAbono,
      crearDonador: mockCrearDonador,
    }));

    mockFetchMovimientos.mockResolvedValue([]);
    mockFetchSaldo.mockResolvedValue({ saldo: 5000 });
    mockFetchDonadores.mockResolvedValue(mockDonadores);
    mockRegistrarAbono.mockResolvedValue({ success: true });
    mockCrearDonador.mockResolvedValue({
      success: true,
      data: { id_donador: 2 },
    });
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });

  async function mount() {
    await act(async () => {
      root.render(React.createElement(Donaciones));
    });
  }

  function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(input),
      'value'
    ).set;

    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  test('muestra el título Fondo de Donaciones', async () => {
    await mount();

    expect(container.textContent).toContain('Fondo de Donaciones');
  });

  test('muestra el saldo total', async () => {
    await mount();

    expect(container.textContent).toContain('Saldo consolidado');
  });

  test('muestra botón Registrar donación', async () => {
    await mount();

    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Registrar donación')
    );

    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(false);
  });

  test('no muestra el formulario inicialmente', async () => {
    await mount();

    expect(container.querySelector('#donaciones-registro-form')).toBeFalsy();
  });

  test('muestra mensaje sin movimientos cuando la lista está vacía', async () => {
    await mount();

    expect(container.textContent).toContain('Sin movimientos registrados');
  });

  test('muestra el formulario al hacer click en Registrar donación', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    expect(container.querySelector('#donaciones-registro-form')).toBeTruthy();
  });

  test('oculta el formulario al hacer click en Ocultar formulario', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Ocultar formulario')
      );
      btn.click();
    });

    expect(container.querySelector('#donaciones-registro-form')).toBeFalsy();
  });

  test('muestra sección para crear nueva marca o familia', async () => {
    await mount();

    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Nueva marca / familia')
    );

    expect(btn).toBeTruthy();
  });

  test('muestra formulario de crear fondo al hacer click en Nueva marca / familia', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Nueva marca / familia')
      );
      btn.click();
    });

    expect(container.textContent).toContain('Crear fondo');
    expect(container.textContent).toContain('Marca / empresa');
    expect(container.textContent).toContain('Familia');
  });

  test('muestra errores al enviar formulario de crear donador vacío', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Nueva marca / familia')
      );
      btn.click();
    });

    await act(async () => {
      const form = Array.from(container.querySelectorAll('form')).find((f) =>
        f.textContent.includes('Crear fondo')
      );
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('Seleccione si es marca o familia');
    expect(container.textContent).toContain('Ingrese el nombre');
  });

  test('crea una marca correctamente', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Nueva marca / familia')
      );
      btn.click();
    });

    await act(async () => {
      const marcaBtn = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
        b.textContent.includes('Marca')
      );
      marcaBtn.click();
    });

    await act(async () => {
      const nombreInput = container.querySelector('#nuevo-donador-nombre');
      setInputValue(nombreInput, 'Fundación XYZ');
    });

    await act(async () => {
      const form = Array.from(container.querySelectorAll('form')).find((f) =>
        f.textContent.includes('Crear fondo')
      );
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockCrearDonador).toHaveBeenCalledWith({
      tipo_origen: 'marca',
      nombre: 'Fundación XYZ',
    });
  });

  test('muestra errores de validación al enviar donación vacía', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const form = container.querySelector('#donaciones-registro-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('Seleccione la marca o familia');
    expect(container.textContent).toContain('Ingrese el monto de la donación');
    expect(container.textContent).toContain('El concepto es obligatorio');
  });

  test('sanitizeMonto limpia caracteres no numéricos en el input de monto', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const montoInput = container.querySelector('#monto-donacion');
      setInputValue(montoInput, '1,000.00abc');
    });

    const montoInput = container.querySelector('#monto-donacion');

    expect(montoInput.value).toBe('1000.00');
  });

  test('submit exitoso registra la donación y oculta el formulario', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const select = container.querySelector('#donador-abono');
      setInputValue(select, '1');

      const montoInput = container.querySelector('#monto-donacion');
      setInputValue(montoInput, '1000');

      const conceptoInput = container.querySelector('#concepto-donacion');
      setInputValue(conceptoInput, 'Donación mensual');
    });

    await act(async () => {
      const form = container.querySelector('#donaciones-registro-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockRegistrarAbono).toHaveBeenCalledWith({
      monto: 1000,
      id_donador: 1,
      concepto: 'Donación mensual',
    });
  });

  test('muestra error cuando registrarAbono falla', async () => {
    mockRegistrarAbono.mockRejectedValueOnce(new Error('Error de red'));

    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    await act(async () => {
      const select = container.querySelector('#donador-abono');
      setInputValue(select, '1');

      const montoInput = container.querySelector('#monto-donacion');
      setInputValue(montoInput, '1000');

      const conceptoInput = container.querySelector('#concepto-donacion');
      setInputValue(conceptoInput, 'Donación mensual');
    });

    await act(async () => {
      const form = container.querySelector('#donaciones-registro-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('Error de red');
  });

  test('llama fetchMovimientos al hacer click en Actualizar', async () => {
    await mount();

    await act(async () => {
      const actualizarBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Actualizar')
      );
      actualizarBtn.click();
    });

    expect(mockFetchMovimientos).toHaveBeenCalled();
  });

  test('muestra tabla cuando hay movimientos', async () => {
    mockMovimientos = [
      {
        id_movimiento: 1,
        fecha: '2025-01-01',
        tipo_movimiento: 'abono',
        origen_nombre: 'Empresa XYZ',
        concepto: 'Donación',
        monto: 1000,
        saldo_nuevo: 5000,
      },
    ];

    await mount();

    expect(container.querySelector('table')).toBeTruthy();
    expect(container.textContent).toContain('Donación');
    expect(container.textContent).toContain('Empresa XYZ');
  });

  test('cambia tipo al presionar ArrowRight en crear fondo', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Nueva marca / familia')
      );
      btn.click();
    });

    await act(async () => {
      const marcaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
        b.textContent.includes('Marca')
      );
      marcaTab.click();
    });

    await act(async () => {
      const tablist = container.querySelector('[role="tablist"]');
      tablist.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );
    });

    const familiaTab = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
      b.textContent.includes('Familia')
    );

    expect(familiaTab.getAttribute('aria-selected')).toBe('true');
  });

  test('handleBlur muestra error en campo concepto vacío', async () => {
    await mount();

    await act(async () => {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Registrar donación')
      );
      btn.click();
    });

    const conceptoInput = container.querySelector('#concepto-donacion');
    expect(conceptoInput).toBeTruthy();

    await act(async () => {
      conceptoInput.dispatchEvent(
        new FocusEvent('focusout', {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(container.textContent).toContain('El concepto es obligatorio');
  });
});
