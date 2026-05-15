import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HU - 019 - Mostrar accesos claros, visibles y organizados', async ({ page }) => {
  qase.id(64);
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).click();
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: 'Tablero' }).click();
  await expect(page.getByRole('button', { name: 'Registrar Servicio Documentar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo Beneficiario Alta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agendar Cita Gestionar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recibos Control de pagos y' })).toBeVisible();
});

test('HU - 019 - Visualizar accesos directos en el menú de inicio', async ({ page }) => {
qase.id(61);
  await page.goto('http://localhost:5173/login');
  await page.locator('.input-box').first().click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).click();
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: 'Tablero' }).click();
  await expect(page.locator('#root')).toContainText('Registrar Servicio');
  await expect(page.locator('#root')).toContainText('Nuevo Beneficiario');
  await expect(page.locator('#root')).toContainText('Agendar Cita');
  await expect(page.locator('#root')).toContainText('Recibos');
});

test('HU - 019 - Redirigir al módulo de registro de beneficiario', async ({ page }) => {
    qase.id(62);
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).click();
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: 'Tablero' }).click();
  await page.getByRole('button', { name: 'Nuevo Beneficiario Alta' }).click();
  await expect(page.getByRole('heading', { name: 'Registro de Nuevo Beneficiario' })).toBeVisible();
});

test('HU - 019 - Redirigir al modulo de registro de recibos', async ({ page }) => {
    qase.id(63);
  await page.goto('http://localhost:5173/login');
  await page.locator('.input-box').first().click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).click();
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: 'Tablero' }).click();
  await page.getByRole('button', { name: 'Recibos Control de pagos y' }).click();
  await expect(page.getByRole('heading', { name: 'Recibos', exact: true })).toBeVisible();
  await page.getByText('RecibosRegistro de servicios y cobrosFechaHoyRecibos del día14 may 2026⌕Sin').click();
});