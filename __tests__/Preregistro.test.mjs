/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

global.fetch = jest.fn();

// Mock react-router-dom
jest.unstable_mockModule('react-router-dom', () => ({
  Link: ({ children, to, className }) =>
    React.createElement('a', { href: to, className }, children),
}));

// Mock lucide-react
jest.unstable_mockModule('lucide-react', () => ({
  Accessibility: () => null,
  ArrowLeft: () => null,
  ArrowRight: () => null,
  Bone: () => null,
  Brain: () => null,
  Droplets: () => null,
  Globe: () => null,
  Hand: () => null,
  Headset: () => null,
  Heart: () => null,
  Mail: () => null,
  MapPin: () => null,
  Phone: () => null,
  Send: () => null,
  Stethoscope: () => null,
}));

// Mock react-icons
jest.unstable_mockModule('react-icons/fa', () => ({
  FaFacebook: () => null,
  FaInstagram: () => null,
}));

// Mock assets
jest.unstable_mockModule('../client/src/assets/espina.png', () => ({
  default: 'espina.png',
}));

// Mock CSS
jest.unstable_mockModule('../client/src/pages/styles/Preregistro.css', () => ({}));

// Mock utils
jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  API_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule('../client/src/utils/espinaBifidaTypes.js', () => ({
  espinaBifidaOptions: [
    { value: 1, label: 'Encefalocele' },
    { value: 2, label: 'Espina Bífida Oculta' },
    { value: 9, label: 'Otros' },
  ],
}));

jest.unstable_mockModule('../client/src/utils/validator.js', () => ({
  limpiarSoloLetras: (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''),
  validarCURP: (v) => v.length === 18,
}));

jest.unstable_mockModule('../client/src/utils/dateTime.js', () => ({
  todayDate: () => '2026-06-02',
}));

const PreregistroModule = await import('../client/src/pages/preregistro/Preregistro.jsx');
const Preregistro =
  PreregistroModule.default?.default ||
  PreregistroModule.default ||
  PreregistroModule;

let container;
let root;

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

