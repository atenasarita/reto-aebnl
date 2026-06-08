/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import {
  enqueue,
  getQueue,
  removeFromQueue,
  queueSize,
} from '../client/src/utils/offlineQueue.js';

const QUEUE_KEY = 'aebnl_offline_queue';

describe('offlineQueue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('enqueue agrega un ítem a la cola y devuelve su id', () => {
    const id = enqueue({ url: '/api/registro_servicios', method: 'POST', body: { dato: 1 }, label: 'prueba' });

    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(queueSize()).toBe(1);
  });

  test('getQueue devuelve array vacío cuando la cola está vacía', () => {
    expect(getQueue()).toEqual([]);
  });

  test('getQueue devuelve los ítems en el orden en que fueron encolados', () => {
    enqueue({ url: '/api/a', method: 'POST', body: {}, label: 'A' });
    enqueue({ url: '/api/b', method: 'PUT', body: { x: 2 }, label: 'B' });

    const queue = getQueue();

    expect(queue).toHaveLength(2);
    expect(queue[0].url).toBe('/api/a');
    expect(queue[1].url).toBe('/api/b');
    expect(queue[1].method).toBe('PUT');
  });

  test('queueSize refleja el número actual de ítems en la cola', () => {
    expect(queueSize()).toBe(0);

    enqueue({ url: '/api/x', method: 'POST', body: {}, label: 'X' });
    expect(queueSize()).toBe(1);

    enqueue({ url: '/api/y', method: 'POST', body: {}, label: 'Y' });
    expect(queueSize()).toBe(2);
  });

  test('removeFromQueue elimina solo el ítem con el id indicado', () => {
    const id1 = enqueue({ url: '/api/a', method: 'POST', body: {}, label: 'A' });
    enqueue({ url: '/api/b', method: 'POST', body: {}, label: 'B' });

    removeFromQueue(id1);

    expect(queueSize()).toBe(1);
    expect(getQueue()[0].url).toBe('/api/b');
  });

  test('removeFromQueue no modifica la cola si el id no existe', () => {
    enqueue({ url: '/api/a', method: 'POST', body: {}, label: 'A' });

    removeFromQueue('id-inexistente');

    expect(queueSize()).toBe(1);
  });

  test('enqueue persiste la cola en localStorage bajo la clave correcta', () => {
    enqueue({ url: '/api/registro_servicios', method: 'POST', body: { id_beneficiario: 1 }, label: 'Registro de servicio' });

    const raw = localStorage.getItem(QUEUE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].url).toBe('/api/registro_servicios');
    expect(parsed[0].body).toEqual({ id_beneficiario: 1 });
  });

  test('cada ítem encolado incluye id, queuedAt y los datos originales', () => {
    const body = { id_beneficiario: 5, servicio: 'consulta' };
    const id = enqueue({ url: '/api/registro_servicios', method: 'POST', body, label: 'Registro de servicio' });

    const item = getQueue()[0];

    expect(item.id).toBe(id);
    expect(typeof item.queuedAt).toBe('number');
    expect(item.queuedAt).toBeLessThanOrEqual(Date.now());
    expect(item.url).toBe('/api/registro_servicios');
    expect(item.method).toBe('POST');
    expect(item.body).toEqual(body);
    expect(item.label).toBe('Registro de servicio');
  });

  test('enqueue despacha el evento aebnl:queue-updated', () => {
    const listener = jest.fn();
    window.addEventListener('aebnl:queue-updated', listener);

    enqueue({ url: '/api/test', method: 'POST', body: {}, label: 'test' });

    window.removeEventListener('aebnl:queue-updated', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('removeFromQueue despacha el evento aebnl:queue-updated', () => {
    const id = enqueue({ url: '/api/test', method: 'POST', body: {}, label: 'test' });

    const listener = jest.fn();
    window.addEventListener('aebnl:queue-updated', listener);

    removeFromQueue(id);

    window.removeEventListener('aebnl:queue-updated', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('getQueue devuelve array vacío si localStorage contiene JSON inválido', () => {
    localStorage.setItem(QUEUE_KEY, 'no-es-json-valido{{');

    expect(getQueue()).toEqual([]);
  });

  test('varios enqueue acumulan la cola correctamente', () => {
    for (let i = 0; i < 5; i++) {
      enqueue({ url: `/api/item-${i}`, method: 'POST', body: { i }, label: `item-${i}` });
    }

    expect(queueSize()).toBe(5);

    const urls = getQueue().map((item) => item.url);
    expect(urls).toEqual([
      '/api/item-0',
      '/api/item-1',
      '/api/item-2',
      '/api/item-3',
      '/api/item-4',
    ]);
  });

  test('vaciar la cola por removeFromQueue individual deja queueSize en 0', () => {
    const id1 = enqueue({ url: '/api/a', method: 'POST', body: {}, label: 'A' });
    const id2 = enqueue({ url: '/api/b', method: 'POST', body: {}, label: 'B' });

    removeFromQueue(id1);
    removeFromQueue(id2);

    expect(queueSize()).toBe(0);
    expect(getQueue()).toEqual([]);
  });
});

