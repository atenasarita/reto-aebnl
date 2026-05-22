const { test, expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');

test.skip(({ browserName }) => browserName === 'firefox', 'No correr en firefox debido a conflicto local');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await page.getByRole('button', { name: '6' }).click();
  await page.getByRole('button', { name: 'Terminación de una membresía' }).click();

  await expect(page.getByRole('combobox')).toBeVisible({ timeout: 8000 });
});

test(qase(106, 'HU - 003 - Alerta de renovación de membresía AI - Caso de prueba #HU003-1'), async ({ page }) => {
  await page.getByRole('combobox').selectOption('por-vencer');
  await page.waitForTimeout(800);

  await expect(
    page.getByText(/Vence hoy|Vence en 1 día|Vence en \d+ días/i).first()
  ).toBeVisible({ timeout: 8000 });
});