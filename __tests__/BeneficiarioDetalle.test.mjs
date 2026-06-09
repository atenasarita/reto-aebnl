/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

global.fetch = jest.fn();
global.alert = jest.fn();

jest.mock('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/BeneficiarioDetalle.module.css',
  () => ({
    __esModule: true,
    default: new Proxy(
      {},
      {
        get: (_, prop) => String(prop),
      }
    ),
  })
);

const BeneficiarioDetalleModule = await import(
  '../client/src/components/layout/beneficiarios/BeneficiarioDetalle/BeneficiarioDetalle.jsx'
);

const BeneficiarioDetalle =
  BeneficiarioDetalleModule.default?.default ||
  BeneficiarioDetalleModule.default ||
  BeneficiarioDetalleModule;

let container;
let root;

const mockOnUpdated = jest.fn();
const mockOnClose = jest.fn();

const beneficiarioBase = {
  id_beneficiario: 10,
  folio: 'BEN-001',
  fecha_ingreso: '2026-01-15T00:00:00.000Z',
  genero: 'femenino',
  tipo_espina: [
    { nombre: 'Mielomeningocele' },
    { nombre: 'Lipomeningocele' },
  ],
  membresia: {
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
  },
  identificadores: {
    nombres: 'Ana',
    apellido_paterno: 'García',
    apellido_materno: 'López',
    CURP: 'GALA000101MNLXXX09',
    fecha_nacimiento: '2000-01-01T00:00:00.000Z',
    estado_nacimiento: 'Nuevo León',
    fotografia: '',
    telefono: '8112345678',
    email: 'ana@test.com',
  },
  datos_medicos: {
    tipo_sanguineo: 'O+',
    contacto_nombre: 'Laura García',
    contacto_telefono: '8199999999',
    contacto_parentesco: 'Madre',
    valvula: 1,
    hospital: 'Hospital Universitario',
  },
  direccion: {
    domicilio_calle: 'Calle 123',
    domicilio_cp: '64000',
    domicilio_ciudad: 'Monterrey',
    domicilio_estado: 'Nuevo León',
  },
};

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(message = 'Error al actualizar') {
  return {
    ok: false,
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

function getButton(text) {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes(text)
  );
}

function getInputByName(name) {
  return container.querySelector(`[name="${name}"]`);
}

async function mount(props = {}) {
  await act(async () => {
    root.render(
      React.createElement(BeneficiarioDetalle, {
        beneficiario: beneficiarioBase,
        onUpdated: mockOnUpdated,
        onClose: mockOnClose,
        ...props,
      })
    );
  });
}

describe('BeneficiarioDetalle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-04T12:00:00'));

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.fetch.mockReset();
    global.alert.mockReset();

    localStorage.clear();
    localStorage.setItem('token', 'token-123');

    global.fetch.mockResolvedValue(okResponse({ success: true }));
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    localStorage.clear();
    jest.useRealTimers();
  });

  test('muestra la información del beneficiario en modo lectura', async () => {
    await mount();

    expect(container.textContent).toContain('Beneficiario');
    expect(container.textContent).toContain('Ana García López');
    expect(container.textContent).toContain('GALA000101MNLXXX09');
    expect(container.textContent).toContain('BEN-001');
    expect(container.textContent).toContain('15/01/2026');
    expect(container.textContent).toContain('Nuevo León');
    expect(container.textContent).toContain('Monterrey');
    expect(container.textContent).toContain('ana@test.com');
    expect(container.textContent).toContain('8112345678');
  });

  test('calcula y muestra la edad del beneficiario', async () => {
    await mount();

    expect(container.textContent).toContain('Edad');
    expect(container.textContent).toContain('26');
  });

  test('muestra diagnóstico, válvula y fechas de membresía formateadas', async () => {
    await mount();

    expect(container.textContent).toContain('Mielomeningocele · Lipomeningocele');
    expect(container.textContent).toContain('Sí');
    expect(container.textContent).toContain('01/01/2026');
    expect(container.textContent).toContain('31/12/2026');
  });

  test('muestra iniciales cuando no hay fotografía', async () => {
    await mount();

    expect(container.textContent).toContain('AG');
  });

  test('muestra imagen cuando hay fotografía', async () => {
    await mount({
      beneficiario: {
        ...beneficiarioBase,
        identificadores: {
          ...beneficiarioBase.identificadores,
          fotografia: 'https://example.com/foto.png',
        },
      },
    });

    const img = container.querySelector('img[alt="Foto del beneficiario"]');

    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/foto.png');
  });

  test('no muestra botones de edición cuando startInEditMode es false', async () => {
    await mount();

    expect(getButton('Guardar')).toBeFalsy();
    expect(getButton('Cancelar')).toBeFalsy();
    expect(getInputByName('nombres')).toBeFalsy();
  });

  test('muestra inputs y botones cuando startInEditMode es true', async () => {
    await mount({ startInEditMode: true });

    expect(getInputByName('nombres')).toBeTruthy();
    expect(getInputByName('apellido_paterno')).toBeTruthy();
    expect(getInputByName('apellido_materno')).toBeTruthy();
    expect(getInputByName('CURP')).toBeTruthy();
    expect(getInputByName('fecha_nacimiento')).toBeTruthy();
    expect(getInputByName('genero')).toBeTruthy();

    expect(getButton('Guardar')).toBeTruthy();
    expect(getButton('Cancelar')).toBeTruthy();
  });

  test('permite editar campos del formulario', async () => {
    await mount({ startInEditMode: true });

    await act(async () => {
      changeInput(getInputByName('nombres'), 'María');
      changeInput(getInputByName('telefono'), '8188888888');
      changeInput(getInputByName('email'), 'maria@test.com');
      changeInput(getInputByName('domicilio_ciudad'), 'San Pedro');
    });

    expect(getInputByName('nombres').value).toBe('María');
    expect(getInputByName('telefono').value).toBe('8188888888');
    expect(getInputByName('email').value).toBe('maria@test.com');
    expect(getInputByName('domicilio_ciudad').value).toBe('San Pedro');
  });

  test('permite cambiar select de género y tipo sanguíneo', async () => {
    await mount({ startInEditMode: true });

    await act(async () => {
      changeInput(getInputByName('genero'), 'masculino');
      changeInput(getInputByName('tipo_sanguineo'), 'A+');
    });

    expect(getInputByName('genero').value).toBe('masculino');
    expect(getInputByName('tipo_sanguineo').value).toBe('A+');
  });

  test('cancelar revierte cambios y sale del modo edición', async () => {
    await mount({ startInEditMode: true });

    await act(async () => {
      changeInput(getInputByName('nombres'), 'Nombre editado');
    });

    expect(getInputByName('nombres').value).toBe('Nombre editado');

    await act(async () => {
      getButton('Cancelar').click();
    });

    expect(getInputByName('nombres')).toBeFalsy();
    expect(container.textContent).toContain('Ana García López');
  });

    test('guarda cambios correctamente con PUT y llama onUpdated y onClose', async () => {
    await mount({ startInEditMode: true });

    await act(async () => {
        changeInput(getInputByName('nombres'), 'María');
        changeInput(getInputByName('apellido_paterno'), 'Ramírez');
        changeInput(getInputByName('telefono'), '8188888888');
    });

    await act(async () => {
        getButton('Guardar').click();
    });

    expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/beneficiarios/10',
        expect.objectContaining({
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token-123',
        },
        body: expect.any(String),
        })
    );

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(body).toEqual(
        expect.objectContaining({
        nombres: 'María',
        apellido_paterno: 'Ramírez',
        telefono: '8188888888',
        })
    );

    expect(body).toEqual(
        expect.objectContaining({
        apellido_materno: 'López',
        CURP: 'GALA000101MNLXXX09',
        fecha_nacimiento: '2000-01-01',
        genero: 'femenino',
        email: 'ana@test.com',
        domicilio_ciudad: 'Monterrey',
        })
    );

    expect(mockOnUpdated).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
    expect(getButton('Guardar')).toBeFalsy();
    });

  test('muestra Guardando mientras se guarda', async () => {
    let resolver;

    global.fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      })
    );

    await mount({ startInEditMode: true });

    await act(async () => {
      getButton('Guardar').click();
    });

    expect(container.textContent).toContain('Guardando...');
    expect(getButton('Guardando...').disabled).toBe(true);
    expect(getButton('Cancelar').disabled).toBe(true);

    await act(async () => {
      resolver(okResponse({ success: true }));
    });
  });

  test('muestra alert si falla el guardado con mensaje del backend', async () => {
    global.fetch.mockResolvedValueOnce(errorResponse('CURP duplicada'));

    await mount({ startInEditMode: true });

    await act(async () => {
      getButton('Guardar').click();
    });

    expect(global.alert).toHaveBeenCalledWith('CURP duplicada');
    expect(mockOnUpdated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('muestra alert con mensaje default si el backend no manda message', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await mount({ startInEditMode: true });

    await act(async () => {
      getButton('Guardar').click();
    });

    expect(global.alert).toHaveBeenCalledWith('Error al actualizar beneficiario');
  });

  test('muestra No en válvula cuando valvula es 0, string 0 o false', async () => {
    await mount({
      beneficiario: {
        ...beneficiarioBase,
        datos_medicos: {
          ...beneficiarioBase.datos_medicos,
          valvula: 0,
        },
      },
    });

    expect(container.textContent).toContain('No');
  });

  test('muestra guion cuando válvula no tiene valor reconocido', async () => {
    await mount({
      beneficiario: {
        ...beneficiarioBase,
        datos_medicos: {
          ...beneficiarioBase.datos_medicos,
          valvula: null,
        },
      },
    });

    expect(container.textContent).toContain('—');
  });

  test('muestra guion cuando no hay diagnóstico', async () => {
    await mount({
      beneficiario: {
        ...beneficiarioBase,
        tipo_espina: [],
      },
    });

    expect(container.textContent).toContain('Diagnóstico');
    expect(container.textContent).toContain('—');
  });

  test('muestra guion para fechas inválidas o vacías', async () => {
    await mount({
      beneficiario: {
        ...beneficiarioBase,
        fecha_ingreso: '',
        membresia: {
          fecha_inicio: '',
          fecha_fin: '',
        },
        identificadores: {
          ...beneficiarioBase.identificadores,
          fecha_nacimiento: '',
        },
      },
    });

    expect(container.textContent).toContain('—');
  });

  test('actualiza el formulario cuando cambia el beneficiario recibido por props', async () => {
    await mount({ startInEditMode: true });

    expect(getInputByName('nombres').value).toBe('Ana');

    const nuevoBeneficiario = {
      ...beneficiarioBase,
      id_beneficiario: 20,
      folio: 'BEN-020',
      identificadores: {
        ...beneficiarioBase.identificadores,
        nombres: 'Luis',
        apellido_paterno: 'Pérez',
        apellido_materno: '',
        CURP: 'PELU000101HNLXXX09',
      },
    };

    await act(async () => {
      root.render(
        React.createElement(BeneficiarioDetalle, {
          beneficiario: nuevoBeneficiario,
          startInEditMode: true,
          onUpdated: mockOnUpdated,
          onClose: mockOnClose,
        })
      );
    });

    expect(getInputByName('nombres').value).toBe('Luis');
    expect(getInputByName('apellido_paterno').value).toBe('Pérez');
    expect(getInputByName('CURP').value).toBe('PELU000101HNLXXX09');
  });

  test('cambia modo edición cuando cambia startInEditMode', async () => {
    await mount({ startInEditMode: false });

    expect(getButton('Guardar')).toBeFalsy();

    await act(async () => {
      root.render(
        React.createElement(BeneficiarioDetalle, {
          beneficiario: beneficiarioBase,
          startInEditMode: true,
          onUpdated: mockOnUpdated,
          onClose: mockOnClose,
        })
      );
    });

    expect(getButton('Guardar')).toBeTruthy();
  });

  test('funciona aunque no se pasen onUpdated ni onClose', async () => {
    await act(async () => {
      root.render(
        React.createElement(BeneficiarioDetalle, {
          beneficiario: beneficiarioBase,
          startInEditMode: true,
        })
      );
    });

    await act(async () => {
      getButton('Guardar').click();
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});