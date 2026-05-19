import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(120, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-1'), async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await page.getByRole('button', { name: 'Beneficiarios' }).click();

    await expect(page.locator('[class*="_card_"]').first()).toBeVisible();

    await page.locator('select.dropdown-select').selectOption('activo');

    await page.locator('input.search-input').fill('Atenas Arita Garcia');

    await expect(page.locator('[class*="_card_"]').first()).toBeVisible();

    await page.locator('button[title="Ver credencial"]').first().click();

    await expect(page.getByText('Maria Gonzalez Martinez')).toBeVisible();

    await expect(page.getByText(/vigencia|vigente|válido/i).first()).toBeVisible();


    await expect(page.getByText(/activo/i).first()).toBeVisible();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});

test(qase(121, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-2'), async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await page.getByRole('button', { name: 'Beneficiarios' }).click();

    await expect(page.locator('[class*="_card_"]').first()).toBeVisible();

    await page.locator('select.dropdown-select').selectOption('inactivo');

    await expect(page.locator('[class*="_card_"]').first()).toBeVisible();

    await page.locator('button[title="Ver credencial"]').first().click();

    await expect(page.getByText(/inactivo/i).first()).toBeVisible();

    await expect(page.getByText(/^activo$/i)).not.toBeVisible();

    await expect(page.getByText(/vigencia|vigente|válido/i).first()).toBeVisible();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});