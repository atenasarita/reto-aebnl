import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

// escenario positovo: credencial de beneficiario con membresía activa muestra información correcta
test(qase(5, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-1'), async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await page.getByRole('button', { name: 'Beneficiarios' }).click();

    await page.getByRole('textbox', { name: 'Buscar por CURP, folio o nombre' }).click();
    await page.getByRole('textbox', { name: 'Buscar por CURP, folio o nombre' }).fill('Juan Carlos López');

    await expect(page.locator('.card').first()).toBeVisible();

    await page.getByRole('combobox').selectOption('activo');

    await page.locator('button[title="Ver credencial"]').first().click();

    await expect(page.getByText('Juan Carlos López')).toBeVisible();

    await expect(page.getByText(/vigencia|vigente|válido/i).first()).toBeVisible();

    await expect(page.locator('canvas, img[alt*="QR"], svg[data-qr]').first()).toBeVisible();

    await expect(page.getByText(/activo/i).first()).toBeVisible();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});

// escenario negativo: credencial de beneficiario con membresía inactiva muestra información correcta y no muestra estatus activo
test(qase(6, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-2'), async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await page.getByRole('button', { name: 'Beneficiarios' }).click();

    await page.getByRole('combobox').selectOption('inactivo');

    await expect(page.locator('.card').first()).toBeVisible();

    await page.locator('button[title="Ver credencial"]').first().click();

    await expect(page.getByText(/inactivo/i).first()).toBeVisible();

    await expect(page.getByText(/^activo$/i)).not.toBeVisible();

    await expect(page.getByText(/vigencia|vigente|válido/i).first()).toBeVisible();

    await expect(page.locator('canvas, img[alt*="QR"], svg[data-qr]').first()).toBeVisible();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});