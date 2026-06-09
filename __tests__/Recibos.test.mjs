/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

global.fetch = jest.fn();

let mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();

jest.mock('react-router-dom', () => ({
  __esModule: true,
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

jest.mock('../client/src/utils/dateTime', () => ({
  __esModule: true,
  todayDate: () => '2026-06-03',
}));

jest.mock('../client/src/utils/dateTime.js', () => ({
  __esModule: true,
  todayDate: () => '2026-06-03',
}));

jest.mock('../client/src/pages/styles/Recibos.css', () => ({}));

jest.mock('../client/src/utils/auth', () => ({
  __esModule: true,
  authFetch: jest.fn((url, options) => {
    if (options === undefined) return globalThis.fetch(url);
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    return globalThis.fetch(url, { ...options, headers });
  }),
}));

jest.mock('../client/src/utils/auth.js', () => ({
  __esModule: true,
  authFetch: jest.fn((url, options) => {
    if (options === undefined) return globalThis.fetch(url);
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    return globalThis.fetch(url, { ...options, headers });
  }),
}));

const RecibosModule = await import('../client/src/pages/Recibos/Recibos.jsx');
const Recibos = RecibosModule.default?.default || RecibosModule.default || RecibosModule;

let container;
let root;

const reciboBase = {
  id_servicio_otorgado: 101,
  beneficiario: 'Juan García',
  servicio: 'Consulta médica',
  fecha: '2026-06-03',
  hora: '10:30',
  financiero: {
    monto_servicio: 1000,
    cuota_total: 1200,
    monto_pagado: 800,
    monto_donacion: 400,
    descuento: 200,
    metodo_pago: 'donacion',
  },
  items_inventario: [
    {
      id_venta_inventario: 1,
      nombre_articulo: 'Sonda',
      cantidad: 2,
      precio_unitario: 100,
      subtotal: 200,
    },
  ],
};

const reciboMes = {
  id_servicio_otorgado: 202,
  beneficiario: 'María López',
  servicio: 'Terapia física',
  fecha: '2026-06-10',
  hora: '12:00',
  financiero: {
    monto_servicio: 500,
    cuota_total: 500,
    monto_pagado: 500,
    monto_donacion: 0,
    descuento: 0,
    metodo_pago: 'efectivo',
  },
  items_inventario: [],
};

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(status = 500) {
  return {
    ok: false,
    status,
    json: async () => ({}),
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

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('Recibos', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mockSearchParams = new URLSearchParams();
    mockSetSearchParams.mockClear();

    global.fetch.mockReset();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    jest.clearAllMocks();
  });

  async function mount({
    recibosDia = [reciboBase],
    recibosMes = [reciboMes],
    dayOk = true,
    mesOk = true,
  } = {}) {
    global.fetch
      .mockResolvedValueOnce(dayOk ? okResponse(recibosDia) : errorResponse(500))
      .mockResolvedValueOnce(mesOk ? okResponse(recibosMes) : errorResponse(500));

    await act(async () => {
      root.render(React.createElement(Recibos));
    });

    await flush();
  }

  test('muestra título y tabs principales', async () => {
    await mount();

    expect(container.textContent).toContain('Recibos');
    expect(container.textContent).toContain('Registro de servicios y cobros');
    expect(container.textContent).toContain('Recibos del día');
    expect(container.textContent).toContain('Recibos del mes');
    expect(container.textContent).toContain('Rango de fechas');
  });

  test('carga recibos del día y del mes al iniciar', async () => {
    await mount();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/recibos?fecha=2026-06-03'
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/recibos/resumen-mes?fecha=2026-06'
    );
  });

  test('muestra tabla y resumen de recibos del día', async () => {
    await mount();

    expect(container.textContent).toContain('Juan García');
    expect(container.textContent).toContain('Consulta médica');
    expect(container.textContent).toContain('Recibos del día');
    expect(container.textContent).toContain('Total facturado');
    expect(container.textContent).toContain('Total cobrado');
    expect(container.querySelector('table')).toBeTruthy();
  });

  test('muestra mensaje vacío cuando no hay recibos del día', async () => {
    await mount({ recibosDia: [] });

    expect(container.textContent).toContain('Sin recibos para esta fecha');
  });

  test('filtra recibos del día por beneficiario', async () => {
    const otroRecibo = {
      ...reciboBase,
      id_servicio_otorgado: 303,
      beneficiario: 'Carlos Pérez',
      servicio: 'Laboratorio',
    };

    await mount({ recibosDia: [reciboBase, otroRecibo] });

    const input = container.querySelector('input[placeholder="Buscar folio, beneficiario o servicio…"]');

    await act(async () => {
      changeInput(input, 'Carlos');
    });

    expect(container.textContent).toContain('Carlos Pérez');
    expect(container.textContent).not.toContain('Juan García');
  });

  test('cambia fecha y vuelve a cargar recibos', async () => {
    await mount();

    global.fetch.mockResolvedValueOnce(okResponse([]));
    global.fetch.mockResolvedValueOnce(okResponse([]));

    const dateInput = container.querySelector('input[type="date"]');

    await act(async () => {
      changeInput(dateInput, '2026-06-15');
    });

    await flush();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/recibos?fecha=2026-06-15'
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/recibos/resumen-mes?fecha=2026-06'
    );
  });

  test('botón Hoy regresa a la fecha actual mockeada', async () => {
    await mount();

    global.fetch.mockResolvedValue(okResponse([]));

    const dateInput = container.querySelector('input[type="date"]');

    await act(async () => {
      changeInput(dateInput, '2026-06-20');
    });

    await flush();

    const hoyBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Hoy')
    );

    await act(async () => {
      hoyBtn.click();
    });

    await flush();

    expect(dateInput.value).toBe('2026-06-03');
  });

  test('abre detalle del recibo al hacer click en Ver', async () => {
    await mount();

    await act(async () => {
      const verBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Ver')
      );
      verBtn.click();
    });

    expect(container.textContent).toContain('Folio #101');
    expect(container.textContent).toContain('Resumen financiero');
    expect(container.textContent).toContain('Artículos de inventario');
    expect(container.textContent).toContain('Sonda');
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
  });

  test('cierra detalle con botón de cerrar', async () => {
    await mount();

    await act(async () => {
      const verBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Ver')
      );
      verBtn.click();
    });

    expect(container.querySelector('[role="dialog"]')).toBeTruthy();

    await act(async () => {
      const closeBtn = container.querySelector('.btn-close');
      closeBtn.click();
    });

    expect(container.querySelector('[role="dialog"]')).toBeFalsy();
  });

  test('cierra detalle con tecla Escape', async () => {
    await mount();

    await act(async () => {
      const verBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Ver')
      );
      verBtn.click();
    });

    expect(container.querySelector('[role="dialog"]')).toBeTruthy();

    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(container.querySelector('[role="dialog"]')).toBeFalsy();
  });

  test('cambia a la vista de recibos del mes', async () => {
    await mount();

    await act(async () => {
      const mesTab = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
        b.textContent.includes('Recibos del mes')
      );
      mesTab.click();
    });

    expect(container.textContent).toContain('María López');
    expect(container.textContent).toContain('Terapia física');
    expect(container.textContent).toContain('Recibos del mes');
  });

  test('filtra recibos del mes por servicio', async () => {
    await mount();

    await act(async () => {
      const mesTab = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
        b.textContent.includes('Recibos del mes')
      );
      mesTab.click();
    });

    const inputs = container.querySelectorAll('input[placeholder="Buscar folio, beneficiario o servicio…"]');
    const searchInput = inputs[0];

    await act(async () => {
      changeInput(searchInput, 'Terapia');
    });

    expect(container.textContent).toContain('María López');
    expect(container.textContent).toContain('Terapia física');
  });

  test('cambia a rango de fechas y muestra mensaje inicial', async () => {
    await mount();

    await act(async () => {
      const rangoTab = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
        b.textContent.includes('Rango de fechas')
      );
      rangoTab.click();
    });

    expect(container.textContent).toContain('Rango personalizado');
    expect(container.textContent).toContain('Selecciona un rango y pulsa Buscar');
  });

  test('busca recibos por rango de fechas', async () => {
    await mount();

    await act(async () => {
      const rangoTab = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
        b.textContent.includes('Rango de fechas')
      );
      rangoTab.click();
    });

    global.fetch.mockResolvedValueOnce(okResponse([reciboBase]));

    await act(async () => {
      const buscarBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Buscar')
      );
      buscarBtn.click();
    });

    await flush();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/recibos/rango-fechas?desde=2026-06-03&hasta=2026-06-03'
    );

    expect(container.textContent).toContain('Juan García');
    expect(container.textContent).toContain('Consulta médica');
  });

  test('muestra error si falla la carga de recibos del día', async () => {
    await mount({
      recibosDia: [],
      recibosMes: [],
      dayOk: false,
      mesOk: true,
    });

    expect(container.textContent).toContain('Error 500');
  });

  test('muestra error si falla la búsqueda por rango', async () => {
    await mount();

    await act(async () => {
      const rangoTab = Array.from(container.querySelectorAll('button[role="tab"]')).find((b) =>
        b.textContent.includes('Rango de fechas')
      );
      rangoTab.click();
    });

    global.fetch.mockResolvedValueOnce(errorResponse(404));

    await act(async () => {
      const buscarBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Buscar')
      );
      buscarBtn.click();
    });

    await flush();

    expect(container.textContent).toContain('Error 404');
  });

  test('cambia de tab con teclado usando ArrowRight y End', async () => {
    await mount();

    const tablist = container.querySelector('[role="tablist"]');

    await act(async () => {
      tablist.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(container.textContent).toContain('Recibos del mes');

    await act(async () => {
      tablist.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'End',
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(container.textContent).toContain('Rango personalizado');
  });

  test('abre recibo automáticamente si existe folio en query params', async () => {
    mockSearchParams = new URLSearchParams('folio=101');

    await mount();

    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    expect(container.textContent).toContain('Folio #101');
    expect(mockSetSearchParams).toHaveBeenCalled();
  });
});