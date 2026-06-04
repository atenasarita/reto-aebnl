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
const mockGetValidToken = jest.fn();
const mockHandleUnauthorizedResponse = jest.fn();
const mockLogout = jest.fn();

global.fetch = jest.fn();

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ to, children, ...props }) =>
    React.createElement('a', { href: to, ...props }, children),
}));

jest.mock('../client/src/utils/auth', () => ({
  __esModule: true,
  getValidToken: () => mockGetValidToken(),
  handleUnauthorizedResponse: (...args) => mockHandleUnauthorizedResponse(...args),
  logout: (...args) => mockLogout(...args),
}));

jest.mock('../client/src/utils/auth.js', () => ({
  __esModule: true,
  getValidToken: () => mockGetValidToken(),
  handleUnauthorizedResponse: (...args) => mockHandleUnauthorizedResponse(...args),
  logout: (...args) => mockLogout(...args),
}));

jest.mock('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.unstable_mockModule('../client/src/assets/logo.png', () => ({
  __esModule: true,
  default: 'logo-mock.png',
}));

jest.unstable_mockModule('../client/src/components/layout/Navbar/Navbar.module.css', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: (_, prop) => String(prop),
    }
  ),
}));

const NavbarModule = await import('../client/src/components/layout/Navbar/Navbar.jsx');

const Navbar = NavbarModule.default?.default || NavbarModule.default || NavbarModule;

let container;
let root;

const defaultUser = {
  name: 'Juan Pérez',
  role: 'Administrador',
  avatar: null,
};

function okResponse(data) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  };
}

function errorResponse(status = 500) {
  return {
    ok: false,
    status,
    json: async () => ({}),
  };
}

function mockFetchAlerts({ membresias = 0, inventario = 0, preregistros = 0 } = {}) {
  global.fetch.mockImplementation((url) => {
    const urlText = String(url);

    if (urlText.includes('membresias-proximas')) {
      return Promise.resolve(okResponse(Array(membresias).fill({})));
    }

    if (urlText.includes('escasez')) {
      return Promise.resolve(okResponse(Array(inventario).fill({})));
    }

    if (urlText.includes('preregistro-pendientes')) {
      return Promise.resolve(okResponse(Array(preregistros).fill({})));
    }

    return Promise.resolve(okResponse([]));
  });
}

function setNavigatorOnline(value) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function renderNavbar(props = {}) {
  await act(async () => {
    root.render(
      React.createElement(Navbar, {
        activeLink: 'Beneficiarios',
        user: defaultUser,
        ...props,
      })
    );
  });

  await flushPromises();
}

