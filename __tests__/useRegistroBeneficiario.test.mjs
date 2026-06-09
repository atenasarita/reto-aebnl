/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.unstable_mockModule('../client/src/services/beneficiariosService.js', () => ({
  fetchSiguienteFolio: jest.fn(async () => 'FOLIO-001'),
  createBeneficiario: jest.fn(async (payload) => ({ id: 1, ...payload })),
}));

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  API_URL: 'http://localhost:3000',
}));

const { useRegistroBeneficiario } = await import('../client/src/hooks/useRegistroBeneficiario.js');

let current;
let container;
let root;

function HookTest() {
  current = useRegistroBeneficiario();
  return null;
}

describe('useRegistroBeneficiario', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.setItem('token', 'token-123');
  });

    afterEach(async () => {
        await act(async () => {   // ← async act
            root.unmount();
        });
        container.remove();
        jest.clearAllMocks();
        current = null;
    });

  async function mountHook() {
    await act(async () => {
      root.render(React.createElement(HookTest));
    });
  }

  test('inicializa con valores por defecto', async () => {
    await mountHook();
    expect(current.currentStep).toBe(0);
    expect(current.fieldErrors).toEqual({});
    expect(current.loading).toBe(false);
    expect(current.error).toBe('');
    expect(current.showSuccessModal).toBe(false);
  });

  test('handleInputChange limpia nombres y teléfonos', async () => {
    await mountHook();

    act(() => {
      current.handleInputChange({ target: { name: 'nombres', value: 'Ana123' } });
    });
    expect(current.formData.nombres).toBe('Ana');

    act(() => {
      current.handleInputChange({ target: { name: 'telefono', value: '55A12345678' } });
    });
    expect(current.formData.telefono).toBe('5512345678');
  });

  test('handleFechaNacimientoChange actualiza la fecha y borra el error', async () => {
    await mountHook();

    act(() => {
      current.handleBlur({ target: { name: 'fecha_nacimiento', value: '' } });
    });

    act(() => {
      current.handleFechaNacimientoChange({ target: { value: '2000-01-01' } });
    });

    expect(current.fechaNacimiento).toBe('2000-01-01');
    expect(current.fieldErrors.fecha_nacimiento).toBe('');
  });

  test('handleBlur agrega error cuando el campo es inválido', async () => {
    await mountHook();

    act(() => {
      current.handleBlur({ target: { name: 'CURP', value: 'ABC' } });
    });

    expect(current.fieldErrors.CURP).toBe('CURP invalida');
  });

  test('handleTipoEspinasChange agrega y quita elementos', async () => {
    await mountHook();

    act(() => {
      current.handleTipoEspinasChange({ target: { value: '1', checked: true } });
    });
    expect(current.formData.tipo_espinas).toContain(1);

    act(() => {
      current.handleTipoEspinasChange({ target: { value: '1', checked: false } });
    });
    expect(current.formData.tipo_espinas).not.toContain(1);
  });

  test('handleFotoChange actualiza la fotografía y limpia errores', async () => {
    await mountHook();

    act(() => {
      current.handleFotoError('error de foto');
    });
    expect(current.error).toBe('error de foto');

    act(() => {
      current.handleFotoChange({ file: 'base64', preview: 'data:image/png;base64' });
    });
    expect(current.formData.fotografiaFile).toBe('base64');
    expect(current.formData.fotografiaPreview).toBe('data:image/png;base64');
    expect(current.error).toBe('');
  });

  test('calculateFechaVigencia calcula la fecha final con 12 meses fijos', async () => {
    await mountHook();

    act(() => {
      current.handleInputChange({
        target: {
          name: 'fecha_inicio_membresia',
          value: '2025-01-01',
        },
      });
    });

    const result = current.calculateFechaVigencia();

    expect(result).toBe('2025-12-31');
  });

  test('handleNext aumenta el paso y marca los pasos tocados', async () => {
    await mountHook();

    act(() => {
      current.handleNext();
    });

    expect(current.currentStep).toBe(1);
    expect(current.touchedSteps).toContain(0);
    expect(current.fieldErrors).toBeTruthy();
  });

  test('handlePrev no disminuye por debajo de 0', async () => {
    await mountHook();

    act(() => {
      current.handlePrev();
    });

    expect(current.currentStep).toBe(0);
  });

  test('handleSubmit establece error cuando faltan pasos completos', async () => {
    await mountHook();

    await act(async () => {
      await current.handleSubmit();
    });

    expect(current.error).toBe('Debes completar todos los apartados antes de registrar al beneficiario');
    expect(current.loading).toBe(false);
  });

  test('handleInputChange con valvula campo boolean', async () => {
    await mountHook();

    act(() => {
      current.handleInputChange({ target: { name: 'valvula', value: 'true' } });
    });
    expect(current.formData.valvula).toBe(true);

    act(() => {
      current.handleInputChange({ target: { name: 'valvula', value: 'false' } });
    });
    expect(current.formData.valvula).toBe(false);
  });

  test('handleInputChange con CURP mayúscula y límite de 18 caracteres', async () => {
    await mountHook();

    act(() => {
      current.handleInputChange({ target: { name: 'CURP', value: 'pela900101hmclrr09extra' } });
    });
    expect(current.formData.CURP).toBe('PELA900101HMCLRR09');
    expect(current.formData.CURP.length).toBe(18);
  });

  test('handleBlur sin error borra el error existente', async () => {
    await mountHook();

    // Primero agrega un error
    act(() => {
      current.handleBlur({ target: { name: 'CURP', value: 'ABC' } });
    });
    expect(current.fieldErrors.CURP).toBe('CURP invalida');

    // Luego valida un CURP correcto
    act(() => {
      current.handleBlur({ target: { name: 'CURP', value: 'PELA900101HMCLRR09' } });
    });
    expect(current.fieldErrors.CURP).toBe('');
  });

  test('handleFotoChange con null limpia la fotografía', async () => {
    await mountHook();

    act(() => {
      current.handleFotoChange(null);
    });
    expect(current.formData.fotografiaFile).toBeNull();
    expect(current.formData.fotografiaPreview).toBe('');
  });

  test('handleFotoChange limpia errores previos', async () => {
    await mountHook();

    act(() => {
      current.handleFotoError('Error previo');
    });
    expect(current.error).toBe('Error previo');

    act(() => {
      current.handleFotoChange({ file: 'data', preview: 'preview' });
    });
    expect(current.error).toBe('');
  });

  test('calculateFechaVigencia con fecha inválida devuelve string vacío', async () => {
    await mountHook();

    act(() => {
      current.handleInputChange({ target: { name: 'fecha_inicio_membresia', value: 'invalid-date' } });
      current.handleInputChange({ target: { name: 'meses_membresia', value: '3' } });
    });

    const result = current.calculateFechaVigencia();
    expect(result).toBe('');
  });

  test('areAllStepsComplete y validateStep validan correctamente', async () => {
    await mountHook();

    const allComplete = current.areAllStepsComplete;
    const stepComplete = current.validateStep(0);

    expect(typeof allComplete).toBe('boolean');
    expect(typeof stepComplete).toBe('boolean');
  });

  test('handleInputChange en campo teléfono limita a 10 dígitos', async () => {
    await mountHook();

    act(() => {
      current.handleInputChange({ target: { name: 'padre_telefono', value: '5512345678901234' } });
    });
    expect(current.formData.padre_telefono).toBe('5512345678');
    expect(current.formData.padre_telefono.length).toBe(10);
  });
});

