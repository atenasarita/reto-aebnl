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
const mockSaveSession = jest.fn();

let mockLocation = {
  state: null,
};

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ to, children, ...props }) =>
    React.createElement('a', { href: to, ...props }, children),
}));

jest.unstable_mockModule('lucide-react', () => ({
  __esModule: true,
  User: (props) => React.createElement('span', { ...props, 'data-testid': 'icon-user' }),
  Lock: (props) => React.createElement('span', { ...props, 'data-testid': 'icon-lock' }),
}));

jest.mock('../client/src/utils/config.js', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/config', () => ({
  __esModule: true,
  API_URL: 'http://localhost:3000',
}));

jest.mock('../client/src/utils/auth.js', () => ({
  __esModule: true,
  saveSession: (...args) => mockSaveSession(...args),
}));

jest.mock('../client/src/utils/auth', () => ({
  __esModule: true,
  saveSession: (...args) => mockSaveSession(...args),
}));

jest.unstable_mockModule('../client/src/constants/aebnlSiteAssets.js', () => ({
  __esModule: true,
  AEBNL_ASSETS: {
    consultasPhotos: ['foto-login-mock.jpg'],
  },
}));

jest.unstable_mockModule('../client/src/constants/aebnlSiteAssets', () => ({
  __esModule: true,
  AEBNL_ASSETS: {
    consultasPhotos: ['foto-login-mock.jpg'],
  },
}));

jest.unstable_mockModule('../client/src/assets/espina.png', () => ({
  __esModule: true,
  default: 'espina-logo-mock.png',
}));

jest.unstable_mockModule('../client/src/pages/styles/login.css', () => ({
  __esModule: true,
  default: {},
}));

const LoginModule = await import('../client/src/pages/Login/Login.jsx');

const Login = LoginModule.default?.default || LoginModule.default || LoginModule;

let container;
let root;

function okResponse(data) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(data),
  };
}

