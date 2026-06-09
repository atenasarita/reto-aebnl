/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@fullcalendar/daygrid', () => ({ __esModule: true, default: {} }));
jest.mock('@fullcalendar/timegrid', () => ({ __esModule: true, default: {} }));

jest.mock('@fullcalendar/react', () => ({
  __esModule: true,
  default: ({ events, eventClick, customButtons }) =>
    React.createElement(
      'div',
      { 'data-testid': 'fullcalendar' },
      (events || []).map((event, i) =>
        React.createElement(
          'div',
          {
            key: event.id || i,
            'data-testid': `fc-event-${i}`,
            'data-classnames': (event.classNames || []).join(' '),
            onClick: () => eventClick?.({ event }),
          },
          event.title
        )
      ),
      customButtons?.nuevaCita
        ? React.createElement(
            'button',
            {
              type: 'button',
              'data-testid': 'fc-nueva-cita',
              onClick: () => customButtons.nuevaCita.click(),
            },
            customButtons.nuevaCita.text
          )
        : null
    ),
}));

jest.mock('../client/src/components/layout/citas/DetalleCita', () => ({
  __esModule: true,
  default: ({ cita, onClose, onRefresh }) =>
    React.createElement(
      'div',
      { 'data-testid': 'detalle-cita' },
      cita
        ? React.createElement('p', { 'data-testid': 'cita-title' }, cita.title)
        : null,
      React.createElement(
        'button',
        { type: 'button', 'data-testid': 'detalle-close', onClick: onClose },
        'Cerrar'
      ),
      React.createElement(
        'button',
        { type: 'button', 'data-testid': 'detalle-refresh', onClick: onRefresh },
        'Refrescar'
      )
    ),
}));

jest.mock('../client/src/components/ui/CitasPop', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess }) =>
    open
      ? React.createElement(
          'div',
          { 'data-testid': 'citas-pop' },
          React.createElement(
            'button',
            { type: 'button', 'data-testid': 'pop-close', onClick: onClose },
            'Cerrar'
          ),
          React.createElement(
            'button',
            { type: 'button', 'data-testid': 'pop-success', onClick: onSuccess },
            'Guardar'
          )
        )
      : null,
}));

jest.mock('../client/src/utils/agendaUtils', () => ({
  __esModule: true,
  getAgendaTagClass: jest.fn((item) => `tag-${item.tipo || 'default'}`),
}));

jest.mock('../client/src/utils/dateTime', () => ({
  __esModule: true,
  todayDate: jest.fn(() => '2026-06-07'),
}));

const CalendarioCitasModule = await import(
  '../client/src/components/layout/citas/CalendarioCitas.jsx'
);
const CalendarioCitas =
  CalendarioCitasModule.default?.default ||
  CalendarioCitasModule.default ||
  CalendarioCitasModule;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const citasMock = [
  { id: 1, title: 'Cita con María', tipo: 'consulta' },
  { id: 2, title: 'Seguimiento Juan', tipo: 'seguimiento' },
];

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container;
let root;
let consoleErrorSpy;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  jest.clearAllMocks();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  globalThis.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(citasMock) })
  );
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  consoleErrorSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function mount() {
  await act(async () => {
    root.render(React.createElement(CalendarioCitas));
  });
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CalendarioCitas', () => {
  describe('renderizado inicial', () => {
    test('renderiza el componente FullCalendar', async () => {
      await mount();

      expect(container.querySelector('[data-testid="fullcalendar"]')).not.toBeNull();
    });

    test('renderiza DetalleCita', async () => {
      await mount();

      expect(container.querySelector('[data-testid="detalle-cita"]')).not.toBeNull();
    });

    test('el popup de nueva cita no es visible inicialmente', async () => {
      await mount();

      expect(container.querySelector('[data-testid="citas-pop"]')).toBeNull();
    });
  });

  describe('carga de citas', () => {
    test('llama a fetch con la URL correcta al montar', async () => {
      await mount();

      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/api/citas');
    });

    test('pasa los eventos cargados al calendario', async () => {
      await mount();

      expect(container.querySelector('[data-testid="fc-event-0"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="fc-event-1"]')).not.toBeNull();
      expect(container.textContent).toContain('Cita con María');
      expect(container.textContent).toContain('Seguimiento Juan');
    });

    test('aplica la clase CSS retornada por getAgendaTagClass a cada evento', async () => {
      await mount();

      expect(container.querySelector('[data-classnames="tag-consulta"]')).not.toBeNull();
      expect(container.querySelector('[data-classnames="tag-seguimiento"]')).not.toBeNull();
    });

    test('maneja errores de fetch sin crashear y registra el error', async () => {
      globalThis.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      await mount();

      expect(container.querySelector('[data-testid="fullcalendar"]')).not.toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('selección de cita', () => {
    test('al hacer clic en un evento, pasa la cita a DetalleCita', async () => {
      await mount();

      await act(async () => {
        container.querySelector('[data-testid="fc-event-0"]').click();
      });

      expect(container.querySelector('[data-testid="cita-title"]').textContent).toBe(
        'Cita con María'
      );
    });

    test('al cerrar DetalleCita, limpia la cita seleccionada', async () => {
      await mount();

      await act(async () => {
        container.querySelector('[data-testid="fc-event-0"]').click();
      });

      await act(async () => {
        container.querySelector('[data-testid="detalle-close"]').click();
      });

      expect(container.querySelector('[data-testid="cita-title"]')).toBeNull();
    });

    test('al llamar onRefresh desde DetalleCita, vuelve a hacer fetch', async () => {
      await mount();

      await act(async () => {
        container.querySelector('[data-testid="detalle-refresh"]').click();
      });
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('popup nueva cita', () => {
    test('al hacer clic en "+ Nueva Cita", abre el popup', async () => {
      await mount();

      await act(async () => {
        container.querySelector('[data-testid="fc-nueva-cita"]').click();
      });

      expect(container.querySelector('[data-testid="citas-pop"]')).not.toBeNull();
    });

    test('al cerrar el popup con onClose, lo cierra', async () => {
      await mount();

      await act(async () => {
        container.querySelector('[data-testid="fc-nueva-cita"]').click();
      });

      await act(async () => {
        container.querySelector('[data-testid="pop-close"]').click();
      });

      expect(container.querySelector('[data-testid="citas-pop"]')).toBeNull();
    });

    test('al guardar con éxito, cierra el popup y vuelve a hacer fetch', async () => {
      await mount();

      await act(async () => {
        container.querySelector('[data-testid="fc-nueva-cita"]').click();
      });

      await act(async () => {
        container.querySelector('[data-testid="pop-success"]').click();
      });
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(container.querySelector('[data-testid="citas-pop"]')).toBeNull();
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
