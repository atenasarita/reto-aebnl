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

const mockGetValidToken = jest.fn();
const mockGsapFrom = jest.fn();
const mockGsapFromTo = jest.fn();
const mockGsapRegisterPlugin = jest.fn();
const mockScrollTriggerKill = jest.fn();

let prefersReducedMotion = false;

global.matchMedia = jest.fn((query) => ({
  matches: prefersReducedMotion && query === '(prefers-reduced-motion: reduce)',
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

global.scrollTo = jest.fn();

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: jest.fn(),
});

jest.mock('react-router-dom', () => ({
  __esModule: true,
  Link: ({ to, children, ...props }) =>
    React.createElement('a', { href: to, ...props }, children),
  Navigate: ({ to, replace }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'navigate',
        'data-to': to,
        'data-replace': String(Boolean(replace)),
      },
      `Navigate to ${to}`
    ),
}));

jest.mock('../client/src/utils/auth', () => ({
  __esModule: true,
  getValidToken: () => mockGetValidToken(),
}));

jest.mock('../client/src/utils/auth.js', () => ({
  __esModule: true,
  getValidToken: () => mockGetValidToken(),
}));

jest.mock('gsap', () => ({
  __esModule: true,
  default: {
    registerPlugin: (...args) => mockGsapRegisterPlugin(...args),
    from: (...args) => mockGsapFrom(...args),
    fromTo: (...args) => mockGsapFromTo(...args),
    utils: {
      toArray: () => [],
    },
  },
}));

jest.mock('gsap/ScrollTrigger', () => ({
  __esModule: true,
  ScrollTrigger: {
    getAll: () => [
      {
        kill: mockScrollTriggerKill,
      },
    ],
  },
}));

jest.mock('@gsap/react', () => ({
  __esModule: true,
  useGSAP: (callback) => {
    React.useEffect(() => {
      callback();
    }, []);
  },
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  ArrowDown: () => React.createElement('span', { 'data-testid': 'icon-arrow-down' }),
  ArrowUp: () => React.createElement('span', { 'data-testid': 'icon-arrow-up' }),
  ChevronRight: () => React.createElement('span', { 'data-testid': 'icon-chevron-right' }),
  Heart: () => React.createElement('span', { 'data-testid': 'icon-heart' }),
  Mail: () => React.createElement('span', { 'data-testid': 'icon-mail' }),
  MapPin: () => React.createElement('span', { 'data-testid': 'icon-map-pin' }),
  Phone: () => React.createElement('span', { 'data-testid': 'icon-phone' }),
}));

jest.mock('react-icons/fa', () => ({
  __esModule: true,
  FaFacebook: () => React.createElement('span', { 'data-testid': 'icon-facebook' }),
  FaInstagram: () => React.createElement('span', { 'data-testid': 'icon-instagram' }),
  FaWhatsapp: () => React.createElement('span', { 'data-testid': 'icon-whatsapp' }),
}));

jest.mock('../client/src/pages/preregistro/Preregistro', () => ({
  __esModule: true,
  default: () => React.createElement('section', { 'data-testid': 'preregistro' }, 'Preregistro mock'),
}));

jest.mock('../client/src/pages/preregistro/Preregistro.jsx', () => ({
  __esModule: true,
  default: () => React.createElement('section', { 'data-testid': 'preregistro' }, 'Preregistro mock'),
}));

jest.mock('../client/src/components/ui/CircularTestimonials/CircularTestimonials', () => ({
  __esModule: true,
  default: ({ testimonials, autoplay, colors, fontSizes }) =>
    React.createElement(
      'section',
      { 'data-testid': 'circular-testimonials' },
      React.createElement('p', null, `Testimonios: ${testimonials.length}`),
      React.createElement('p', null, `Autoplay: ${String(Boolean(autoplay))}`),
      React.createElement('p', null, colors?.name || ''),
      React.createElement('p', null, fontSizes?.name || '')
    ),
}));

