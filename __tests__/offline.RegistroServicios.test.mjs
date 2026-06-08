/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockRegistrar = jest.fn();
const mockFetchSaldo = jest.fn();
const mockFetchDonadores = jest.fn();

let mockBeneficiarios;
let mockAgendaItems;
let mockTipos;
let mockProductos;
let mockDonadores;
let mockSaldoFondo;
let mockGuardando;

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  Search: () => React.createElement('span', { 'data-testid': 'icon-search' }),
  ClipboardList: () => React.createElement('span', { 'data-testid': 'icon-clipboard' }),
  Package: () => React.createElement('span', { 'data-testid': 'icon-package' }),
  Wallet: () => React.createElement('span', { 'data-testid': 'icon-wallet' }),
  ChevronRight: () => React.createElement('span', { 'data-testid': 'icon-right' }),
  ChevronLeft: () => React.createElement('span', { 'data-testid': 'icon-left' }),
  CheckCircle2: () => React.createElement('span', { 'data-testid': 'icon-check' }),
  CloudOff: () => React.createElement('span', { 'data-testid': 'icon-cloud-off' }),
}));

jest.mock('../client/src/pages/styles/RegistroServicio.css', () => ({}));

jest.mock('../client/src/hooks/useBeneficiarios', () => ({
  __esModule: true,
  default: () => ({
    data: mockBeneficiarios,
    loading: false,
  }),
}));

jest.mock('../client/src/hooks/useCitasHoy', () => ({
  __esModule: true,
  default: () => ({
    agendaItems: mockAgendaItems,
    loading: false,
  }),
}));

jest.mock('../client/src/hooks/useServicios', () => ({
  __esModule: true,
  default: () => ({
    tipos: mockTipos,
    loading: false,
  }),
}));

jest.mock('../client/src/hooks/useProductos', () => ({
  __esModule: true,
  useProductos: () => ({
    productos: mockProductos,
    loading: false,
    error: null,
  }),
}));

jest.mock('../client/src/hooks/useRegistrarServicios', () => ({
  __esModule: true,
  default: () => ({
    registrar: mockRegistrar,
    loading: mockGuardando,
  }),
}));

jest.mock('../client/src/hooks/useFondoDonaciones', () => ({
  __esModule: true,
  default: () => ({
    saldo: mockSaldoFondo,
    donadores: mockDonadores,
    fetchSaldo: mockFetchSaldo,
    fetchDonadores: mockFetchDonadores,
  }),
}));

jest.mock('../client/src/components/layout/servicios/Registro/StepBusqueda.jsx', () => {
  return {
    __esModule: true,
    default: ({
      query,
      setQuery,
      resultados,
      beneficiarioSeleccionado,
      setBeneficiarioSeleccionado,
      CITAS_HOY,
      citaSeleccionada,
      setCitaSeleccionada,
    }) => {
      return React.createElement(
        'section',
        { 'data-testid': 'step-busqueda' },
        React.createElement('h2', null, 'Paso búsqueda'),
        React.createElement('input', {
          'data-testid': 'busqueda-input',
          value: query,
          onChange: (event) => setQuery(event.target.value),
        }),
        React.createElement(
          'div',
          { 'data-testid': 'resultados' },
          resultados.map((b) =>
            React.createElement(
              'button',
              {
                key: b.folio,
                type: 'button',
                'data-testid': `beneficiario-${b.folio}`,
                onClick: () => {
                  setBeneficiarioSeleccionado(b.folio);
                  setCitaSeleccionada(null);
                },
              },
              `${b.nombre} ${beneficiarioSeleccionado === b.folio ? 'seleccionado' : ''}`
            )
          )
        ),
        React.createElement(
          'div',
          { 'data-testid': 'citas-hoy' },
          CITAS_HOY.map((c) =>
            React.createElement(
              'button',
              {
                key: c.id,
                type: 'button',
                'data-testid': `cita-${c.id}`,
                onClick: () => {
                  setCitaSeleccionada(c.id);
                  setBeneficiarioSeleccionado(null);
                },
              },
              `${c.nombre} ${citaSeleccionada === c.id ? 'seleccionada' : ''}`
            )
          )
        )
    )},
  };
});

jest.mock('../client/src/components/layout/servicios/Registro/StepDetalles.jsx', () => {
  return {
    __esModule: true,
    default: ({
      fecha,
      setFecha,
      hora,
      setHora,
      categoriaServicio,
      setCategoriaServicio,
      tipoServicio,
      setTipoServicio,
      categoriasOptions,
      tiposOptions,
      notas,
      setNotas,
    }) =>
      React.createElement(
        'section',
        { 'data-testid': 'step-detalles' },
        React.createElement('h2', null, 'Paso detalles'),
        React.createElement('input', {
          'data-testid': 'fecha-input',
          type: 'date',
          value: fecha,
          onChange: (event) => setFecha(event.target.value),
        }),
        React.createElement('input', {
          'data-testid': 'hora-input',
          type: 'time',
          value: hora,
          onChange: (event) => setHora(event.target.value),
        }),
        React.createElement(
          'select',
          {
            'data-testid': 'categoria-select',
            value: categoriaServicio,
            onChange: (event) => setCategoriaServicio(event.target.value),
          },
          categoriasOptions.map((option) =>
            React.createElement('option', { key: option.value, value: option.value }, option.label)
          )
        ),
        React.createElement(
          'select',
          {
            'data-testid': 'servicio-select',
            value: tipoServicio,
            onChange: (event) => setTipoServicio(event.target.value),
          },
          React.createElement('option', { value: '' }, 'Seleccionar servicio'),
          tiposOptions.map((option) =>
            React.createElement('option', { key: option.value, value: option.value }, option.label)
          )
        ),
        React.createElement('textarea', {
          'data-testid': 'notas-input',
          value: notas,
          onChange: (event) => setNotas(event.target.value),
        })
      ),
  };
});