function errorResponse(data, status = 401) {
  return {
    ok: false,
    status,
    text: async () => JSON.stringify(data),
  };
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function renderLogin() {
  await act(async () => {
    root.render(React.createElement(Login));
  });

  await flushPromises();
}

function getInputById(id) {
  const input = container.querySelector(`#${id}`);

  if (!input) {
    throw new Error(`No se encontró el input con id ${id}`);
  }

  return input;
}

function getForm() {
  const form = container.querySelector('form');

  if (!form) {
    throw new Error('No se encontró el formulario.');
  }

  return form;
}

function getSubmitButton() {
  const button = container.querySelector('button[type="submit"]');

  if (!button) {
    throw new Error('No se encontró el botón submit.');
  }

  return button;
}

async function changeInput(input, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;

  await act(async () => {
    nativeInputValueSetter.call(input, value);

    input.dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  await flushPromises();
}

async function click(element) {
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

async function submitForm() {
  await act(async () => {
    getForm().dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  await flushPromises();
}

async function fillLoginForm({
  usuario = 'admin01',
  contrasena = 'Password123',
} = {}) {
  await changeInput(getInputById('login-usuario'), usuario);
  await changeInput(getInputById('login-contrasena'), contrasena);
}

describe('Login', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    global.fetch = jest.fn();

    mockLocation = {
      state: null,
    };

    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  test('renderiza los textos principales, enlaces e inputs del login', async () => {
    await renderLogin();

    expect(container.textContent).toContain('Sistema');
    expect(container.textContent).toContain('administrativo');
    expect(container.textContent).toContain('Iniciar sesión');
    expect(container.textContent).toContain('Ingresa tus credenciales de acceso');
    expect(container.textContent).toContain('Volver al sitio');
    expect(container.textContent).toContain('Mostrar contraseña');
    expect(container.textContent).toContain('Entrar al sistema');

    expect(getInputById('login-usuario')).toBeTruthy();
    expect(getInputById('login-contrasena')).toBeTruthy();

    expect(container.querySelector('a[href="/"]')).toBeTruthy();
    expect(container.querySelector('a[href="/#preregistro"]')).toBeTruthy();
  });

  test('permite escribir usuario y contraseña', async () => {
    await renderLogin();

    const usuarioInput = getInputById('login-usuario');
    const contrasenaInput = getInputById('login-contrasena');

    await changeInput(usuarioInput, 'operador01');
    await changeInput(contrasenaInput, 'MiPassword');

    expect(usuarioInput.value).toBe('operador01');
    expect(contrasenaInput.value).toBe('MiPassword');
  });

  test('muestra y oculta la contraseña con el checkbox', async () => {
    await renderLogin();

    const passwordInput = getInputById('login-contrasena');
    const checkbox = container.querySelector('input[type="checkbox"]');

    expect(passwordInput.type).toBe('password');

    await click(checkbox);

    expect(passwordInput.type).toBe('text');

    await click(checkbox);

    expect(passwordInput.type).toBe('password');
  });

  test('login exitoso como administrador guarda sesión y navega a recibos', async () => {
    global.fetch.mockResolvedValueOnce(
      okResponse({
        token: 'token-admin',
        user: {
          id_usuario: 1,
          usuario: 'admin01',
          rol: 'administrador',
        },
      })
    );

    await renderLogin();
    await fillLoginForm();

    await submitForm();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/usuarios/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: 'admin01',
          contrasena: 'Password123',
        }),
      }
    );

    expect(mockSaveSession).toHaveBeenCalledWith('token-admin', {
      id_usuario: 1,
      usuario: 'admin01',
      rol: 'administrador',
    });

    expect(mockNavigate).toHaveBeenCalledWith('/recibos', {
      replace: true,
    });

    expect(container.textContent).not.toContain('Usuario o contraseña incorrectos');
  });

  test('login exitoso como operador navega a dashboard', async () => {
    global.fetch.mockResolvedValueOnce(
      okResponse({
        token: 'token-operador',
        user: {
          id_usuario: 2,
          usuario: 'operador01',
          rol: 'operador',
        },
      })
    );

    await renderLogin();
    await fillLoginForm({
      usuario: 'operador01',
      contrasena: 'Password123',
    });

    await submitForm();

    expect(mockSaveSession).toHaveBeenCalledWith('token-operador', {
      id_usuario: 2,
      usuario: 'operador01',
      rol: 'operador',
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
      replace: true,
    });
  });

  test('si existe location.state.from.pathname navega a esa ruta antes que por rol', async () => {
    mockLocation = {
      state: {
        from: {
          pathname: '/reportes',
        },
      },
    };

    global.fetch.mockResolvedValueOnce(
      okResponse({
        token: 'token-admin',
        user: {
          id_usuario: 1,
          usuario: 'admin01',
          rol: 'administrador',
        },
      })
    );

    await renderLogin();
    await fillLoginForm();

    await submitForm();

    expect(mockNavigate).toHaveBeenCalledWith('/reportes', {
      replace: true,
    });

    expect(mockNavigate).not.toHaveBeenCalledWith('/recibos', {
      replace: true,
    });
  });

  test('si el rol no es administrador ni operador navega a dashboard', async () => {
    global.fetch.mockResolvedValueOnce(
      okResponse({
        token: 'token-user',
        user: {
          id_usuario: 3,
          usuario: 'otro01',
          rol: 'otro',
        },
      })
    );

    await renderLogin();
    await fillLoginForm({
      usuario: 'otro01',
      contrasena: 'Password123',
    });

    await submitForm();

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
      replace: true,
    });
  });

  test('muestra error cuando el servidor responde credenciales inválidas', async () => {
    global.fetch.mockResolvedValueOnce(
      errorResponse({
        message: 'Usuario o contraseña incorrectos',
      })
    );

    await renderLogin();
    await fillLoginForm();

    await submitForm();

    expect(mockSaveSession).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Usuario o contraseña incorrectos');

    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
  });

  test('usa mensaje por defecto si el servidor falla sin message', async () => {
    global.fetch.mockResolvedValueOnce(
      errorResponse({})
    );

    await renderLogin();
    await fillLoginForm();

    await submitForm();

    expect(container.textContent).toContain('Usuario o contraseña incorrectos');
    expect(mockSaveSession).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('muestra error si el servidor responde JSON inválido', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => 'respuesta no json',
    });

    await renderLogin();
    await fillLoginForm();

    await submitForm();

    expect(container.textContent).toContain('Respuesta inválida del servidor');
    expect(mockSaveSession).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('muestra error de conexión si fetch falla sin message', async () => {
    global.fetch.mockRejectedValueOnce({});

    await renderLogin();
    await fillLoginForm();

    await submitForm();

    expect(container.textContent).toContain('Error de conexión');
    expect(mockSaveSession).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('deshabilita el botón y muestra Validando mientras se procesa el login', async () => {
    let resolveFetch;

    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    await renderLogin();
    await fillLoginForm();

    await act(async () => {
      getForm().dispatchEvent(
        new Event('submit', {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(getSubmitButton().disabled).toBe(true);
    expect(getSubmitButton().textContent).toBe('Validando...');

    await act(async () => {
      resolveFetch(
        okResponse({
          token: 'token-admin',
          user: {
            id_usuario: 1,
            usuario: 'admin01',
            rol: 'administrador',
          },
        })
      );
    });

    await flushPromises();

    expect(getSubmitButton().disabled).toBe(false);
    expect(getSubmitButton().textContent).toBe('Entrar al sistema');
  });
});