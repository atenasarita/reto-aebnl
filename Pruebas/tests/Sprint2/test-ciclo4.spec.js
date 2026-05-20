import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('HU - 019 - Redirigir al módulo de registro de beneficiario', async ({ page }) => {
    qase.id(62);
  await page.goto('https://aebnl.netlify.app');
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).click();
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: 'Inicio' }).click();
  await page.getByRole('button', { name: 'Nuevo Beneficiario Alta' }).click();
  await expect(page.getByRole('heading', { name: 'Registro de Nuevo Beneficiario' })).toBeVisible();
});