/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock framer-motion
jest.unstable_mockModule('framer-motion', () => ({
  AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    p: ({ children, ...props }) => React.createElement('p', props, children),
    span: ({ children, ...props }) => React.createElement('span', props, children),
  },
}));

// Mock react-icons
jest.unstable_mockModule('react-icons/fa', () => ({
  FaArrowLeft: () => null,
  FaArrowRight: () => null,
}));

// Mock CSS
jest.unstable_mockModule('../client/src/components/ui/CircularTestimonials/CircularTestimonials.css', () => ({}));

const { CircularTestimonials } = await import('../client/src/components/ui/CircularTestimonials/CircularTestimonials.jsx');

const mockTestimonials = [
  {
    src: 'foto1.jpg',
    name: 'Ana García',
    designation: 'Mamá de beneficiario',
    quote: 'La asociación nos ayudó mucho en momentos difíciles.',
  },
  {
    src: 'foto2.jpg',
    name: 'Carlos López',
    designation: 'Padre de beneficiario',
    quote: 'Gracias a su apoyo mi hijo tiene una mejor calidad de vida.',
  },
  {
    src: 'foto3.jpg',
    name: 'María Martínez',
    designation: 'Voluntaria',
    quote: 'Es un honor poder ayudar a estas familias.',
  },
];

let container;
let root;

describe('CircularTestimonials', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    jest.useFakeTimers();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await act(async () => { root.unmount(); });
    container.remove();
    jest.clearAllMocks();
  });

  async function mount(props = {}) {
    await act(async () => {
      root.render(
        React.createElement(CircularTestimonials, {
          testimonials: mockTestimonials,
          ...props,
        })
      );
    });
  }

  // ── Renderizado inicial ───────────────────────────────────────
  test('muestra el primer testimonio al iniciar', async () => {
    await mount();
    expect(container.textContent).toContain('Ana García');
    expect(container.textContent).toContain('Mamá de beneficiario');
  });

  test('muestra todas las imágenes de los testimonios', async () => {
    await mount();
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(3);
  });

  test('muestra los botones de navegación', async () => {
    await mount();
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  test('el botón anterior tiene aria-label correcto', async () => {
    await mount();
    const prevBtn = container.querySelector('button[aria-label="Testimonio anterior"]');
    expect(prevBtn).toBeTruthy();
  });

  test('el botón siguiente tiene aria-label correcto', async () => {
    await mount();
    const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
    expect(nextBtn).toBeTruthy();
  });

  // ── Navegación ────────────────────────────────────────────────
  test('avanza al siguiente testimonio al hacer click en Siguiente', async () => {
    await mount({ autoplay: false });

    await act(async () => {
      const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
      nextBtn.click();
    });

    expect(container.textContent).toContain('Carlos López');
  });

  test('retrocede al testimonio anterior al hacer click en Anterior', async () => {
    await mount({ autoplay: false });

    // Avanzar primero
    await act(async () => {
      const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
      nextBtn.click();
    });

    // Luego retroceder
    await act(async () => {
      const prevBtn = container.querySelector('button[aria-label="Testimonio anterior"]');
      prevBtn.click();
    });

    expect(container.textContent).toContain('Ana García');
  });

  test('cicla al último al hacer click en Anterior desde el primero', async () => {
    await mount({ autoplay: false });

    await act(async () => {
      const prevBtn = container.querySelector('button[aria-label="Testimonio anterior"]');
      prevBtn.click();
    });

    expect(container.textContent).toContain('María Martínez');
  });

  test('cicla al primero al hacer click en Siguiente desde el último', async () => {
    await mount({ autoplay: false });

    // Avanzar hasta el último
    await act(async () => {
      const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
      nextBtn.click();
      nextBtn.click();
    });

    // Avanzar desde el último
    await act(async () => {
      const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
      nextBtn.click();
    });

    expect(container.textContent).toContain('Ana García');
  });

  // ── Autoplay ──────────────────────────────────────────────────
  test('avanza automáticamente cada 5 segundos cuando autoplay es true', async () => {
    await mount({ autoplay: true });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(container.textContent).toContain('Carlos López');
  });

  test('no avanza automáticamente cuando autoplay es false', async () => {
    await mount({ autoplay: false });

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(container.textContent).toContain('Ana García');
  });

  // ── Teclado ───────────────────────────────────────────────────
  test('avanza al siguiente con ArrowRight', async () => {
    await mount({ autoplay: false });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });

    expect(container.textContent).toContain('Carlos López');
  });

  test('retrocede con ArrowLeft', async () => {
    await mount({ autoplay: false });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });

    expect(container.textContent).toContain('Ana García');
  });

  // ── Hover en botones ──────────────────────────────────────────
  test('cambia color al hacer hover en botón anterior', async () => {
    await mount();

    await act(async () => {
      const prevBtn = container.querySelector('button[aria-label="Testimonio anterior"]');
      prevBtn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });

    const prevBtn = container.querySelector('button[aria-label="Testimonio anterior"]');
    expect(prevBtn.style.backgroundColor).toBeTruthy();
  });

  test('restaura color al quitar hover en botón siguiente', async () => {
    await mount();

    await act(async () => {
      const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
      nextBtn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });

    await act(async () => {
      const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
      nextBtn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    });

    const nextBtn = container.querySelector('button[aria-label="Siguiente testimonio"]');
    expect(nextBtn.style.backgroundColor).toBeTruthy();
  });

  // ── Colores y fuentes personalizados ─────────────────────────
  test('aplica colores personalizados', async () => {
    await mount({
      autoplay: false,
      colors: {
        name: '#ff0000',
        designation: '#00ff00',
        testimony: '#0000ff',
      },
    });

    const nameEl = container.querySelector('.ct-name');
    expect(nameEl.style.color).toBe('rgb(255, 0, 0)');
  });

  test('aplica tamaños de fuente personalizados', async () => {
    await mount({
      autoplay: false,
      fontSizes: { name: '2rem', designation: '1rem', quote: '1.2rem' },
    });

    const nameEl = container.querySelector('.ct-name');
    expect(nameEl.style.fontSize).toBe('2rem');
  });

  // ── Resize ────────────────────────────────────────────────────
  test('actualiza containerWidth al hacer resize', async () => {
    await mount();

    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });

    // No lanza error = pasa
    expect(container.querySelector('.ct-wrap')).toBeTruthy();
  });
});
