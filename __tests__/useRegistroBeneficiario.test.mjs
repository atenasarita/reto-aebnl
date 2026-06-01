/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

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

  test('calculateFechaVigencia calcula la fecha final del periodo', async () => {
    await mountHook();

    act(() => {
      current.handleInputChange({ target: { name: 'fecha_inicio_membresia', value: '2025-01-01' } });
      current.handleInputChange({ target: { name: 'meses_membresia', value: '3' } });
    });

    const result = current.calculateFechaVigencia();
    expect(result).toBe('2025-03-31');
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
});
