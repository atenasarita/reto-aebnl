/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

global.fetch = jest.fn();

const mockOnClose = jest.fn();
const mockOnSuccess = jest.fn();

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

jest.mock('../client/src/components/CitasPop/styles/CitasPop.css', () => ({}));
jest.mock('../client/src/components/citas/styles/CitasPop.css', () => ({}));
jest.mock('../client/src/components/styles/CitasPop.css', () => ({}));

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

const CitasPopModule = await import('../client/src/components/ui/CitasPop.jsx');
const CitasPop =
  CitasPopModule.default?.default ||
  CitasPopModule.default ||
  CitasPopModule;

let container;
let root;

const especialistas = [
  {
    id_especialista: 1,
    nombre_completo: 'Dra. Ana López',
  },
  {
    id_especialista: 2,
    nombre_completo: 'Dr. Carlos Ruiz',
  },
];

const servicios = [
  {
    id_catalogo_servicio: 10,
    nombre: 'Consulta médica',
  },
  {
    id_catalogo_servicio: 20,
    nombre: 'Terapia física',
  },
];

const beneficiarios = [
  {
    id_beneficiario: 5,
    nombres: 'Juan',
    apellido_paterno: 'García',
    folio: 'BEN-001',
    telefono: '8112345678',
    email: 'juan@test.com',
  },
];

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(status = 500, message = 'Error del servidor') {
  return {
    ok: false,
    status,
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

async function flushTimers() {
  await act(async () => {
    jest.advanceTimersByTime(350);
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function getButton(text) {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes(text)
  );
}

async function mount(props = {}) {
  await act(async () => {
    root.render(
      React.createElement(CitasPop, {
        open: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess,
        ...props,
      })
    );
  });

  await flushPromises();
}

async function setupCatalogos() {
  global.fetch
    .mockResolvedValueOnce(okResponse(especialistas))
    .mockResolvedValueOnce(okResponse(servicios));
}

async function buscarYSeleccionarBeneficiario() {
  const searchInput = container.querySelector('input[placeholder="Buscar por nombre o número de folio…"]');

  await act(async () => {
    changeInput(searchInput, 'Juan');
  });

  await flushTimers();

  await act(async () => {
    const result = Array.from(container.querySelectorAll('li')).find((li) =>
      li.textContent.includes('Juan García')
    );
    result.click();
  });
}

describe('CitasPop', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    document.body.style.overflow = '';
    jest.useRealTimers();
  });

  test('no renderiza nada cuando open es false', async () => {
    await act(async () => {
      root.render(
        React.createElement(CitasPop, {
          open: false,
          onClose: mockOnClose,
          onSuccess: mockOnSuccess,
        })
      );
    });

    expect(container.textContent).toBe('');
    expect(container.querySelector('[role="dialog"]')).toBeFalsy();
  });

  test('muestra el modal de nueva cita cuando open es true', async () => {
    await setupCatalogos();
    await mount();

    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    expect(container.textContent).toContain('Nueva cita');
    expect(container.textContent).toContain('Selección de Beneficiario');
    expect(container.textContent).toContain('Horario y Servicio');
    expect(container.textContent).toContain('Estado y Observaciones');
  });

  test('bloquea el scroll del body cuando el modal está abierto', async () => {
    await setupCatalogos();
    await mount();

    expect(document.body.style.overflow).toBe('hidden');
  });

  test('cierra el modal al presionar Escape', async () => {
    await setupCatalogos();
    await mount();

    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('cierra el modal al hacer click en el overlay', async () => {
    await setupCatalogos();
    await mount();

    await act(async () => {
      container.querySelector('.cp-overlay').click();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('no cierra el modal al hacer click dentro del panel', async () => {
    await setupCatalogos();
    await mount();

    await act(async () => {
      container.querySelector('.cp-modal').click();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('cierra con el botón de cerrar del header', async () => {
    await setupCatalogos();
    await mount();

    await act(async () => {
      const closeBtn = container.querySelector('.cp-header-close');
      closeBtn.click();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('carga catálogos de especialistas y servicios al abrir', async () => {
    await setupCatalogos();
    await mount();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/especialistas');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/catalogo-servicios');

    expect(container.textContent).toContain('Dra. Ana López');
    expect(container.textContent).toContain('Consulta médica');
  });

  test('muestra error si no se pueden cargar los catálogos', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await mount();

    expect(container.textContent).toContain('No se pudieron cargar los catálogos');
  });

  test('busca beneficiario y permite seleccionarlo', async () => {
    await setupCatalogos();
    global.fetch.mockResolvedValueOnce(okResponse(beneficiarios));

    await mount();

    await buscarYSeleccionarBeneficiario();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/buscar-beneficiarios?q=Juan'
    );

    expect(container.textContent).toContain('Teléfono de contacto');
    expect(container.textContent).toContain('+52 8112345678');
    expect(container.textContent).toContain('juan@test.com');
  });

  test('no busca beneficiario si el texto tiene menos de dos caracteres', async () => {
    await setupCatalogos();
    await mount();

    const searchInput = container.querySelector('input[placeholder="Buscar por nombre o número de folio…"]');

    await act(async () => {
      changeInput(searchInput, 'J');
    });

    await flushTimers();

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('limpia beneficiario seleccionado al enfocar el campo', async () => {
    await setupCatalogos();
    global.fetch.mockResolvedValueOnce(okResponse(beneficiarios));

    await mount();

    await buscarYSeleccionarBeneficiario();

    const searchInput = container.querySelector(
        'input[placeholder="Buscar por nombre o número de folio…"]'
    );

    expect(searchInput.value).toContain('Juan');

    await act(async () => {
      searchInput.focus();
    });

    expect(searchInput.value).toBe('');
  });

  test('mantiene botón de guardar deshabilitado si faltan datos obligatorios', async () => {
    await setupCatalogos();
    await mount();

    const confirmarBtn = getButton('Confirmar Cita');

    expect(confirmarBtn.disabled).toBe(true);
  });

  test('crea una cita correctamente', async () => {
    await setupCatalogos();
    global.fetch.mockResolvedValueOnce(okResponse(beneficiarios));
    global.fetch.mockResolvedValueOnce(okResponse({ id_cita: 99 }));

    await mount();

    await buscarYSeleccionarBeneficiario();

    await act(async () => {
      changeInput(container.querySelector('input[type="date"]'), '2026-06-05');
      changeInput(container.querySelector('select.cp-select'), '10:00');

      const motivoInput = container.querySelector('input[placeholder="Ej. Control mensual, revisión de ortesis…"]');
      changeInput(motivoInput, 'Control mensual');

      const textarea = container.querySelector('textarea');
      changeInput(textarea, 'Paciente requiere apoyo especial.');

      const completadaBtn = getButton('Completada');
      completadaBtn.click();
    });

    await act(async () => {
      getButton('Confirmar Cita').click();
    });

    expect(global.fetch).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/citas',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_beneficiario: 5,
          id_especialista: 1,
          id_catalogo_servicio: 10,
          fecha: '2026-06-05',
          hora: '10:00',
          motivo: 'Control mensual',
          notas: 'Paciente requiere apoyo especial.',
          estatus: 'completada',
        }),
      })
    );

    expect(mockOnSuccess).toHaveBeenCalledWith({ id_cita: 99 });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('muestra error si falla la creación de cita', async () => {
    await setupCatalogos();
    global.fetch.mockResolvedValueOnce(okResponse(beneficiarios));
    global.fetch.mockResolvedValueOnce(errorResponse(400, 'Horario no disponible'));

    await mount();

    await buscarYSeleccionarBeneficiario();

    await act(async () => {
      changeInput(container.querySelector('input[type="date"]'), '2026-06-05');

      const motivoInput = container.querySelector('input[placeholder="Ej. Control mensual, revisión de ortesis…"]');
      changeInput(motivoInput, 'Control mensual');
    });

    await act(async () => {
      getButton('Confirmar Cita').click();
    });

    expect(container.textContent).toContain('Horario no disponible');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('renderiza datos iniciales en modo editar', async () => {
    const cita = {
      id: 77,
      title: 'Revisión de ortesis',
      startStr: '2026-06-10T12:00:00',
      extendedProps: {
        idBeneficiario: 8,
        beneficiario: 'María',
        apellidoPaterno: 'López',
        telefonoBeneficiario: '8188888888',
        emailBeneficiario: 'maria@test.com',
        id_especialista: 2,
        idServicio: 20,
        estatus: 'cancelada',
        notas: 'Traer estudios.',
      },
    };

    await setupCatalogos();
    await mount({ cita, modo: 'editar' });

    expect(container.textContent).toContain('Modificar cita');

    const searchInput = container.querySelector(
        'input[placeholder="Buscar por nombre o número de folio…"]'
    );

    expect(searchInput.value).toContain('María López');

    expect(container.textContent).toContain('+52 8188888888');
    expect(container.textContent).toContain('maria@test.com');

    expect(container.querySelector('input[type="date"]').value).toBe('2026-06-10');
    expect(container.querySelector('textarea').value).toBe('Traer estudios.');
  });

  test('edita una cita correctamente con método PUT', async () => {
    const cita = {
      id: 77,
      title: 'Revisión de ortesis',
      start: '2026-06-10T12:00:00',
      extendedProps: {
        idBeneficiario: 8,
        beneficiario: 'María',
        apellidoPaterno: 'López',
        telefonoBeneficiario: '8188888888',
        emailBeneficiario: 'maria@test.com',
        id_especialista: 2,
        idServicio: 20,
        estatus: 'programada',
        notas: 'Traer estudios.',
      },
    };

    await setupCatalogos();
    global.fetch.mockResolvedValueOnce(okResponse({ id_cita: 77, updated: true }));

    await mount({ cita, modo: 'editar' });

    await act(async () => {
      const motivoInput = container.querySelector('input[placeholder="Ej. Control mensual, revisión de ortesis…"]');
      changeInput(motivoInput, 'Revisión actualizada');
    });

    await act(async () => {
      getButton('Guardar Cambios').click();
    });

    expect(global.fetch).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/citas/77',
      expect.objectContaining({
        method: 'PUT',
      })
    );

    expect(mockOnSuccess).toHaveBeenCalledWith({ id_cita: 77, updated: true });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('usa fecha y horario por defecto cuando la cita no trae start', async () => {
    const cita = {
      id: 88,
      title: 'Cita sin fecha',
      extendedProps: {
        idBeneficiario: 9,
        beneficiario: 'Luis',
        apellidoPaterno: 'Pérez',
        id_especialista: 1,
        idServicio: 10,
        estatus: 'programada',
      },
    };

    await setupCatalogos();
    await mount({ cita, modo: 'editar' });

    expect(container.querySelector('input[type="date"]').value).toBe('2026-06-03');

    const horarioSelect = Array.from(container.querySelectorAll('select.cp-select')).find((select) =>
      Array.from(select.options).some((option) => option.value === '09:00')
    );

    expect(horarioSelect.value).toBe('09:00');
  });

  test('descarta cambios con el botón secundario', async () => {
    await setupCatalogos();
    await mount();

    await act(async () => {
      getButton('Descartar Cambios').click();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});