async function click(element) {
  if (!element) {
    throw new Error('No se puede hacer click porque el elemento no existe.');
  }

  await act(async () => {
    element.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  await flushPromises();
}

async function dispatchOnlineStatus(status) {
  await act(async () => {
    window.dispatchEvent(new Event(status));
  });

  await flushPromises();
}

function queryByLabel(label) {
  return container.querySelector(`[aria-label="${label}"]`);
}

function getByLabel(label) {
  const element = queryByLabel(label);

  if (!element) {
    throw new Error(`No se encontró aria-label: ${label}`);
  }

  return element;
}

function getByTitle(title) {
  const element = container.querySelector(`[title="${title}"]`);

  if (!element) {
    throw new Error(`No se encontró title: ${title}`);
  }

  return element;
}

function getButtonByText(text) {
  const button = Array.from(container.querySelectorAll('button')).find((element) =>
    element.textContent?.trim().includes(text)
  );

  if (!button) {
    throw new Error(`No se encontró botón con texto: ${text}`);
  }

  return button;
}

function queryButtonByText(text) {
  return Array.from(container.querySelectorAll('button')).find((element) =>
    element.textContent?.trim().includes(text)
  );
}

function getMenuText() {
  const menu = container.querySelector('[role="menu"]');

  if (!menu) {
    throw new Error('No se encontró el menú de alertas.');
  }

  return menu.textContent;
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();
    global.fetch.mockReset();

    localStorage.clear();
    localStorage.setItem('token', 'fake-token-123');

    setNavigatorOnline(true);

    mockGetValidToken.mockReturnValue('fake-token-123');
    mockHandleUnauthorizedResponse.mockReturnValue(false);

    mockFetchAlerts();
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

  test('renderiza logo, usuario y rol', async () => {
    await renderNavbar();

    const logo = container.querySelector(
      'img[alt="Asociación de Espina Bífida de Nuevo León"]'
    );

    expect(logo).toBeTruthy();
    expect(container.textContent).toContain('Juan Pérez');
    expect(container.textContent).toContain('Administrador');
  });

  test('muestra OfflineBanner cuando el navegador está offline', async () => {
    setNavigatorOnline(false);

    await renderNavbar();

    await dispatchOnlineStatus('offline');

    expect(container.textContent.toLowerCase()).toMatch(
      /sin conexión|offline|conexión|modo sin conexión|no tienes conexión/
    );
  });

  test('muestra inicial del usuario cuando no hay avatar', async () => {
    await renderNavbar({
      user: {
        name: 'Carlos López',
        role: 'Operador',
        avatar: null,
      },
    });

    expect(container.textContent).toContain('C');
  });

  test('muestra imagen cuando el usuario tiene avatar', async () => {
    await renderNavbar({
      user: {
        name: 'Ana García',
        role: 'Administrador',
        avatar: 'foto.png',
      },
    });

    const img = container.querySelector('img[src="foto.png"]');

    expect(img).toBeTruthy();
  });

  test('muestra todos los enlaces para administrador', async () => {
    await renderNavbar({
      user: {
        name: 'Admin',
        role: 'Administrador',
        avatar: null,
      },
    });

    const expectedLabels = [
      'Inicio',
      'Beneficiarios',
      'Servicios',
      'Donaciones',
      'Inventario',
      'Citas',
      'Reportes',
      'Recibos',
    ];

    for (const label of expectedLabels) {
      expect(getButtonByText(label)).toBeTruthy();
    }
  });

  test('oculta Reportes y Recibos para operador', async () => {
    await renderNavbar({
      user: {
        name: 'Operador',
        role: 'operador',
        avatar: null,
      },
    });

    expect(queryButtonByText('Reportes')).toBeFalsy();
    expect(queryButtonByText('Recibos')).toBeFalsy();

    expect(getButtonByText('Inicio')).toBeTruthy();
    expect(getButtonByText('Beneficiarios')).toBeTruthy();
    expect(getButtonByText('Servicios')).toBeTruthy();
    expect(getButtonByText('Donaciones')).toBeTruthy();
    expect(getButtonByText('Inventario')).toBeTruthy();
    expect(getButtonByText('Citas')).toBeTruthy();
  });

  test('el filtro de rol funciona con mayúsculas', async () => {
    await renderNavbar({
      user: {
        name: 'Operador',
        role: 'OPERADOR',
        avatar: null,
      },
    });

    expect(queryButtonByText('Reportes')).toBeFalsy();
    expect(queryButtonByText('Recibos')).toBeFalsy();
  });

  test('navega a inventario al hacer click en el enlace', async () => {
    await renderNavbar();

    await click(getButtonByText('Inventario'));

    expect(mockNavigate).toHaveBeenCalledWith('/inventario');
  });

  test('marca el enlace activo con aria-current page', async () => {
    await renderNavbar({
      activeLink: 'Donaciones',
    });

    const button = getButtonByText('Donaciones');

    expect(button.getAttribute('aria-current')).toBe('page');
  });

  test('los enlaces inactivos no tienen aria-current', async () => {
    await renderNavbar({
      activeLink: 'Donaciones',
    });

    const button = getButtonByText('Inicio');

    expect(button.getAttribute('aria-current')).toBeFalsy();
  });

  test('el botón hamburguesa abre y cierra el menú', async () => {
    await renderNavbar();

    const openButton = getByLabel('Abrir menú');

    expect(openButton.getAttribute('aria-expanded')).toBe('false');

    await click(openButton);

    const closeButton = getByLabel('Cerrar menú');

    expect(closeButton).toBeTruthy();
    expect(closeButton.getAttribute('aria-expanded')).toBe('true');
  });

  test('renderiza el botón de alertas', async () => {
    await renderNavbar();

    expect(getByTitle('Alertas')).toBeTruthy();
  });

  test('no muestra badge cuando no hay alertas', async () => {
    mockFetchAlerts({
      membresias: 0,
      inventario: 0,
      preregistros: 0,
    });

    await renderNavbar();

    expect(queryByLabel('1 alertas')).toBeFalsy();
    expect(queryByLabel('2 alertas')).toBeFalsy();
    expect(queryByLabel('3 alertas')).toBeFalsy();
  });

  test('muestra badge con total de alertas', async () => {
    mockFetchAlerts({
      membresias: 3,
      inventario: 2,
      preregistros: 1,
    });

    await renderNavbar();

    expect(getByLabel('6 alertas')).toBeTruthy();
  });

  test('muestra 99+ cuando hay más de 99 alertas', async () => {
    mockFetchAlerts({
      membresias: 50,
      inventario: 50,
      preregistros: 10,
    });

    await renderNavbar();

    expect(container.textContent).toContain('99+');
  });

  test('abre el dropdown de alertas', async () => {
    await renderNavbar();

    await click(getByTitle('Alertas'));

    expect(container.querySelector('[role="menu"]')).toBeTruthy();
    expect(container.textContent).toContain('Terminación de una membresía');
    expect(container.textContent).toContain('Escasez de un producto en el inventario');
    expect(container.textContent).toContain('Pre-registros nuevos');
  });

  test('muestra textos dinámicos de alertas con conteos reales', async () => {
    mockFetchAlerts({
      membresias: 3,
      inventario: 2,
      preregistros: 1,
    });

    await renderNavbar();

    await click(getByTitle('Alertas'));

    const menuText = getMenuText();

    expect(menuText).toContain('3 membresía(s) próxima(s) a vencer.');
    expect(menuText).toContain('2 producto(s) con existencia baja.');
    expect(menuText).toContain('1 preregistro(s) pendiente(s).');
  });

  test('muestra textos sin alertas cuando los conteos son 0', async () => {
    mockFetchAlerts({
      membresias: 0,
      inventario: 0,
      preregistros: 0,
    });

    await renderNavbar();

    await click(getByTitle('Alertas'));

    const menuText = getMenuText();

    expect(menuText).toContain('Sin membresías próximas a vencer.');
    expect(menuText).toContain('Sin productos con existencia baja.');
    expect(menuText).toContain('Sin nuevos preregistros pendientes.');
  });

  test('navega a inventario al hacer click en alerta de inventario', async () => {
    await renderNavbar();

    await click(getByTitle('Alertas'));

    const inventarioAlert = Array.from(container.querySelectorAll('[role="menuitem"]')).find(
      (item) => item.textContent.includes('Escasez de un producto')
    );

    await click(inventarioAlert);

    expect(mockNavigate).toHaveBeenCalledWith('/inventario');
  });

  test('cierra el dropdown al hacer click en una alerta', async () => {
    await renderNavbar();

    await click(getByTitle('Alertas'));

    const membresiaAlert = Array.from(container.querySelectorAll('[role="menuitem"]')).find(
      (item) => item.textContent.includes('Terminación de una membresía')
    );

    await click(membresiaAlert);

    expect(container.querySelector('[role="menu"]')).toBeFalsy();
  });

  test('cierra el dropdown al hacer click fuera', async () => {
    await renderNavbar();

    await click(getByTitle('Alertas'));

    expect(container.querySelector('[role="menu"]')).toBeTruthy();

    await act(async () => {
      document.body.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    await flushPromises();

    expect(container.querySelector('[role="menu"]')).toBeFalsy();
  });

  test('hace 3 llamadas fetch al montar', async () => {
    await renderNavbar();

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('repite fetch cada 60 segundos', async () => {
    await renderNavbar();

    expect(global.fetch).toHaveBeenCalledTimes(3);

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(6);
  });

  test('no hace fetch si no hay token válido', async () => {
    mockGetValidToken.mockReturnValueOnce(null);
    localStorage.removeItem('token');

    await renderNavbar();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('sigue funcionando aunque un endpoint falle', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('membresias-proximas')) {
        return Promise.reject(new Error('Network Error'));
      }

      if (String(url).includes('escasez')) {
        return Promise.resolve(okResponse([{}, {}]));
      }

      if (String(url).includes('preregistro-pendientes')) {
        return Promise.resolve(okResponse([]));
      }

      return Promise.resolve(okResponse([]));
    });

    await renderNavbar();

    await click(getByTitle('Alertas'));

    const menuText = getMenuText();

    expect(menuText).toContain('Sin membresías próximas a vencer.');
    expect(menuText).toContain('2 producto(s) con existencia baja.');
    expect(menuText).toContain('Sin nuevos preregistros pendientes.');
  });

  test('llama handleUnauthorizedResponse cuando una respuesta es 401', async () => {
    mockHandleUnauthorizedResponse.mockReturnValue(true);

    global.fetch.mockResolvedValue(errorResponse(401));

    await renderNavbar();

    expect(mockHandleUnauthorizedResponse).toHaveBeenCalled();
  });

  test('ejecuta logout al hacer click en cerrar sesión', async () => {
    await renderNavbar();

    await click(getByLabel('Cerrar sesión'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('el nav tiene aria-label de navegación principal', async () => {
    await renderNavbar();

    const nav = container.querySelector('nav[aria-label="Navegación principal"]');

    expect(nav).toBeTruthy();
  });

  test('el dropdown de alertas usa role menu y menuitem', async () => {
    await renderNavbar();

    await click(getByTitle('Alertas'));

    expect(container.querySelector('[role="menu"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  test('el enlace del logo tiene aria-label descriptivo', async () => {
    await renderNavbar();

    expect(getByLabel('Ir al inicio')).toBeTruthy();
  });

  test('el botón de alertas tiene aria-haspopup y aria-expanded', async () => {
    await renderNavbar();

    const alertButton = getByTitle('Alertas');

    expect(alertButton.getAttribute('aria-haspopup')).toBe('true');
    expect(alertButton.getAttribute('aria-expanded')).toBe('false');

    await click(alertButton);

    expect(alertButton.getAttribute('aria-expanded')).toBe('true');
  });

  test('resuelve conteo desde payload con total', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('membresias-proximas')) {
        return Promise.resolve(okResponse({ total: 7 }));
      }

      return Promise.resolve(okResponse([]));
    });

    await renderNavbar();

    expect(getByLabel('7 alertas')).toBeTruthy();
  });

  test('resuelve conteo desde payload con count', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('escasez')) {
        return Promise.resolve(okResponse({ count: 4 }));
      }

      return Promise.resolve(okResponse([]));
    });

    await renderNavbar();

    expect(getByLabel('4 alertas')).toBeTruthy();
  });

  test('resuelve conteo desde payload con data, items, beneficiarios, membresias y rows', async () => {
    global.fetch.mockImplementation((url) => {
      const urlText = String(url);

      if (urlText.includes('membresias-proximas')) {
        return Promise.resolve(okResponse({ data: [{}, {}] }));
      }

      if (urlText.includes('escasez')) {
        return Promise.resolve(okResponse({ items: [{}, {}, {}] }));
      }

      if (urlText.includes('preregistro-pendientes')) {
        return Promise.resolve(okResponse({ rows: [{}] }));
      }

      return Promise.resolve(okResponse([]));
    });

    await renderNavbar();

    expect(getByLabel('6 alertas')).toBeTruthy();
  });
});