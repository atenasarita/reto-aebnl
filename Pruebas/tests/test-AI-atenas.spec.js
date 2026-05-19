const { test, expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');

test.skip(({ browserName }) => browserName === 'firefox', 'No correr en firefox debido a conflicto local');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: '********' }).fill('admin1');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: 'Beneficiarios' }).click();
  await expect(page.locator('[class*="_card_"]').first()).toBeVisible({ timeout: 8000 });
});

test(qase(120, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-1'), async ({ page }) => {
  // Filtrar por estatus activo y buscar por nombre
  await page.locator('select.dropdown-select').selectOption('activo');
  await page.locator('input.search-input').fill('Atenas');
  await page.waitForTimeout(600);

  const firstCard = page.locator('[class*="_card_"]').first();
  await expect(firstCard).toBeVisible({ timeout: 8000 });

  // Verificar badge y nombre en la card
  await expect(firstCard.locator('[class*="_badge_"]')).toHaveText('Activo');
  await expect(firstCard.locator('[class*="_nombre_"]')).toContainText('Atenas');

  // Abrir detalle del beneficiario
  await firstCard.locator('button[title="Ver detalle"]').click();
  const detalle = page.locator('[class*="_modalBody_"]');
  await expect(detalle).toBeVisible({ timeout: 8000 });

  // Verificar campo Nombre (exact match para evitar "Nombre padre / madre")
  await expect(
    detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Nombre$/ })
  ).toBeVisible();
  await expect(
    detalle.locator('[class*="_fieldValue_"]').filter({ hasText: /atenas/i })
  ).toBeVisible();

  // Verificar sección de Vigencia de Membresía
  await expect(
    detalle.locator('[class*="_sectionLabel_"]').filter({ hasText: 'Vigencia de Membresía' })
  ).toBeVisible();
  await expect(
    detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Desde$/ })
  ).toBeVisible();
  await expect(
    detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Hasta$/ })
  ).toBeVisible();

  // Cerrar detalle antes de descargar PDF
  await page.locator('[class*="_closeBtn_"]').click();
  await expect(detalle).not.toBeVisible({ timeout: 3000 });

  // Descargar PDF y verificar extensión
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button[title="Descargar PDF"]').first().click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});

test(qase(121, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-2'), async ({ page }) => {
  // Filtrar por estatus inactivo
  await page.locator('select.dropdown-select').selectOption('inactivo');
  await page.waitForTimeout(600);

  const firstCard = page.locator('[class*="_card_"]').first();
  await expect(firstCard).toBeVisible({ timeout: 8000 });

  // Verificar que el badge diga "Inactivo" y no "Activo"
  await expect(firstCard.locator('[class*="_badge_"]')).toHaveText('Inactivo');
  await expect(firstCard.locator('[class*="_badge_"]')).not.toHaveText('Activo');

  // Abrir detalle del beneficiario
  await firstCard.locator('button[title="Ver detalle"]').click();
  const detalle = page.locator('[class*="_modalBody_"]');
  await expect(detalle).toBeVisible({ timeout: 8000 });

  // Verificar que el detalle muestra datos del beneficiario
  await expect(
    detalle.locator('[class*="_fieldValue_"]').first()
  ).toBeVisible();

  // Verificar sección de Vigencia de Membresía
  await expect(
    detalle.locator('[class*="_sectionLabel_"]').filter({ hasText: 'Vigencia de Membresía' })
  ).toBeVisible();
  await expect(
    detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Desde$/ })
  ).toBeVisible();
  await expect(
    detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Hasta$/ })
  ).toBeVisible();

  // Cerrar detalle antes de descargar PDF
  await page.locator('[class*="_closeBtn_"]').click();
  await expect(detalle).not.toBeVisible({ timeout: 3000 });

  // Descargar PDF y verificar extensión
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button[title="Descargar PDF"]').first().click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});