jest.mock('../client/src/components/layout/servicios/Registro/StepInsumos.jsx', () => {
  return {
    __esModule: true,
    default: ({ insumos, setInsumos, productos }) =>
      React.createElement(
        'section',
        { 'data-testid': 'step-insumos' },
        React.createElement('h2', null, 'Paso insumos'),
        React.createElement('p', null, `Insumos seleccionados: ${insumos.length}`),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'agregar-insumo',
            onClick: () =>
              setInsumos([
                ...insumos,
                {
                  id: productos[0]?.id ?? 1,
                  nombre: productos[0]?.nombre ?? 'Sonda',
                  precio: productos[0]?.precio ?? 100,
                  cantidad: 2,
                },
              ]),
          },
          'Agregar insumo'
        )
      ),
  };
});

jest.mock('../client/src/components/layout/servicios/Registro/StepFinanzas.jsx', () => {
  return {
    __esModule: true,
    default: ({
      total,
      totalConDescuento,
      saldo,
      saldoGlobal,
      donadores,
      fondoSeleccionado,
      setFondoSeleccionado,
      metodoPago,
      setMetodoPago,
      montoPagado,
      setMontoPagado,
      montoDonacion,
      setMontoDonacion,
      descuento,
      setDescuento,
      yaAporto,
      setYaAporto,
    }) =>
      React.createElement(
        'section',
        { 'data-testid': 'step-finanzas' },
        React.createElement('h2', null, 'Paso finanzas'),
        React.createElement('p', { 'data-testid': 'total' }, `Total: ${total}`),
        React.createElement('p', { 'data-testid': 'total-descuento' }, `Total descuento: ${totalConDescuento}`),
        React.createElement('p', { 'data-testid': 'saldo' }, `Saldo: ${saldo}`),
        React.createElement('p', { 'data-testid': 'saldo-global' }, `Saldo global: ${saldoGlobal}`),
        React.createElement('input', {
          'data-testid': 'monto-pagado',
          value: montoPagado,
          onChange: (event) => setMontoPagado(event.target.value),
        }),
        React.createElement('input', {
          'data-testid': 'monto-donacion',
          value: montoDonacion,
          onChange: (event) => setMontoDonacion(event.target.value),
        }),
        React.createElement('input', {
          'data-testid': 'descuento',
          value: descuento,
          onChange: (event) => setDescuento(event.target.value),
        }),
        React.createElement(
          'select',
          {
            'data-testid': 'metodo-pago',
            value: metodoPago,
            onChange: (event) => setMetodoPago(event.target.value),
          },
          React.createElement('option', { value: '' }, 'Seleccionar método'),
          React.createElement('option', { value: 'efectivo' }, 'Efectivo'),
          React.createElement('option', { value: 'tarjeta' }, 'Tarjeta')
        ),
        React.createElement(
          'select',
          {
            'data-testid': 'fondo-select',
            value: fondoSeleccionado,
            onChange: (event) => setFondoSeleccionado(event.target.value),
          },
          React.createElement('option', { value: '' }, 'Seleccionar fondo'),
          donadores.map((d) =>
            React.createElement('option', { key: d.id_fondo, value: d.id_fondo }, d.nombre)
          )
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'ya-aporto',
            onClick: () => setYaAporto(!yaAporto),
          },
          yaAporto ? 'Ya aportó: sí' : 'Ya aportó: no'
        )
      ),
  };
});

const RegistroServiciosModule = await import('../client/src/pages/Servicios/RegistroServicios.jsx');

const RegistroServicios =
  RegistroServiciosModule.default?.default ||
  RegistroServiciosModule.default ||
  RegistroServiciosModule;

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

function getButton(text) {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent.includes(text)
  );
}

async function clickButton(text) {
  await act(async () => {
    getButton(text).click();
  });
}

async function seleccionarBeneficiario() {
  const input = container.querySelector('[data-testid="busqueda-input"]');

  await act(async () => {
    changeInput(input, 'juan');
  });

  await act(async () => {
    container.querySelector('[data-testid="beneficiario-BEN-001"]').click();
  });
}

