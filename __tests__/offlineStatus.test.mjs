/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let onlineValue = true;
let queueItems = [];

const mockGetValidToken = jest.fn();

const mockGetQueue = jest.fn(() => queueItems);
const mockQueueSize = jest.fn(() => queueItems.length);
const mockRemoveFromQueue = jest.fn((id) => {
  queueItems = queueItems.filter((item) => item.id !== id);
});

Object.defineProperty(window.navigator, 'onLine', {
  configurable: true,
  get: () => onlineValue,
});

jest.unstable_mockModule('../client/src/utils/offlineQueue', () => ({
  getQueue: () => mockGetQueue(),
  removeFromQueue: (id) => mockRemoveFromQueue(id),
  queueSize: () => mockQueueSize(),
}));

jest.unstable_mockModule('../client/src/utils/offlineQueue.js', () => ({
  getQueue: () => mockGetQueue(),
  removeFromQueue: (id) => mockRemoveFromQueue(id),
  queueSize: () => mockQueueSize(),
}));

jest.unstable_mockModule('../client/src/utils/auth', () => ({
  getValidToken: () => mockGetValidToken(),
}));

jest.unstable_mockModule('../client/src/utils/auth.js', () => ({
  getValidToken: () => mockGetValidToken(),
}));

const HookModule = await import('../client/src/hooks/useOfflineStatus.js');
const useOfflineStatus = HookModule.useOfflineStatus;

let container;
let root;

