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

global.fetch = jest.fn();
global.alert = jest.fn();

const mockNavigate = jest.fn();
const mockGetStoredUser = jest.fn();
const mockGetValidToken = jest.fn();
const mockHandleUnauthorizedResponse = jest.fn();
const mockGetAgendaTagClass = jest.fn();

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

jest.unstable_mockModule('lucide-react', () => ({
  ArrowRight: () => React.createElement('span', { 'data-testid': 'icon-arrow' }),
  CalendarDays: () => React.createElement('span', { 'data-testid': 'icon-calendar' }),
  Check: () => React.createElement('span', { 'data-testid': 'icon-check' }),
  ChevronDown: () => React.createElement('span', { 'data-testid': 'icon-chevron' }),
  ClipboardPlus: () => React.createElement('span', { 'data-testid': 'icon-clipboard' }),
  Info: () => React.createElement('span', { 'data-testid': 'icon-info' }),
  Plus: () => React.createElement('span', { 'data-testid': 'icon-plus' }),
  Receipt: () => React.createElement('span', { 'data-testid': 'icon-receipt' }),
  User: () => React.createElement('span', { 'data-testid': 'icon-user' }),
  UserPlus: () => React.createElement('span', { 'data-testid': 'icon-user-plus' }),
  X: () => React.createElement('span', { 'data-testid': 'icon-x' }),
}));

jest.mock('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/auth', () => ({
  __esModule: true,
  getStoredUser: () => mockGetStoredUser(),
  getValidToken: () => mockGetValidToken(),
  handleUnauthorizedResponse: (...args) => mockHandleUnauthorizedResponse(...args),
}));

jest.mock('../client/src/utils/auth.js', () => ({
  __esModule: true,
  getStoredUser: () => mockGetStoredUser(),
  getValidToken: () => mockGetValidToken(),
  handleUnauthorizedResponse: (...args) => mockHandleUnauthorizedResponse(...args),
}));

jest.mock('../client/src/utils/agendaUtils', () => ({
  __esModule: true,
  getAgendaTagClass: () => 'tag-test',
}));

jest.mock('../client/src/utils/agendaUtils.js', () => ({
  __esModule: true,
  getAgendaTagClass: () => 'tag-test',
}));

jest.mock('../client/src/utils/dateTime', () => ({
  __esModule: true,
  todayDate: () => '2026-06-04',
}));

jest.mock('../client/src/utils/dateTime.js', () => ({
  __esModule: true,
  todayDate: () => '2026-06-04',
}));

jest.unstable_mockModule('../client/src/pages/styles/dashboard.css', () => ({}));

const DashboardModule = await import('../client/src/pages/dashboard.jsx');
const Dashboard = DashboardModule.default?.default || DashboardModule.default || DashboardModule;

let container;
let root;

const agendaMock = [
  {
    id_cita: 101,
    fecha: '2026-06-04',
    hora: '09:00',
    servicio_nombre: 'Consulta médica',
    nombre_completo: 'Ana García',
    especialista_nombre: 'Dra. Laura',
    folio: 'BEN-001',
    estatus: 'programada',
    motivo: 'Control mensual',
    notas: 'Traer estudios',
    fotografia: '',
  },
];

const preregistrosMock = [
  {
    id_preregistro: 20,
    nombre_completo: 'Luis Pérez',
    estado: 'pendiente',
    curp: 'PELU000101HNLXXX09',
    genero: 'Masculino',
    fecha_nacimiento: '2000-01-01',
  },
];

function okResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function errorResponse(message, status = 500) {
  return {
    ok: false,
    status,
    json: async () => ({ message }),
  };
}

function setupFetchSuccess({
  agenda = agendaMock,
  preregistros = preregistrosMock,
  acceptResponse = { id_beneficiario: 55 },
} = {}) {
  global.fetch.mockImplementation((url, options = {}) => {
    if (url.includes('/api/dashboard/agenda-hoy')) {
      return Promise.resolve(okResponse(agenda));
    }

    if (url.includes('/api/dashboard/preregistro-pendientes')) {
      return Promise.resolve(okResponse(preregistros));
    }

    if (
      url.includes('/api/dashboard/preregistro/20/estado') &&
      options.method === 'PATCH'
    ) {
      return Promise.resolve(okResponse(acceptResponse));
    }

    return Promise.resolve(okResponse({}));
  });
}