describe('Preregistro', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    global.fetch.mockReset();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    jest.clearAllMocks();
  });

  async function mount() {
    await act(async () => {
      root.render(React.createElement(Preregistro));
    });
  }

  // ── Renderizado inicial ───────────────────────────────────────
  test('muestra el paso 1 (Identidad) al iniciar', async () => {
    await mount();
    expect(container.textContent).toContain('Información del Paciente');
  });

  test('muestra el indicador de progreso', async () => {
    await mount();
    expect(container.textContent).toContain('Paso 1 de 3');
  });

  test('muestra el paso inicial de identidad', async () => {
    await mount();
    expect(container.textContent).toContain('Información del Paciente');
  });

  test('botón Continuar deshabilitado con campos vacíos', async () => {
    await mount();
    const btn = container.querySelector('button[type="submit"]');
    expect(btn.disabled).toBe(true);
  });

  // ── StepIdentidad ─────────────────────────────────────────────
  test('habilita Continuar al llenar nombre, paterno y materno', async () => {
    await mount();

    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
      });
    });

    const btn = container.querySelector('button[type="submit"]');
    expect(btn.disabled).toBe(false);
  });

  test('muestra campo de segundo nombre al activar checkbox', async () => {
    await mount();

    await act(async () => {
      const checkbox = container.querySelector('input[type="checkbox"]');
      checkbox.click();
    });

    expect(container.querySelector('input[placeholder="Ej. Pablo"]')).toBeTruthy();
  });

  test('oculta segundo nombre al desactivar checkbox y limpia el valor', async () => {
    await mount();

    await act(async () => {
      const checkbox = container.querySelector('input[type="checkbox"]');
      checkbox.click();
    });

    await act(async () => {
      const checkbox = container.querySelector('input[type="checkbox"]');
      checkbox.click();
    });

    expect(container.querySelector('input[placeholder="Ej. Pablo"]')).toBeFalsy();
  });

  test('avanza al paso 2 al completar identidad', async () => {
    await mount();

    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
      });
    });

    await act(async () => {
      const form = container.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(container.textContent).toContain('Paso 2 de 3');
  });

  // ── StepDemografia ────────────────────────────────────────────
  test('muestra paso 2 con campos de fecha, género y CURP', async () => {
    await mount();

    // Avanzar al paso 2
    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
      });
    });

    await act(async () => {
      const form = container.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(container.textContent).toContain('Datos de Identificación');
    expect(container.querySelector('input[type="date"]')).toBeTruthy();
  });

  test('botón Anterior en paso 2 regresa al paso 1', async () => {
    await mount();

    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
      });
    });

    await act(async () => {
      const form = container.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    await act(async () => {
      const backBtn = container.querySelector('button[type="button"]');
      backBtn.click();
    });

    expect(container.textContent).toContain('Paso 1 de 3');
  });

  // ── StepDiagnostico ───────────────────────────────────────────
  test('muestra opciones de espina bífida en paso 3', async () => {
    await mount();

    // Paso 1
    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
      });
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // Paso 2
    await act(async () => {
      const dateInput = container.querySelector('input[type="date"]');
      changeInput(dateInput, '2000-01-01');

      const radios = container.querySelectorAll('input[type="radio"]');
      radios[0].click();

      const curpInput = container.querySelector('input[maxlength="18"]');
      changeInput(curpInput, 'GALE800101HDFRRN02');
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(container.textContent).toContain('Diagnóstico Médico');
    expect(container.textContent).toContain('Encefalocele');
  });

  test('muestra campo de texto al seleccionar Otros en diagnóstico', async () => {
    await mount();

    // Navegar hasta paso 3
    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
              });
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });
    await act(async () => {
      const dateInput = container.querySelector('input[type="date"]');
      changeInput(dateInput, '2000-01-01');
      const radios = container.querySelectorAll('input[type="radio"]');
      radios[0].click();
      const curpInput = container.querySelector('input[maxlength="18"]');
      changeInput(curpInput, 'GALE800101HDFRRN02');
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // Seleccionar "Otros" (value=9)
    await act(async () => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      const otrosCheckbox = Array.from(checkboxes).find((cb) => cb.parentElement?.textContent?.includes('Otros'));
      if (otrosCheckbox) {
        otrosCheckbox.click();
      }
    });

    expect(container.querySelector('textarea')).toBeTruthy();
  });

  // ── Submit final ──────────────────────────────────────────────
  test('muestra pantalla de éxito tras submit exitoso', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await mount();

    // Paso 1
    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
              });
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // Paso 2
    await act(async () => {
      const dateInput = container.querySelector('input[type="date"]');
      changeInput(dateInput, '2000-01-01');
      const radios = container.querySelectorAll('input[type="radio"]');
      radios[0].click();
      const curpInput = container.querySelector('input[maxlength="18"]');
      changeInput(curpInput, 'GALE800101HDFRRN02');
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // Paso 3 - seleccionar diagnóstico
    await act(async () => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      checkboxes[0].click();
    });

    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(container.textContent).toContain('Preregistro completado');
  });

  test('muestra error si el submit falla', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error del servidor' }),
    });

    await mount();

    // Navegar hasta paso 3
    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
              });
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });
    await act(async () => {
      const dateInput = container.querySelector('input[type="date"]');
      changeInput(dateInput, '2000-01-01');
      const radios = container.querySelectorAll('input[type="radio"]');
      radios[0].click();
      const curpInput = container.querySelector('input[maxlength="18"]');
      changeInput(curpInput, 'GALE800101HDFRRN02');
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });
    await act(async () => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      checkboxes[0].click();
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(container.textContent).toContain('Error del servidor');
  });

  // ── SuccessScreen reset ───────────────────────────────────────
  test('resetea el formulario al hacer click en Registrar otra persona', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await mount();

    await act(async () => {
      const inputs = container.querySelectorAll('input[type="text"]');
      ['Juan', 'García', 'López'].forEach((val, i) => {
        changeInput(inputs[i], val);
              });
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });
    await act(async () => {
      const dateInput = container.querySelector('input[type="date"]');
      changeInput(dateInput, '2000-01-01');
      const radios = container.querySelectorAll('input[type="radio"]');
      radios[0].click();
      const curpInput = container.querySelector('input[maxlength="18"]');
      changeInput(curpInput, 'GALE800101HDFRRN02');
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });
    await act(async () => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      checkboxes[0].click();
    });
    await act(async () => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true }));
    });

    await act(async () => {
      const resetBtn = container.querySelector('button[type="button"]');
      resetBtn.click();
    });

    expect(container.textContent).toContain('Paso 1 de 3');
  });
});
