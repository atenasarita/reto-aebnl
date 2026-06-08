/**
 * @jest-environment jsdom
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const {
  fmtMontoFondo,
  MontoCell,
  SaldoCell,
  formatOrigenMovimiento,
  formatConceptoMovimiento,
} = await import('../client/src/components/fondo/FondoMovimientosDisplay.jsx');

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

async function mountCell(element) {
  await act(async () => {
    root.render(
      React.createElement('table', null,
        React.createElement('tbody', null,
          React.createElement('tr', null, element)
        )
      )
    );
  });
}

// ---------------------------------------------------------------------------
// fmtMontoFondo
// ---------------------------------------------------------------------------

describe('fmtMontoFondo', () => {
  const fmt = (n) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  test('formatea un número positivo como moneda MXN', () => {
    expect(fmtMontoFondo(1000)).toBe(fmt(1000));
  });

  test('formatea cero', () => {
    expect(fmtMontoFondo(0)).toBe(fmt(0));
  });

  test('formatea un número con decimales', () => {
    expect(fmtMontoFondo(1234.56)).toBe(fmt(1234.56));
  });

  test('formatea un número negativo', () => {
    expect(fmtMontoFondo(-500)).toBe(fmt(-500));
  });

  test('usa 0 cuando el valor es null', () => {
    expect(fmtMontoFondo(null)).toBe(fmt(0));
  });

  test('usa 0 cuando el valor es undefined', () => {
    expect(fmtMontoFondo(undefined)).toBe(fmt(0));
  });
});

// ---------------------------------------------------------------------------
// MontoCell
// ---------------------------------------------------------------------------

describe('MontoCell', () => {

  test('renderiza un elemento <td>', async () => {
    await mountCell(React.createElement(MontoCell, { tipo: 'ingreso', monto: 500 }));
    expect(container.querySelector('td')).not.toBeNull();
  });

  test('muestra el signo "+" para tipo ingreso', async () => {
    await mountCell(React.createElement(MontoCell, { tipo: 'ingreso', monto: 500 }));
    expect(container.textContent).toContain('+');
  });

  test('muestra el signo "−" para tipo egreso', async () => {
    await mountCell(React.createElement(MontoCell, { tipo: 'egreso', monto: 300 }));
    expect(container.textContent).toContain('−');
  });

  test('aplica la clase donaciones-money--egreso para tipo egreso', async () => {
    await mountCell(React.createElement(MontoCell, { tipo: 'egreso', monto: 300 }));
    expect(container.querySelector('.donaciones-money--egreso')).not.toBeNull();
  });

  test('aplica la clase donaciones-money--ingreso para tipo ingreso', async () => {
    await mountCell(React.createElement(MontoCell, { tipo: 'ingreso', monto: 500 }));
    expect(container.querySelector('.donaciones-money--ingreso')).not.toBeNull();
  });

  test('muestra el monto formateado', async () => {
    const expected = fmtMontoFondo(1500);
    await mountCell(React.createElement(MontoCell, { tipo: 'ingreso', monto: 1500 }));
    expect(container.textContent).toContain(expected);
  });

  test('el signo tiene aria-hidden="true"', async () => {
    await mountCell(React.createElement(MontoCell, { tipo: 'egreso', monto: 100 }));
    const sign = container.querySelector('.donaciones-money__sign');
    expect(sign.getAttribute('aria-hidden')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// SaldoCell
// ---------------------------------------------------------------------------

describe('SaldoCell', () => {

  test('renderiza un elemento <td>', async () => {
    await mountCell(React.createElement(SaldoCell, { value: 2000 }));
    expect(container.querySelector('td')).not.toBeNull();
  });

  test('usa la variante "balance" por defecto', async () => {
    await mountCell(React.createElement(SaldoCell, { value: 2000 }));
    expect(container.querySelector('.donaciones-balance--balance')).not.toBeNull();
  });

  test('aplica la variante personalizada cuando se indica', async () => {
    await mountCell(React.createElement(SaldoCell, { value: 500, variant: 'low' }));
    expect(container.querySelector('.donaciones-balance--low')).not.toBeNull();
  });

  test('muestra el saldo formateado', async () => {
    const expected = fmtMontoFondo(3750);
    await mountCell(React.createElement(SaldoCell, { value: 3750 }));
    expect(container.textContent).toContain(expected);
  });

  test('muestra cero formateado cuando value es null', async () => {
    const expected = fmtMontoFondo(null);
    await mountCell(React.createElement(SaldoCell, { value: null }));
    expect(container.textContent).toContain(expected);
  });
});

// ---------------------------------------------------------------------------
// formatOrigenMovimiento
// ---------------------------------------------------------------------------

describe('formatOrigenMovimiento', () => {

  test('egreso con donador_nombre → "Fondo: {nombre}"', () => {
    const m = { tipo_movimiento: 'egreso', donador_nombre: 'Empresa XYZ' };
    expect(formatOrigenMovimiento(m)).toBe('Fondo: Empresa XYZ');
  });

  test('egreso con folio_servicio (sin donador) → "Servicio #{folio}"', () => {
    const m = { tipo_movimiento: 'egreso', folio_servicio: 42 };
    expect(formatOrigenMovimiento(m)).toBe('Servicio #42');
  });

  test('egreso con id_servicio_otorgado (sin folio_servicio, sin donador) → "Servicio #{id}"', () => {
    const m = { tipo_movimiento: 'Egreso', id_servicio_otorgado: 99 };
    expect(formatOrigenMovimiento(m)).toBe('Servicio #99');
  });

  test('folio_servicio tiene prioridad sobre id_servicio_otorgado en egreso', () => {
    const m = { tipo_movimiento: 'egreso', folio_servicio: 10, id_servicio_otorgado: 20 };
    expect(formatOrigenMovimiento(m)).toBe('Servicio #10');
  });

  test('egreso sin folio ni donador → "Servicio"', () => {
    const m = { tipo_movimiento: 'egreso' };
    expect(formatOrigenMovimiento(m)).toBe('Servicio');
  });

  test('ingreso con origen_tipo "marca" → "Marca: {origen_nombre}"', () => {
    const m = { origen_tipo: 'marca', origen_nombre: 'Nike' };
    expect(formatOrigenMovimiento(m)).toBe('Marca: Nike');
  });

  test('ingreso con origen_tipo distinto de "marca" → "Familia: {origen_nombre}"', () => {
    const m = { origen_tipo: 'familia', origen_nombre: 'García' };
    expect(formatOrigenMovimiento(m)).toBe('Familia: García');
  });

  test('origen_tipo sin origen_nombre usa donador_nombre como fallback', () => {
    const m = { origen_tipo: 'marca', donador_nombre: 'Donador SA' };
    expect(formatOrigenMovimiento(m)).toBe('Marca: Donador SA');
  });

  test('origen_tipo sin origen_nombre ni donador_nombre → "Marca: —"', () => {
    const m = { origen_tipo: 'marca' };
    expect(formatOrigenMovimiento(m)).toBe('Marca: —');
  });

  test('ingreso con donador_nombre (sin origen_tipo) → donador_nombre', () => {
    const m = { donador_nombre: 'Ana Sánchez' };
    expect(formatOrigenMovimiento(m)).toBe('Ana Sánchez');
  });

  test('movimiento sin datos relevantes → "—"', () => {
    expect(formatOrigenMovimiento({})).toBe('—');
  });

  test('la comparación de tipo_movimiento no distingue mayúsculas', () => {
    const m = { tipo_movimiento: 'EGRESO', folio_servicio: 5 };
    expect(formatOrigenMovimiento(m)).toBe('Servicio #5');
  });
});

// ---------------------------------------------------------------------------
// formatConceptoMovimiento
// ---------------------------------------------------------------------------

describe('formatConceptoMovimiento', () => {

  test('egreso con folio y nombre → "Folio #{folio} · {nombre}"', () => {
    const m = { tipo_movimiento: 'egreso', folio_servicio: 7, servicio_nombre: 'Consulta general' };
    expect(formatConceptoMovimiento(m)).toBe('Folio #7 · Consulta general');
  });

  test('usa id_servicio_otorgado cuando no hay folio_servicio', () => {
    const m = { tipo_movimiento: 'egreso', id_servicio_otorgado: 55, servicio_nombre: 'Terapia' };
    expect(formatConceptoMovimiento(m)).toBe('Folio #55 · Terapia');
  });

  test('folio_servicio tiene prioridad sobre id_servicio_otorgado', () => {
    const m = { tipo_movimiento: 'egreso', folio_servicio: 3, id_servicio_otorgado: 9, servicio_nombre: 'X' };
    expect(formatConceptoMovimiento(m)).toBe('Folio #3 · X');
  });

  test('egreso con folio pero sin nombre → "Folio #{folio}"', () => {
    const m = { tipo_movimiento: 'egreso', folio_servicio: 12 };
    expect(formatConceptoMovimiento(m)).toBe('Folio #12');
  });

  test('egreso sin folio ni nombre usa concepto si está disponible', () => {
    const m = { tipo_movimiento: 'egreso', concepto: 'Pago directo' };
    expect(formatConceptoMovimiento(m)).toBe('Pago directo');
  });

  test('servicio_nombre con espacios al inicio/fin es recortado', () => {
    const m = { tipo_movimiento: 'egreso', folio_servicio: 1, servicio_nombre: '  Fisioterapia  ' };
    expect(formatConceptoMovimiento(m)).toBe('Folio #1 · Fisioterapia');
  });

  test('servicio_nombre vacío (solo espacios) se trata como sin nombre', () => {
    const m = { tipo_movimiento: 'egreso', folio_servicio: 2, servicio_nombre: '   ' };
    expect(formatConceptoMovimiento(m)).toBe('Folio #2');
  });

  test('ingreso con concepto → concepto', () => {
    const m = { tipo_movimiento: 'ingreso', concepto: 'Donación mensual' };
    expect(formatConceptoMovimiento(m)).toBe('Donación mensual');
  });

  test('ingreso con motivo (sin concepto) → motivo', () => {
    const m = { tipo_movimiento: 'ingreso', motivo: 'Aportación voluntaria' };
    expect(formatConceptoMovimiento(m)).toBe('Aportación voluntaria');
  });

  test('concepto tiene prioridad sobre motivo', () => {
    const m = { concepto: 'Principal', motivo: 'Secundario' };
    expect(formatConceptoMovimiento(m)).toBe('Principal');
  });

  test('ingreso sin concepto ni motivo → "—"', () => {
    expect(formatConceptoMovimiento({})).toBe('—');
  });

  test('la comparación de tipo_movimiento no distingue mayúsculas', () => {
    const m = { tipo_movimiento: 'EGRESO', folio_servicio: 8, servicio_nombre: 'Odontología' };
    expect(formatConceptoMovimiento(m)).toBe('Folio #8 · Odontología');
  });
});
