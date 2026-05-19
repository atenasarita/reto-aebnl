import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.beforeEach(async ({ page }) => {
  await page.goto('https://aebnl.netlify.app');
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).click();
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
});


test('HU - 019 - Redirigir al modulo de registro de recibos', async ({ page }) => {
    qase.id(63);
  await page.getByRole('button', { name: 'Inicio' }).click();
  await page.getByRole('button', { name: 'Recibos Control de pagos y' }).click();
  await expect(page.getByRole('heading', { name: 'Recibos', exact: true })).toBeVisible();
});