jest.mock('../client/src/components/ui/CircularTestimonials/CircularTestimonials.jsx', () => ({
  __esModule: true,
  default: ({ testimonials, autoplay, colors, fontSizes }) =>
    React.createElement(
      'section',
      { 'data-testid': 'circular-testimonials' },
      React.createElement('p', null, `Testimonios: ${testimonials.length}`),
      React.createElement('p', null, `Autoplay: ${String(Boolean(autoplay))}`),
      React.createElement('p', null, colors?.name || ''),
      React.createElement('p', null, fontSizes?.name || '')
    ),
}));

jest.mock('../client/src/constants/aebnlSiteAssets', () => ({
  __esModule: true,
  AEBNL_ASSETS: {
    consultasPhotos: ['hero-1.jpg', 'hero-2.jpg', 'hero-3.jpg'],
    queEsEspinaBifida: 'espina-info.jpg',
    consultasMosaic: 'consultas-mosaic.jpg',
    banorte: 'banorte.jpg',
    apoyanos: 'apoyanos.jpg',
    donorLogos: ['donor-1.jpg', 'donor-2.jpg'],
  },
  AEBNL_CONTACT: {
    facebook: 'https://facebook.test',
    instagram: 'https://instagram.test',
    whatsapp: 'https://wa.test',
    mapsUrl: 'https://maps.test',
    address: 'Dirección de prueba',
    phoneHref: 'tel:8188888888',
    phone: '81 8888 8888',
    phoneMobileHref: 'tel:8199999999',
    phoneMobile: '81 9999 9999',
    email: 'contacto@test.com',
    website: 'https://aebnl.test',
  },
  AEBNL_COPY: {
    quienesSomos: 'Somos una asociación que acompaña a familias de Nuevo León',
    queEsEspinaBifida: 'La espina bífida es una condición congénita.',
  },
  AEBNL_DONATION: {
    bank: 'Banorte',
    account: '1234567890',
    clabe: '012345678901234567',
    slogan: 'Cada donativo ayuda',
    paypalUrl: 'https://paypal.test',
  },
}));

jest.mock('../client/src/constants/aebnlSiteAssets.js', () => ({
  __esModule: true,
  AEBNL_ASSETS: {
    consultasPhotos: ['hero-1.jpg', 'hero-2.jpg', 'hero-3.jpg'],
    queEsEspinaBifida: 'espina-info.jpg',
    consultasMosaic: 'consultas-mosaic.jpg',
    banorte: 'banorte.jpg',
    apoyanos: 'apoyanos.jpg',
    donorLogos: ['donor-1.jpg', 'donor-2.jpg'],
  },
  AEBNL_CONTACT: {
    facebook: 'https://facebook.test',
    instagram: 'https://instagram.test',
    whatsapp: 'https://wa.test',
    mapsUrl: 'https://maps.test',
    address: 'Dirección de prueba',
    phoneHref: 'tel:8188888888',
    phone: '81 8888 8888',
    phoneMobileHref: 'tel:8199999999',
    phoneMobile: '81 9999 9999',
    email: 'contacto@test.com',
    website: 'https://aebnl.test',
  },
  AEBNL_COPY: {
    quienesSomos: 'Somos una asociación que acompaña a familias de Nuevo León',
    queEsEspinaBifida: 'La espina bífida es una condición congénita.',
  },
  AEBNL_DONATION: {
    bank: 'Banorte',
    account: '1234567890',
    clabe: '012345678901234567',
    slogan: 'Cada donativo ayuda',
    paypalUrl: 'https://paypal.test',
  },
}));

jest.mock('../client/src/assets/espina.png', () => ({
  __esModule: true,
  default: 'logo-aebnl.png',
}));

jest.mock('../client/src/pages/landing/landing.css', () => ({}));

const LandingModule = await import('../client/src/pages/landing/Landing.jsx');

const Landing = LandingModule.default?.default || LandingModule.default || LandingModule;

