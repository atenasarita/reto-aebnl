/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockCrearServicioCatalogo = jest.fn();

jest.mock('../client/src/services/serviciosService', () => ({
  __esModule: true,
  crearServicioCatalogo: (...args) => mockCrearServicioCatalogo(...args),
}));

jest.mock('../client/src/services/serviciosService.js', () => ({
  __esModule: true,
  crearServicioCatalogo: (...args) => mockCrearServicioCatalogo(...args),
}));

jest.mock(
  '../client/src/components/layout/inventario/InventarioModalShell/InventarioModalShell.jsx',
  () => ({
    __esModule: true,
    default: ({ open, onClose, title, subtitle, children }) => {
      if (!open) return null;

      return React.createElement(
        'div',
        { role: 'dialog', 'aria-label': title },
        React.createElement('h2', null, title),
        React.createElement('p', null, subtitle),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'modal-close',
            onClick: onClose,
          },
          'Cerrar'
        ),
        children
      );
    },
  })
);

jest.mock(
  '../client/src/components/layout/servicios/ServiciosComponents.css',
  () => ({})
);

const ModalModule = await import(
  '../client/src/components/layout/servicios/Navegacion/Serviciosnuevoserviciomodal.jsx'
);

const ServiciosNuevoServicioModal =
  ModalModule.default?.default || ModalModule.default || ModalModule;

let container;
let root;

const mockOnClose = jest.fn();
const mockOnExito = jest.fn();
const mockOnNuevaCategoria = jest.fn();

const categorias = ['Consulta', 'Terapia', 'Rehabilitación'];

const serviciosExistentes = [
  {
    id: 1,
    nombre: 'Consulta general',
    categoria: 'Consulta',
    precio: 500,
  },
  {
    id: 2,
    nombre: 'Terapia física',
    categoria: 'Terapia',
    precio: 700,
  },
];

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

async function mount(props = {}) {
  await act(async () => {
    root.render(
      React.createElement(ServiciosNuevoServicioModal, {
        open: true,
        onClose: mockOnClose,
        onExito: mockOnExito,
        onNuevaCategoria: mockOnNuevaCategoria,
        categorias,
        serviciosExistentes,
        ...props,
      })
    );
  });
}

