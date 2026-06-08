/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

global.fetch = jest.fn();

const mockFetchSiguienteFolio = jest.fn();
const mockCreateBeneficiario = jest.fn();
const mockBuildBeneficiarioPayload = jest.fn();
const mockValidateStep = jest.fn();

jest.unstable_mockModule('../client/src/services/beneficiariosService.js', () => ({
  fetchSiguienteFolio: mockFetchSiguienteFolio,
  createBeneficiario: mockCreateBeneficiario,
}));

jest.unstable_mockModule('../client/src/utils/config.js', () => ({
  API_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule('../client/src/utils/dateTime.js', () => ({
  todayDate: () => '2026-06-03',
}));

jest.unstable_mockModule('../client/src/utils/validator.js', () => ({
  limpiarSoloLetras: (value) => value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, ''),
  telefonoValido: () => true,
}));

jest.unstable_mockModule('../client/src/utils/beneficiarioConstants.js', () => ({
  registroSteps: ['datos', 'contacto'],
  initialFormData: () => ({
    nombres: 'Ana',
    apellido_paterno: 'López',
    CURP: 'LOAA000101MNLXXX09',
    telefono: '8112345678',
    fecha_inicio_membresia: '2026-06-03',
    meses_membresia: '6',
    tipo_espinas: [1],
    fotografiaFile: null,
    fotografiaPreview: '',
    fotografia: '',
  }),
}));

jest.unstable_mockModule('../client/src/utils/beneficiarioValidation.js', () => ({
  validateField: jest.fn(() => ''),
  validateStepFields: jest.fn(() => ({})),
  validateStep: (...args) => mockValidateStep(...args),
}));

jest.unstable_mockModule('../client/src/utils/beneficiarioPayload.js', () => ({
  buildBeneficiarioPayload: (...args) => mockBuildBeneficiarioPayload(...args),
}));

const { useRegistroBeneficiario } = await import(
  '../client/src/hooks/useRegistroBeneficiario.js'
);

let current;
let container;
let root;

function HookTest() {
  current = useRegistroBeneficiario();
  return null;
}

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(data, status = 400) {
  return {
    ok: false,
    status,
    json: async () => data,
  };
}

describe('useRegistroBeneficiario submit', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    localStorage.setItem('token', 'token-123');

    jest.clearAllMocks();
    global.fetch.mockReset();

    mockFetchSiguienteFolio.mockResolvedValue('FOLIO-001');
    mockCreateBeneficiario.mockResolvedValue({ id_beneficiario: 1 });
    mockBuildBeneficiarioPayload.mockReturnValue({
      nombres: 'Ana',
      apellido_paterno: 'López',
      fotografia: '',
    });
    mockValidateStep.mockReturnValue(true);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });

    container.remove();
    localStorage.clear();
    current = null;
  });

  async function mountHook() {
    await act(async () => {
      root.render(React.createElement(HookTest));
    });
  }

  test('carga el folio inicial correctamente', async () => {
    await mountHook();

    expect(mockFetchSiguienteFolio).toHaveBeenCalledWith('token-123');
    expect(current.folio).toBe('FOLIO-001');
  });

  test('muestra error si falla la carga del folio', async () => {
    mockFetchSiguienteFolio.mockRejectedValueOnce(new Error('No se pudo cargar folio'));

    await mountHook();

    expect(current.error).toBe('No se pudo cargar folio');
  });

  test('registra beneficiario correctamente sin fotografía', async () => {
    await mountHook();

    await act(async () => {
      current.setFechaNacimiento('2000-01-01');
    });

    await act(async () => {
      await current.handleSubmit();
    });

    expect(mockBuildBeneficiarioPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        fotografia: '',
      }),
      '2026-06-03',
      '2000-01-01'
    );

    expect(mockCreateBeneficiario).toHaveBeenCalledWith(
      {
        nombres: 'Ana',
        apellido_paterno: 'López',
        fotografia: '',
      },
      'token-123'
    );

    expect(current.beneficiarioCreado).toEqual({ id_beneficiario: 1 });
    expect(current.showSuccessModal).toBe(true);
    expect(current.loading).toBe(false);
    expect(current.error).toBe('');
  });

  test('sube fotografía antes de registrar beneficiario', async () => {
    global.fetch.mockResolvedValueOnce(
      okResponse({
        ruta: '/uploads/foto-beneficiario.png',
      })
    );

    await mountHook();

    await act(async () => {
      current.handleFotoChange({
        file: new File(['foto'], 'foto.png', { type: 'image/png' }),
        preview: 'data:image/png;base64,foto',
      });
      current.setFechaNacimiento('2000-01-01');
    });

    await act(async () => {
      await current.handleSubmit();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/beneficiarios/upload-foto',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer token-123',
        },
        body: expect.any(FormData),
      })
    );

    expect(mockBuildBeneficiarioPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        fotografia: '/uploads/foto-beneficiario.png',
      }),
      '2026-06-03',
      '2000-01-01'
    );

    expect(current.formData.fotografiaFile).toBeNull();
    expect(current.formData.fotografiaPreview).toBe('');
    expect(current.formData.fotografia).toBe('/uploads/foto-beneficiario.png');
    expect(current.showSuccessModal).toBe(true);
  });

  test('muestra error si falla la subida de fotografía', async () => {
    global.fetch.mockResolvedValueOnce(
      errorResponse({
        message: 'Error al subir imagen',
      })
    );

    await mountHook();

    await act(async () => {
      current.handleFotoChange({
        file: new File(['foto'], 'foto.png', { type: 'image/png' }),
        preview: 'preview',
      });
    });

    await act(async () => {
      await current.handleSubmit();
    });

    expect(current.error).toBe('Error al subir imagen');
    expect(mockCreateBeneficiario).not.toHaveBeenCalled();
    expect(current.loading).toBe(false);
  });

  test('muestra el primer error cuando createBeneficiario lanza JSON string', async () => {
    mockCreateBeneficiario.mockRejectedValueOnce(
      new Error(
        JSON.stringify({
          CURP: ['La CURP ya está registrada'],
          telefono: ['Teléfono inválido'],
        })
      )
    );

    await mountHook();

    await act(async () => {
      await current.handleSubmit();
    });

    expect(current.error).toBe('La CURP ya está registrada');
    expect(current.showSuccessModal).toBe(false);
    expect(current.loading).toBe(false);
  });

  test('muestra error normal cuando createBeneficiario falla sin JSON', async () => {
    mockCreateBeneficiario.mockRejectedValueOnce(
      new Error('Error inesperado del servidor')
    );

    await mountHook();

    await act(async () => {
      await current.handleSubmit();
    });

    expect(current.error).toBe('Error inesperado del servidor');
    expect(current.showSuccessModal).toBe(false);
    expect(current.loading).toBe(false);
  });

  test('NO registra si los pasos están incompletos', async () => {
    mockValidateStep.mockReturnValue(false); // simula pasos incompletos
    await mountHook();

    await act(async () => {
        await current.handleSubmit();
    });

    expect(mockCreateBeneficiario).not.toHaveBeenCalled();
    expect(current.error).toBe('Debes completar todos los apartados antes de registrar al beneficiario');
    });
});