function TestComponent() {
  const { isOnline, pendingCount, syncing, syncError } = useOfflineStatus();

  return React.createElement(
    'section',
    null,
    React.createElement('p', { 'data-testid': 'is-online' }, String(isOnline)),
    React.createElement('p', { 'data-testid': 'pending-count' }, String(pendingCount)),
    React.createElement('p', { 'data-testid': 'syncing' }, String(syncing)),
    React.createElement('p', { 'data-testid': 'sync-error' }, syncError ?? '')
  );
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mount() {
  await act(async () => {
    root.render(React.createElement(TestComponent));
  });

  await flushPromises();
}

async function dispatchWindowEvent(eventName) {
  await act(async () => {
    window.dispatchEvent(new Event(eventName));
  });

  await flushPromises();
}

function text(testId) {
  return container.querySelector(`[data-testid="${testId}"]`)?.textContent;
}

describe('useOfflineStatus', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    onlineValue = true;
    queueItems = [];

    global.fetch = jest.fn();

    mockGetValidToken.mockReset();
    mockGetQueue.mockClear();
    mockQueueSize.mockClear();
    mockRemoveFromQueue.mockClear();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    root = null;

    delete global.fetch;
  });

  test('inicia con el estado online del navegador y el tamaño actual de la cola', async () => {
    onlineValue = true;
    queueItems = [
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        body: { nombre: 'A' },
      },
      {
        id: '2',
        url: '/api/test-2',
        method: 'POST',
        body: { nombre: 'B' },
      },
    ];

    await mount();

    expect(text('is-online')).toBe('true');
    expect(text('pending-count')).toBe('2');
    expect(text('syncing')).toBe('false');
    expect(text('sync-error')).toBe('');
  });

  test('inicia como offline si navigator.onLine es false', async () => {
    onlineValue = false;
    queueItems = [];

    await mount();

    expect(text('is-online')).toBe('false');
    expect(text('pending-count')).toBe('0');
  });

  test('actualiza pendingCount cuando se dispara el evento aebnl:queue-updated', async () => {
    queueItems = [];

    await mount();

    expect(text('pending-count')).toBe('0');

    queueItems = [
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        body: { nombre: 'A' },
      },
    ];

    await dispatchWindowEvent('aebnl:queue-updated');

    expect(text('pending-count')).toBe('1');
  });

  test('cambia isOnline a false cuando se dispara evento offline', async () => {
    onlineValue = true;

    await mount();

    expect(text('is-online')).toBe('true');

    onlineValue = false;

    await dispatchWindowEvent('offline');

    expect(text('is-online')).toBe('false');
    expect(text('syncing')).toBe('false');
  });

  test('cambia isOnline a true cuando se dispara evento online', async () => {
    onlineValue = false;
    queueItems = [];

    await mount();

    expect(text('is-online')).toBe('false');

    onlineValue = true;

    await dispatchWindowEvent('online');

    expect(text('is-online')).toBe('true');
  });

  test('no sincroniza si la cola está vacía', async () => {
    queueItems = [];
    mockGetValidToken.mockReturnValue('token-123');

    await mount();

    await dispatchWindowEvent('online');

    expect(mockGetQueue).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockRemoveFromQueue).not.toHaveBeenCalled();
    expect(text('pending-count')).toBe('0');
  });

  test('no sincroniza si no hay token válido', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/recibos',
        method: 'POST',
        body: { monto: 300 },
      },
    ];

    mockGetValidToken.mockReturnValue(null);

    await mount();

    await dispatchWindowEvent('online');

    expect(mockGetValidToken).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockRemoveFromQueue).not.toHaveBeenCalled();
    expect(text('syncing')).toBe('false');
    expect(text('pending-count')).toBe('1');
  });

  test('sincroniza un item exitoso y lo elimina de la cola', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/recibos',
        method: 'POST',
        body: { monto: 300 },
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    await mount();

    await dispatchWindowEvent('online');

    expect(global.fetch).toHaveBeenCalledWith('/api/recibos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({ monto: 300 }),
    });

    expect(mockRemoveFromQueue).toHaveBeenCalledWith('1');
    expect(text('pending-count')).toBe('0');
    expect(text('syncing')).toBe('false');
    expect(text('sync-error')).toBe('');
  });

  test('envía body undefined cuando el item no tiene body', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/ping',
        method: 'GET',
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
    });

    await mount();

    await dispatchWindowEvent('online');

    expect(global.fetch).toHaveBeenCalledWith('/api/ping', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: undefined,
    });

    expect(mockRemoveFromQueue).toHaveBeenCalledWith('1');
  });

  test('elimina de la cola si el servidor responde error 4xx', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/recibos',
        method: 'POST',
        body: { monto: 300 },
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
    });

    await mount();

    await dispatchWindowEvent('online');

    expect(mockRemoveFromQueue).toHaveBeenCalledWith('1');
    expect(text('pending-count')).toBe('0');
    expect(text('sync-error')).toBe('');
  });

  test('no elimina de la cola si el servidor responde error 5xx y muestra error singular', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/recibos',
        method: 'POST',
        body: { monto: 300 },
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await mount();

    await dispatchWindowEvent('online');

    expect(mockRemoveFromQueue).not.toHaveBeenCalled();
    expect(text('pending-count')).toBe('1');
    expect(text('sync-error')).toBe('1 cambio no pudo sincronizarse.');
  });

  test('muestra error plural cuando fallan varios items', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/uno',
        method: 'POST',
        body: { a: 1 },
      },
      {
        id: '2',
        url: '/api/dos',
        method: 'POST',
        body: { b: 2 },
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await mount();

    await dispatchWindowEvent('online');

    expect(mockRemoveFromQueue).not.toHaveBeenCalled();
    expect(text('pending-count')).toBe('2');
    expect(text('sync-error')).toBe('2 cambios no pudieron sincronizarse.');
  });

  test('cuenta como fallo cuando fetch lanza error', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/recibos',
        method: 'POST',
        body: { monto: 300 },
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    global.fetch.mockRejectedValue(new Error('Sin conexión'));

    await mount();

    await dispatchWindowEvent('online');

    expect(mockRemoveFromQueue).not.toHaveBeenCalled();
    expect(text('pending-count')).toBe('1');
    expect(text('sync-error')).toBe('1 cambio no pudo sincronizarse.');
  });

  test('mantiene fallidos y elimina exitosos dentro de la misma sincronización', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/ok',
        method: 'POST',
        body: { ok: true },
      },
      {
        id: '2',
        url: '/api/falla',
        method: 'POST',
        body: { ok: false },
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    await mount();

    await dispatchWindowEvent('online');

    expect(mockRemoveFromQueue).toHaveBeenCalledWith('1');
    expect(mockRemoveFromQueue).not.toHaveBeenCalledWith('2');
    expect(text('pending-count')).toBe('1');
    expect(text('sync-error')).toBe('1 cambio no pudo sincronizarse.');
  });

  test('muestra syncing true mientras la sincronización sigue pendiente', async () => {
    queueItems = [
      {
        id: '1',
        url: '/api/recibos',
        method: 'POST',
        body: { monto: 300 },
      },
    ];

    mockGetValidToken.mockReturnValue('token-123');

    let resolver;

    global.fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        })
    );

    await mount();

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    expect(text('syncing')).toBe('true');

    await act(async () => {
      resolver({
        ok: true,
        status: 200,
      });
    });

    await flushPromises();

    expect(text('syncing')).toBe('false');
    expect(text('pending-count')).toBe('0');
  });

  test('limpia listeners al desmontar el hook', async () => {
    await mount();

    await act(async () => {
      root.unmount();
    });

    root = null;

    queueItems = [
      {
        id: '1',
        url: '/api/test',
        method: 'POST',
        body: {},
      },
    ];

    window.dispatchEvent(new Event('aebnl:queue-updated'));

    expect(container.textContent).not.toContain('1');
  });
});