async function mountDashboard() {
  await act(async () => {
    root.render(React.createElement(Dashboard));
  });

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

describe('Dashboard', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.fetch.mockReset();

    mockNavigate.mockReset();
    mockGetValidToken.mockReturnValue('token-123');
    mockGetStoredUser.mockReturnValue({ rol: 'administrador' });
    mockHandleUnauthorizedResponse.mockReturnValue(false);
    mockGetAgendaTagClass.mockReturnValue('tag-test');
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
  });

  test('carga agenda y preregistros al renderizar', async () => {
    setupFetchSuccess();

    await mountDashboard();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/dashboard/agenda-hoy?fecha=2026-06-04',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/dashboard/preregistro-pendientes',
      {
        headers: {
          Authorization: 'Bearer token-123',
        },
      }
    );

    expect(container.textContent).toContain('Agenda del Día');
    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).toContain('Consulta médica');

    expect(container.textContent).toContain('PERSONAS EN PRE-REGISTRO');
    expect(container.textContent).toContain('Luis Pérez');
    expect(container.textContent).toContain('1 Pendientes');
  });

  test('muestra todas las acciones cuando el usuario es administrador', async () => {
    setupFetchSuccess();

    await mountDashboard();

    expect(container.textContent).toContain('Registrar Servicio');
    expect(container.textContent).toContain('Nuevo Beneficiario');
    expect(container.textContent).toContain('Agendar Cita');
    expect(container.textContent).toContain('Recibos');
  });

  test('oculta Recibos cuando el usuario no es administrador', async () => {
    mockGetStoredUser.mockReturnValue({ rol: 'operador' });
    setupFetchSuccess();

    await mountDashboard();

    expect(container.textContent).toContain('Registrar Servicio');
    expect(container.textContent).toContain('Nuevo Beneficiario');
    expect(container.textContent).toContain('Agendar Cita');
    expect(container.textContent).not.toContain('Recibos');
  });

  test('navega al hacer click en una tarjeta de acción', async () => {
    setupFetchSuccess();

    await mountDashboard();

    await act(async () => {
      getButton('Registrar Servicio').click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/registro_servicios');
  });

  test('muestra estados vacíos cuando no hay agenda ni preregistros', async () => {
    setupFetchSuccess({
      agenda: [],
      preregistros: [],
    });

    await mountDashboard();

    expect(container.textContent).toContain('Sin citas para hoy');
    expect(container.textContent).toContain('Sin pendientes');
    expect(container.textContent).toContain('0 Pendientes');
  });

  test('navega a editar cita al presionar Modificar', async () => {
    setupFetchSuccess();

    await mountDashboard();

    await act(async () => {
      getButton('Modificar').click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/citas?edit=101');
  });

  test('expande y contrae los detalles de un preregistro', async () => {
    setupFetchSuccess();

    await mountDashboard();

    expect(container.textContent).not.toContain('PELU000101HNLXXX09');

    await act(async () => {
      const expandButton = container.querySelector('button[aria-label="Expandir detalles"]');
      expandButton.click();
    });

    expect(container.textContent).toContain('PELU000101HNLXXX09');
    expect(container.textContent).toContain('Masculino');
    expect(container.textContent).toContain('2000-01-01');

    await act(async () => {
      const expandButton = container.querySelector('button[aria-label="Expandir detalles"]');
      expandButton.click();
    });

    expect(container.textContent).not.toContain('PELU000101HNLXXX09');
  });

  test('acepta un preregistro, refresca la lista y abre modal de perfil incompleto', async () => {
    setupFetchSuccess({
      acceptResponse: {
        id_beneficiario: 55,
      },
    });

    await mountDashboard();

    await act(async () => {
      const acceptButton = container.querySelector('button[aria-label="Aceptar preregistro"]');
      acceptButton.click();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/dashboard/preregistro/20/estado',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify({
          estado: 'aceptado',
        }),
      })
    );

    expect(container.textContent).toContain('Perfil incompleto');
    expect(container.textContent).toContain(
      'El preregistro de Luis Pérez fue aceptado correctamente.'
    );
  });

  test('navega a editar beneficiario desde el modal cuando existe id_beneficiario', async () => {
    setupFetchSuccess({
      acceptResponse: {
        id_beneficiario: 55,
      },
    });

    await mountDashboard();

    await act(async () => {
      const acceptButton = container.querySelector('button[aria-label="Aceptar preregistro"]');
      acceptButton.click();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      getButton('Editar ahora').click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/beneficiarios?edit=55');
  });

  test('cierra el modal de perfil incompleto con Dejarlo por ahora', async () => {
    setupFetchSuccess();

    await mountDashboard();

    await act(async () => {
      const acceptButton = container.querySelector('button[aria-label="Aceptar preregistro"]');
      acceptButton.click();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Perfil incompleto');

    await act(async () => {
      getButton('Dejarlo por ahora').click();
    });

    expect(container.textContent).not.toContain('Perfil incompleto');
  });

  test('rechaza un preregistro y refresca la lista', async () => {
    setupFetchSuccess();

    await mountDashboard();

    await act(async () => {
      const rejectButton = container.querySelector('button[aria-label="Rechazar preregistro"]');
      rejectButton.click();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/dashboard/preregistro/20/estado',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify({
          estado: 'rechazado',
        }),
      })
    );
  });

  test('muestra error si falla la carga de agenda', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/dashboard/agenda-hoy')) {
        return Promise.resolve(errorResponse('Error al cargar agenda'));
      }

      if (url.includes('/api/dashboard/preregistro-pendientes')) {
        return Promise.resolve(okResponse(preregistrosMock));
      }

      return Promise.resolve(okResponse({}));
    });

    await mountDashboard();

    expect(container.textContent).toContain('Error al cargar agenda');
  });

  test('muestra alert si falla aceptar preregistro', async () => {
    global.fetch.mockImplementation((url, options = {}) => {
      if (url.includes('/api/dashboard/agenda-hoy')) {
        return Promise.resolve(okResponse(agendaMock));
      }

      if (url.includes('/api/dashboard/preregistro-pendientes')) {
        return Promise.resolve(okResponse(preregistrosMock));
      }

      if (
        url.includes('/api/dashboard/preregistro/20/estado') &&
        options.method === 'PATCH'
      ) {
        return Promise.resolve(errorResponse('No se pudo aceptar'));
      }

      return Promise.resolve(okResponse({}));
    });

    await mountDashboard();

    await act(async () => {
      const acceptButton = container.querySelector('button[aria-label="Aceptar preregistro"]');
      acceptButton.click();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(global.alert).toHaveBeenCalledWith('No se pudo aceptar');
  });

  test('muestra alert si falla rechazar preregistro', async () => {
    global.fetch.mockImplementation((url, options = {}) => {
      if (url.includes('/api/dashboard/agenda-hoy')) {
        return Promise.resolve(okResponse(agendaMock));
      }

      if (url.includes('/api/dashboard/preregistro-pendientes')) {
        return Promise.resolve(okResponse(preregistrosMock));
      }

      if (
        url.includes('/api/dashboard/preregistro/20/estado') &&
        options.method === 'PATCH'
      ) {
        return Promise.resolve(errorResponse('No se pudo rechazar'));
      }

      return Promise.resolve(okResponse({}));
    });

    await mountDashboard();

    await act(async () => {
      const rejectButton = container.querySelector('button[aria-label="Rechazar preregistro"]');
      rejectButton.click();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(global.alert).toHaveBeenCalledWith('No se pudo rechazar');
  });

  test('no continúa si la respuesta es no autorizada', async () => {
    mockHandleUnauthorizedResponse.mockReturnValue(true);
    setupFetchSuccess();

    await mountDashboard();

    expect(mockHandleUnauthorizedResponse).toHaveBeenCalled();
    expect(container.textContent).toContain('Sin citas para hoy');
    expect(container.textContent).toContain('Sin pendientes');
  });
});