async function llenarDetalles() {
  await act(async () => {
    changeInput(container.querySelector('[data-testid="fecha-input"]'), '2026-06-03');
    changeInput(container.querySelector('[data-testid="hora-input"]'), '10:30');
  });

  await act(async () => {
    changeInput(container.querySelector('[data-testid="categoria-select"]'), 'Consulta');
  });

  await act(async () => {
    changeInput(container.querySelector('[data-testid="servicio-select"]'), '10');
  });
}

async function irHastaPasoFinanzas() {
  await seleccionarBeneficiario();
  await clickButton('Continuar');
  await llenarDetalles();
  await clickButton('Continuar');
  await clickButton('Continuar');
}

describe('RegistroServicios — modo sin conexión', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    mockGuardando = false;

    mockBeneficiarios = [
      {
        id_beneficiario: 1,
        folio: 'BEN-001',
        estado: 'activo',
        identificadores: {
          nombres: 'Juan',
          apellido_paterno: 'García',
          CURP: 'GAGJ000101HNLXXX01',
        },
      },
    ];

    mockAgendaItems = [
      {
        id_cita: 55,
        id_beneficiario: 3,
        nombre_completo: 'María Cita',
        hora: '09:00',
        servicio_nombre: 'Terapia',
        especialista_nombre: 'Dra. Ana',
      },
    ];

    mockTipos = [
      { id: 10, categoria: 'Consulta', nombre: 'Consulta general', precio: 500 },
    ];

    mockProductos = [{ id: 99, nombre: 'Sonda', precio: 100 }];
    mockSaldoFondo = { saldo: 1000 };
    mockDonadores = [{ id_fondo: 7, id_donador: 70, nombre: 'Fondo Empresa XYZ', saldo: 800 }];

    mockRegistrar.mockResolvedValue({ success: true });
    mockFetchSaldo.mockResolvedValue({ saldo: 1000 });
    mockFetchDonadores.mockResolvedValue(mockDonadores);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }
    container.remove();
  });

  async function mount() {
    await act(async () => {
      root.render(React.createElement(RegistroServicios));
    });
  }

  test('muestra pantalla "Guardado sin conexión" cuando registrar devuelve { queued: true }', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');

    expect(container.textContent).toContain('Guardado sin conexión');
    expect(container.querySelector('[data-testid="icon-cloud-off"]')).not.toBeNull();
  });

  test('muestra el mensaje explicativo de sincronización al guardar sin conexión', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');

    expect(container.textContent).toContain('El registro se guardó localmente');
    expect(container.textContent).toContain('se enviará automáticamente');
  });

  test('NO muestra la pantalla de éxito online al guardar sin conexión', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');

    expect(container.textContent).not.toContain('El servicio fue guardado correctamente');
    expect(container.querySelector('[data-testid="icon-check"]')).toBeNull();
  });

  test('NO llama a fetchSaldo ni fetchDonadores al guardar sin conexión', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();

    mockFetchSaldo.mockClear();
    mockFetchDonadores.mockClear();

    await clickButton('Guardar');

    expect(mockFetchSaldo).not.toHaveBeenCalled();
    expect(mockFetchDonadores).not.toHaveBeenCalled();
  });

  test('"Registrar otro servicio" regresa al paso 1 después de guardar sin conexión', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');

    expect(container.textContent).toContain('Guardado sin conexión');

    await clickButton('Registrar otro servicio');

    expect(container.textContent).toContain('Paso 1 de 4');
    expect(container.textContent).toContain('Registrar Nuevo Servicio');
    expect(container.querySelector('[data-testid="step-busqueda"]')).not.toBeNull();
  });

  test('"Registrar otro servicio" no muestra mensaje de sin conexión en el nuevo registro', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');
    await clickButton('Registrar otro servicio');

    expect(container.textContent).not.toContain('Guardado sin conexión');
    expect(container.querySelector('[data-testid="icon-cloud-off"]')).toBeNull();
  });

  test('"Ver historial" navega a /servicios después de guardar sin conexión', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');
    await clickButton('Ver historial');

    expect(mockNavigate).toHaveBeenCalledWith('/servicios');
  });

  test('al reconectarse, un registro normal vuelve a mostrar la pantalla de éxito online', async () => {
    mockRegistrar.mockResolvedValueOnce({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');

    expect(container.textContent).toContain('Guardado sin conexión');

    await clickButton('Registrar otro servicio');
    await irHastaPasoFinanzas();
    await clickButton('Guardar');

    expect(container.textContent).toContain('Servicio registrado');
    expect(container.textContent).not.toContain('Guardado sin conexión');
    expect(container.querySelector('[data-testid="icon-check"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="icon-cloud-off"]')).toBeNull();
  });

  test('registrar sigue llamándose con el payload completo aunque sea modo sin conexión', async () => {
    mockRegistrar.mockResolvedValue({ queued: true });

    await mount();
    await irHastaPasoFinanzas();
    await clickButton('Guardar');

    expect(mockRegistrar).toHaveBeenCalledTimes(1);
    expect(mockRegistrar).toHaveBeenCalledWith(
      expect.objectContaining({
        id_beneficiario: 1,
        id_catalogo_servicio: '10',
        fecha: '2026-06-03',
        hora: '10:30',
        cantidad: 1,
        id_usuario: 1,
      })
    );
  });
});
