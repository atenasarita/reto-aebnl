import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

async function login(page) {
  await page.goto('http://localhost:5173/login');

  await page.locator('.input-box').first().click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await page.getByRole('button', { name: 'Beneficiarios' }).click();
  await expect(page.getByText(/Gestion de Beneficiarios/i)).toBeVisible();
}

test(
  qase(4, 'HU - 003 - Alerta de renovación de membresía - Caso de prueba #HU003-1'),
  async ({ page }) => {
    await login(page);

    await page.getByRole('combobox').selectOption('por-vencer');

    await expect(
      page.getByText(/Vence hoy|Vence en 1 día|Vence en \d+ días/i).first()
    ).toBeVisible();
  }
);

test(
  'HU - 003 - Caso negativo superficial - cargar beneficiarios sin error',
  async ({ page }) => {
    await login(page);

    await expect(page.getByText(/Gestion de Beneficiarios/i)).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByRole('button', { name: /Buscar/i })).toBeVisible();
  }
);