let container;
let root;

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mount() {
  await act(async () => {
    root.render(React.createElement(Landing));
  });

  await flushPromises();
}

async function clickElement(element) {
  if (!element) {
    throw new Error('No se encontró el elemento para hacer click.');
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

async function clickByLabel(label) {
  const element = container.querySelector(`[aria-label="${label}"]`);
  await clickElement(element);
}

async function clickLinkByText(text) {
  const element = Array.from(container.querySelectorAll('a')).find((link) =>
    link.textContent.includes(text)
  );

  if (!element) {
    throw new Error(`No se encontró link con texto: ${text}`);
  }

  await clickElement(element);
}

function getHeroActiveImage() {
  return container.querySelector('.lp-hero-photo.is-active');
}

function getMobileMenu() {
  return container.querySelector('[aria-label="Menú móvil"]');
}

describe('Landing', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest.clearAllMocks();

    prefersReducedMotion = false;
    mockGetValidToken.mockReturnValue(null);

    window.history.replaceState(null, '', '/');
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    container.remove();
    jest.useRealTimers();
  });

  test('redirige a dashboard si existe token válido', async () => {
    mockGetValidToken.mockReturnValue('token-123');

    await mount();

    const redirect = container.querySelector('[data-testid="navigate"]');

    expect(redirect).toBeTruthy();
    expect(redirect.getAttribute('data-to')).toBe('/dashboard');
    expect(redirect.getAttribute('data-replace')).toBe('true');
  });

  test('renderiza secciones principales cuando no hay token', async () => {
    await mount();

    expect(container.textContent).toContain('Tu apoyo');
    expect(container.textContent).toContain('transforma');
    expect(container.textContent).toContain('¿Quiénes somos?');
    expect(container.textContent).toContain('¿Qué es la espina bífida?');
    expect(container.textContent).toContain('Nuestras consultas');
    expect(container.textContent).toContain('Áreas médicas');
    expect(container.textContent).toContain('Lo que dicen las familias');
    expect(container.textContent).toContain('Registra al beneficiario desde aquí');
    expect(container.textContent).toContain('Apóyanos');
    expect(container.textContent).toContain('Quienes nos apoyan');
  });

  test('renderiza navegación principal y links del menú desktop', async () => {
    await mount();

    const nav = container.querySelector('nav[aria-label="Principal"]');

    expect(nav).toBeTruthy();
    expect(container.querySelector('a[aria-label="Inicio"]')).toBeTruthy();
    expect(container.textContent).toContain('Nosotros');
    expect(container.textContent).toContain('Consultas');
    expect(container.textContent).toContain('Áreas');
    expect(container.textContent).toContain('Testimonios');
    expect(container.textContent).toContain('Pre-registro');
    expect(container.textContent).toContain('Apóyanos');
    expect(container.textContent).toContain('Acceso');
  });

  test('abre y cierra menú móvil con botón hamburguesa', async () => {
    await mount();

    expect(getMobileMenu()).toBeFalsy();

    await clickByLabel('Abrir menú');

    expect(getMobileMenu()).toBeTruthy();
    expect(container.querySelector('[aria-label="Cerrar menú"]')).toBeTruthy();

    await clickByLabel('Cerrar menú');

    expect(getMobileMenu()).toBeFalsy();
  });

  test('cierra menú móvil al hacer click en un link del menú', async () => {
    await mount();

    await clickByLabel('Abrir menú');

    expect(getMobileMenu()).toBeTruthy();

    const mobileNosotros = Array.from(container.querySelectorAll('.lp-mobile-link')).find((link) =>
      link.textContent.includes('Nosotros')
    );

    await clickElement(mobileNosotros);

    expect(getMobileMenu()).toBeFalsy();
  });

  test('renderiza CTAs del hero con sus destinos', async () => {
    await mount();

    const preregistroLink = Array.from(container.querySelectorAll('a')).find((link) =>
      link.textContent.includes('Iniciar pre-registro')
    );

    const saberMasLink = Array.from(container.querySelectorAll('a')).find((link) =>
      link.textContent.includes('Saber más')
    );

    expect(preregistroLink.getAttribute('href')).toBe('#preregistro');
    expect(saberMasLink.getAttribute('href')).toBe('#nosotros');
  });

  test('muestra cifras principales de la asociación', async () => {
    await mount();

    expect(container.textContent).toContain('+1,167');
    expect(container.textContent).toContain('Familias integradas');
    expect(container.textContent).toContain('1993');
    expect(container.textContent).toContain('Fundación');
    expect(container.textContent).toContain('30+');
    expect(container.textContent).toContain('Años de servicio');
    expect(container.textContent).toContain('7');
    expect(container.textContent).toContain('Áreas médicas');
  });

  test('renderiza palabras de Quiénes somos separadas en spans', async () => {
    await mount();

    const words = container.querySelectorAll('.lp-word');

    expect(words.length).toBeGreaterThan(5);
    expect(container.textContent).toContain('Somos una asociación');
  });

  test('renderiza imágenes principales con alt accesible', async () => {
    await mount();

    expect(
      container.querySelector(
        'img[alt="Tipos de espina bífida: oculta, meningocele, lipomielomeningocele y mielomeningocele"]'
      )
    ).toBeTruthy();

    expect(
      container.querySelector(
        'img[alt="Momentos de consultas y acompañamiento en la asociación"]'
      )
    ).toBeTruthy();

    expect(
      container.querySelector(
        'img[alt="Niña beneficiaria de AEBNL sosteniendo diploma de agradecimiento por donativo"]'
      )
    ).toBeTruthy();
  });

  test('rota fotos del hero cuando no hay reduced motion', async () => {
    await mount();

    expect(getHeroActiveImage().getAttribute('src')).toBe('hero-1.jpg');

    await act(async () => {
      jest.advanceTimersByTime(5500);
    });

    expect(getHeroActiveImage().getAttribute('src')).toBe('hero-2.jpg');

    await act(async () => {
      jest.advanceTimersByTime(5500);
    });

    expect(getHeroActiveImage().getAttribute('src')).toBe('hero-3.jpg');
  });

  test('no rota fotos del hero si prefers-reduced-motion está activo', async () => {
    prefersReducedMotion = true;

    await mount();

    expect(getHeroActiveImage().getAttribute('src')).toBe('hero-1.jpg');

    await act(async () => {
      jest.advanceTimersByTime(5500);
    });

    expect(getHeroActiveImage().getAttribute('src')).toBe('hero-1.jpg');
  });

  test('hace scroll a preregistro si la página carga con hash #preregistro', async () => {
    window.history.replaceState(null, '', '/#preregistro');

    await mount();

    const preregistroSection = container.querySelector('#preregistro');
    const scrollSpy = jest.spyOn(preregistroSection, 'scrollIntoView');

    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  test('usa comportamiento auto al hacer scroll con reduced motion', async () => {
    prefersReducedMotion = true;
    window.history.replaceState(null, '', '/#preregistro');

    await mount();

    const preregistroSection = container.querySelector('#preregistro');
    const scrollSpy = jest.spyOn(preregistroSection, 'scrollIntoView');

    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });
  });

    test('renderiza acordeón de áreas médicas y cambia clase al pasar mouse', async () => {
        await mount();

        expect(container.querySelector('[aria-label="Áreas médicas"]')).toBeTruthy();
        expect(container.textContent).toContain('Neurocirugía');
        expect(container.textContent).toContain('Ortopedia');
        expect(container.textContent).toContain('Urología');
        expect(container.textContent).toContain('Gastroenterología');

        const firstSlice = container.querySelector('.lp-slice');

        expect(firstSlice.className).not.toContain('is-open');

        await act(async () => {
            firstSlice.dispatchEvent(
            new MouseEvent('mouseover', {
                bubbles: true,
                relatedTarget: document.body,
            })
        );
    });

    await flushPromises();

    expect(firstSlice.className).toContain('is-open');

    await act(async () => {
        firstSlice.dispatchEvent(
        new MouseEvent('mouseout', {
            bubbles: true,
            relatedTarget: document.body,
        })
        );
    });

    await flushPromises();

    expect(firstSlice.className).not.toContain('is-open');
    });

    test('abre área médica con foco y la cierra con blur', async () => {
        await mount();

        const firstSlice = container.querySelector('.lp-slice');
        const firstButton = firstSlice.querySelector('button');

        await act(async () => {
            firstButton.focus();
        });

        await flushPromises();

        expect(firstSlice.className).toContain('is-open');

        await act(async () => {
            firstButton.blur();
        });

        await flushPromises();

        expect(firstSlice.className).not.toContain('is-open');
    });

  test('renderiza testimonios con autoplay y datos esperados', async () => {
    await mount();

    expect(container.querySelector('[data-testid="circular-testimonials"]')).toBeTruthy();
    expect(container.textContent).toContain('Testimonios: 4');
    expect(container.textContent).toContain('Autoplay: true');
  });

  test('renderiza preregistro embebido', async () => {
    await mount();

    expect(container.querySelector('[data-testid="preregistro"]')).toBeTruthy();
    expect(container.textContent).toContain('Preregistro mock');
  });

  test('renderiza datos de donativo y links de contacto', async () => {
    await mount();

    expect(container.textContent).toContain('Transferencia bancaria');
    expect(container.textContent).toContain('Banorte');
    expect(container.textContent).toContain('1234567890');
    expect(container.textContent).toContain('012345678901234567');
    expect(container.textContent).toContain('Cada donativo ayuda');

    expect(container.querySelector('a[href="https://paypal.test"]')).toBeTruthy();
    expect(container.querySelector('a[href="tel:8188888888"]')).toBeTruthy();
  });

  test('renderiza logos de donantes duplicados para marquee', async () => {
    await mount();

    const donorLogos = container.querySelectorAll('.lp-donor-logo');

    expect(donorLogos.length).toBe(4);
  });

  test('renderiza footer con redes sociales, contacto y acceso', async () => {
    await mount();

    expect(container.textContent).toContain('Contacto');
    expect(container.textContent).toContain('Dirección de prueba');
    expect(container.textContent).toContain('T: 81 8888 8888');
    expect(container.textContent).toContain('C: 81 9999 9999');
    expect(container.textContent).toContain('contacto@test.com');
    expect(container.textContent).toContain('Pre-registro de beneficiario');
    expect(container.textContent).toContain('Sistema administrativo');

    expect(container.querySelector('a[aria-label="Facebook"]')).toBeTruthy();
    expect(container.querySelector('a[aria-label="Instagram"]')).toBeTruthy();
    expect(container.querySelector('a[aria-label="WhatsApp"]')).toBeTruthy();
  });

  test('renderiza link para volver arriba', async () => {
    await mount();

    const backTop = container.querySelector('a[aria-label="Volver arriba"]');

    expect(backTop).toBeTruthy();
    expect(backTop.getAttribute('href')).toBe('#hero');
  });

  test('ejecuta animaciones GSAP si no hay reduced motion', async () => {
    await mount();

    expect(mockGsapFrom).toHaveBeenCalled();
  });

  test('no ejecuta animaciones GSAP si hay reduced motion', async () => {
    prefersReducedMotion = true;

    await mount();

    expect(mockGsapFrom).not.toHaveBeenCalled();
    expect(mockGsapFromTo).not.toHaveBeenCalled();
  });

  test('limpia ScrollTrigger al desmontar', async () => {
    await mount();

    await act(async () => {
      root.unmount();
    });

    root = null;

    expect(mockScrollTriggerKill).toHaveBeenCalled();
  });
});