async function submitForm() {
  await act(async () => {
    const form = container.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

async function llenarNombrePrecioCategoria({
  nombre = 'Consulta neurológica',
  precio = '600',
  categoria = 'Consulta',
} = {}) {
  await act(async () => {
    changeInput(container.querySelector('input[name="nombre"]'), nombre);
    changeInput(container.querySelector('input[name="precio"]'), precio);
  });

  await act(async () => {
    getButton(categoria).click();
  });
}

describe('ServiciosNuevoServicioModal', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    mockCrearServicioCatalogo.mockResolvedValue({
      id_catalogo_servicio: 10,
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

  test('no renderiza nada cuando open es false', async () => {
    await act(async () => {
      root.render(
        React.createElement(ServiciosNuevoServicioModal, {
          open: false,
          onClose: mockOnClose,
          onExito: mockOnExito,
          categorias,
          serviciosExistentes,
        })
      );
    });

    expect(container.textContent).toBe('');
    expect(container.querySelector('[role="dialog"]')).toBeFalsy();
  });

  test('muestra el modal con campos iniciales cuando open es true', async () => {
    await mount();

    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    expect(container.textContent).toContain('Registrar nuevo servicio');
    expect(container.textContent).toContain('Alta en el catálogo');
    expect(container.textContent).toContain('Nombre del servicio');
    expect(container.textContent).toContain('Categoría');
    expect(container.textContent).toContain('Precio');

    expect(container.querySelector('input[name="nombre"]').value).toBe('');
    expect(container.querySelector('input[name="precio"]').value).toBe('');
  });

  test('cierra el modal con el botón Cancelar', async () => {
    await mount();

    await act(async () => {
      getButton('Cancelar').click();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('muestra error si se intenta guardar sin nombre', async () => {
    await mount();

    await act(async () => {
      getButton('Consulta').click();
      changeInput(container.querySelector('input[name="precio"]'), '500');
    });

    await submitForm();

    expect(container.textContent).toContain('Ingresa el nombre del servicio.');
    expect(mockCrearServicioCatalogo).not.toHaveBeenCalled();
  });

  test('muestra error si se intenta guardar sin categoría', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('input[name="nombre"]'), 'Consulta neurológica');
      changeInput(container.querySelector('input[name="precio"]'), '500');
    });

    await submitForm();

    expect(container.textContent).toContain('Selecciona una categoría.');
    expect(mockCrearServicioCatalogo).not.toHaveBeenCalled();
  });

  test('muestra error si el precio está vacío o es inválido', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('input[name="nombre"]'), 'Consulta neurológica');
      getButton('Consulta').click();
      changeInput(container.querySelector('input[name="precio"]'), '-10');
    });

    await submitForm();

    expect(container.textContent).toContain('Indica un precio válido.');
    expect(mockCrearServicioCatalogo).not.toHaveBeenCalled();
  });

  test('guarda correctamente un servicio nuevo', async () => {
    await mount();

    await llenarNombrePrecioCategoria({
      nombre: 'Consulta neurológica',
      precio: '600',
      categoria: 'Consulta',
    });

    await submitForm();

    expect(mockCrearServicioCatalogo).toHaveBeenCalledWith({
      nombre: 'Consulta neurológica',
      categoria: 'Consulta',
      precio: 600,
    });

    expect(mockOnExito).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('muestra Guardando mientras se está enviando el formulario', async () => {
    let resolver;
    mockCrearServicioCatalogo.mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      })
    );

    await mount();

    await llenarNombrePrecioCategoria();

    await act(async () => {
      const form = container.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain('Guardando…');
    expect(getButton('Guardando…').disabled).toBe(true);

    await act(async () => {
      resolver({ id_catalogo_servicio: 10 });
    });
  });

  test('muestra error si el servicio no se puede guardar', async () => {
    mockCrearServicioCatalogo.mockRejectedValueOnce(
      new Error('Error al guardar servicio')
    );

    await mount();

    await llenarNombrePrecioCategoria();

    await submitForm();

    expect(container.textContent).toContain('Error al guardar servicio');
    expect(mockOnExito).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('muestra error del backend si viene en err.response.data.message', async () => {
    mockCrearServicioCatalogo.mockRejectedValueOnce({
      response: {
        data: {
          message: 'El servicio ya existe',
        },
      },
    });

    await mount();

    await llenarNombrePrecioCategoria();

    await submitForm();

    expect(container.textContent).toContain('El servicio ya existe');
  });

  test('muestra sugerencia cuando el nombre del servicio es similar a uno existente', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('input[name="nombre"]'), 'Consulta generl');
    });

    expect(container.textContent).toContain('¿Quisiste decir');
    expect(container.textContent).toContain('Consulta general');
  });

  test('aplica la sugerencia de nombre al hacer click', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('input[name="nombre"]'), 'Consulta generl');
    });

    await act(async () => {
      getButton('Consulta general').click();
    });

    expect(container.querySelector('input[name="nombre"]').value).toBe('Consulta general');
    expect(container.textContent).not.toContain('¿Quisiste decir');
  });

  test('muestra el campo para agregar nueva categoría', async () => {
    await mount();

    await act(async () => {
      getButton('+ Nueva').click();
    });

    expect(container.querySelector('input[placeholder="Nombre de nueva categoría"]')).toBeTruthy();
  });

  test('agrega una nueva categoría y la selecciona', async () => {
    await mount();

    await act(async () => {
      getButton('+ Nueva').click();
    });

    const nuevaCatInput = container.querySelector(
      'input[placeholder="Nombre de nueva categoría"]'
    );

    await act(async () => {
      changeInput(nuevaCatInput, 'Psicología');
    });

    await act(async () => {
      getButton('Agregar').click();
    });

    expect(mockOnNuevaCategoria).toHaveBeenCalledWith('Psicología');
    expect(container.textContent).toContain('Psicología');

    await act(async () => {
      changeInput(container.querySelector('input[name="nombre"]'), 'Consulta psicológica');
      changeInput(container.querySelector('input[name="precio"]'), '800');
    });

    await submitForm();

    expect(mockCrearServicioCatalogo).toHaveBeenCalledWith({
      nombre: 'Consulta psicológica',
      categoria: 'Psicología',
      precio: 800,
    });
  });

  test('no agrega categoría vacía', async () => {
    await mount();

    await act(async () => {
      getButton('+ Nueva').click();
    });

    await act(async () => {
      getButton('Agregar').click();
    });

    expect(mockOnNuevaCategoria).not.toHaveBeenCalled();
  });

  test('muestra error si se intenta agregar categoría duplicada', async () => {
    await mount();

    await act(async () => {
      getButton('+ Nueva').click();
    });

    const nuevaCatInput = container.querySelector(
      'input[placeholder="Nombre de nueva categoría"]'
    );

    await act(async () => {
      changeInput(nuevaCatInput, 'consulta');
    });

    await act(async () => {
      getButton('Agregar').click();
    });

    expect(container.textContent).toContain('Esa categoría ya existe.');
    expect(mockOnNuevaCategoria).not.toHaveBeenCalled();
  });

  test('muestra sugerencia cuando la nueva categoría es similar a una existente', async () => {
    await mount();

    await act(async () => {
      getButton('+ Nueva').click();
    });

    const nuevaCatInput = container.querySelector(
      'input[placeholder="Nombre de nueva categoría"]'
    );

    await act(async () => {
      changeInput(nuevaCatInput, 'Terapiaa');
    });

    expect(container.textContent).toContain('¿Quisiste decir');
    expect(container.textContent).toContain('Terapia');
  });

  test('selecciona la categoría sugerida al hacer click en la sugerencia', async () => {
    await mount();

    await act(async () => {
      getButton('+ Nueva').click();
    });

    const nuevaCatInput = container.querySelector(
      'input[placeholder="Nombre de nueva categoría"]'
    );

    await act(async () => {
      changeInput(nuevaCatInput, 'Terapiaa');
    });

    await act(async () => {
      getButton('Terapia').click();
    });

    await act(async () => {
      changeInput(container.querySelector('input[name="nombre"]'), 'Servicio de terapia');
      changeInput(container.querySelector('input[name="precio"]'), '700');
    });

    await submitForm();

    expect(mockCrearServicioCatalogo).toHaveBeenCalledWith({
      nombre: 'Servicio de terapia',
      categoria: 'Terapia',
      precio: 700,
    });
  });

  test('agrega nueva categoría al presionar Enter', async () => {
    await mount();

    await act(async () => {
      getButton('+ Nueva').click();
    });

    const nuevaCatInput = container.querySelector(
      'input[placeholder="Nombre de nueva categoría"]'
    );

    await act(async () => {
      changeInput(nuevaCatInput, 'Neurología');
      nuevaCatInput.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(mockOnNuevaCategoria).toHaveBeenCalledWith('Neurología');
    expect(container.textContent).toContain('Neurología');
  });

  test('resetea el formulario cuando el modal se vuelve a abrir', async () => {
    await mount();

    await act(async () => {
      changeInput(container.querySelector('input[name="nombre"]'), 'Servicio temporal');
      changeInput(container.querySelector('input[name="precio"]'), '999');
      getButton('Consulta').click();
    });

    expect(container.querySelector('input[name="nombre"]').value).toBe('Servicio temporal');

    await act(async () => {
      root.render(
        React.createElement(ServiciosNuevoServicioModal, {
          open: false,
          onClose: mockOnClose,
          onExito: mockOnExito,
          categorias,
          serviciosExistentes,
        })
      );
    });

    await act(async () => {
      root.render(
        React.createElement(ServiciosNuevoServicioModal, {
          open: true,
          onClose: mockOnClose,
          onExito: mockOnExito,
          categorias,
          serviciosExistentes,
        })
      );
    });

    expect(container.querySelector('input[name="nombre"]').value).toBe('');
    expect(container.querySelector('input[name="precio"]').value).toBe('');
  });
});
