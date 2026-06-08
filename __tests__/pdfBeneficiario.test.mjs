/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock jsPDF
const mockDoc = {
  setLineWidth: jest.fn(),
  setDrawColor: jest.fn(),
  setFillColor: jest.fn(),
  setTextColor: jest.fn(),
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  line: jest.fn(),
  rect: jest.fn(),
  addImage: jest.fn(),
  text: jest.fn(),
  splitTextToSize: jest.fn((text, _) => [text]),
  save: jest.fn(),
};

jest.unstable_mockModule('jspdf', () => ({
  jsPDF: jest.fn(() => mockDoc),
}));

jest.unstable_mockModule('jsbarcode', () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule('../client/src/assets/aebnl_vertical.png', () => ({
  default: 'aebnl_vertical.png',
}));

const { downloadBeneficiarioPdf } = await import('../client/src/utils/pdfFormatMembresia.js');

const mockDataCompleto = {
  folio: 'FOLIO-001',
  fecha_ingreso: '2024-01-15',
  tipo_espina: [{ nombre: 'Mielomeningocele' }, { nombre: 'Hidrocefalia' }],
  identificadores: {
    nombres: 'Juan Pablo',
    apellido_paterno: 'García',
    apellido_materno: 'López',
    fecha_nacimiento: '2000-05-20',
    estado_nacimiento: 'Nuevo León',
    telefono: '8112345678',
    email: 'juan@example.com',
    fotografia: null,
  },
  datos_medicos: {
    tipo_sanguineo: 'O+',
    contacto_nombre: 'María García',
    contacto_telefono: '8119876543',
    valvula: true,
    hospital: 'Hospital Universitario',
  },
  direccion: {
    domicilio_calle: 'Av. Principal 123',
    domicilio_cp: '64000',
    domicilio_ciudad: 'Monterrey',
    domicilio_estado: 'Nuevo León',
  },
  padres: [
    { nombre_completo: 'Carlos García' },
    { nombre_completo: 'Ana López' },
  ],
};

describe('downloadBeneficiarioPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.splitTextToSize.mockImplementation((text, _) => [text]);
  });

  // ── Generación básica ─────────────────────────────────────────
  test('genera el PDF y llama a save con el folio correcto', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    expect(mockDoc.save).toHaveBeenCalledWith('Beneficiario_FOLIO-001.pdf');
  });

  test('usa el id cuando no hay folio', () => {
    const datasinFolio = { ...mockDataCompleto, folio: null };
    downloadBeneficiarioPdf(datasinFolio, '42');
    expect(mockDoc.save).toHaveBeenCalledWith('Beneficiario_42.pdf');
  });

  test('crea una instancia de jsPDF con configuración landscape', async () => {
    const { jsPDF } = await import('jspdf');
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'l',
      unit: 'mm',
      format: [190, 65],
    });
  });

  // ── Contenido del PDF ─────────────────────────────────────────
  test('escribe el nombre completo del beneficiario', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('Juan Pablo García López');
  });

  test('escribe el folio en el PDF', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('FOLIO-001');
  });

  test('escribe el diagnóstico concatenado', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('Mielomeningocele, Hidrocefalia');
  });

  test('escribe SI cuando válvula es true', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('SI');
  });

  test('escribe NO cuando válvula es false', () => {
    const data = { ...mockDataCompleto, datos_medicos: { ...mockDataCompleto.datos_medicos, valvula: false } };
    downloadBeneficiarioPdf(data, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('NO');
  });

  test('escribe NO cuando válvula es 0', () => {
    const data = { ...mockDataCompleto, datos_medicos: { ...mockDataCompleto.datos_medicos, valvula: 0 } };
    downloadBeneficiarioPdf(data, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('NO');
  });

  test('escribe SI cuando válvula es 1', () => {
    const data = { ...mockDataCompleto, datos_medicos: { ...mockDataCompleto.datos_medicos, valvula: 1 } };
    downloadBeneficiarioPdf(data, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('SI');
  });

  test('escribe los nombres de los padres', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('Carlos García');
  });

  test('usa contacto_nombre cuando no hay padres', () => {
    const data = { ...mockDataCompleto, padres: [] };
    downloadBeneficiarioPdf(data, '1');
    const textCalls = mockDoc.text.mock.calls.map(c => c[0]).join(' ');
    expect(textCalls).toContain('María García');
  });

  // ── Datos vacíos / nulos ──────────────────────────────────────
  test('funciona con datos mínimos sin crash', () => {
    const dataMinima = {
      folio: 'MIN-001',
      identificadores: {},
      datos_medicos: {},
      direccion: {},
      padres: [],
    };
    expect(() => downloadBeneficiarioPdf(dataMinima, '1')).not.toThrow();
  });

  test('maneja tipo_espina vacío sin crash', () => {
    const data = { ...mockDataCompleto, tipo_espina: [] };
    expect(() => downloadBeneficiarioPdf(data, '1')).not.toThrow();
  });

  test('maneja fecha_ingreso nula', () => {
    const data = { ...mockDataCompleto, fecha_ingreso: null };
    expect(() => downloadBeneficiarioPdf(data, '1')).not.toThrow();
    expect(mockDoc.save).toHaveBeenCalled();
  });

  test('maneja fecha_nacimiento nula', () => {
    const data = {
      ...mockDataCompleto,
      identificadores: { ...mockDataCompleto.identificadores, fecha_nacimiento: null },
    };
    expect(() => downloadBeneficiarioPdf(data, '1')).not.toThrow();
  });

  // ── Imagen / fotografía ───────────────────────────────────────
  test('intenta agregar imagen cuando hay fotografía', () => {
    const data = {
      ...mockDataCompleto,
      identificadores: { ...mockDataCompleto.identificadores, fotografia: 'data:image/jpeg;base64,abc' },
    };
    downloadBeneficiarioPdf(data, '1');
    expect(mockDoc.addImage).toHaveBeenCalled();
  });

  test('dibuja rectángulo gris cuando no hay fotografía', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    expect(mockDoc.rect).toHaveBeenCalled();
  });

  test('maneja error al agregar imagen sin crash', () => {
    mockDoc.addImage.mockImplementationOnce(() => { throw new Error('Image error'); });
    const data = {
      ...mockDataCompleto,
      identificadores: { ...mockDataCompleto.identificadores, fotografia: 'data:image/jpeg;base64,abc' },
    };
    expect(() => downloadBeneficiarioPdf(data, '1')).not.toThrow();
    expect(mockDoc.save).toHaveBeenCalled();
  });

  // ── Dirección ─────────────────────────────────────────────────
  test('construye la dirección completa con CP', () => {
    downloadBeneficiarioPdf(mockDataCompleto, '1');
    expect(mockDoc.splitTextToSize).toHaveBeenCalled();
  });

  test('funciona sin CP en dirección', () => {
    const data = {
      ...mockDataCompleto,
      direccion: { ...mockDataCompleto.direccion, domicilio_cp: null },
    };
    expect(() => downloadBeneficiarioPdf(data, '1')).not.toThrow();
  });
});
