import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

// positivo
test(qase(5, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-1'), async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();// primero navega al módulo de beneficiarios
    await page.getByRole('button', { name: 'Beneficiarios' }).click();

    // activo y con nombre
    await page.getByRole('textbox', { name: 'Buscar por CURP, folio o nombre' }).click();
    await page.getByRole('textbox', { name: 'Buscar por CURP, folio o nombre' }).fill('Juan Perez');

    await expect(page.locator('.card').first()).toBeVisible();

    // activo
    await page.getByRole('combobox').selectOption('activo');
    await expect(page.getByText(/activo/i).first()).toBeVisible();

    // abrir credencial
    await page.locator('button[title="Ver credencial"]').first().click();
    await expect(page.getByText('Juan Perez')).toBeVisible();

    // fechas de vigencia
    await expect(page.getByText(/vigencia|vigente|válido/i).first()).toBeVisible();
    await expect(page.locator('canvas, img[alt*="QR"], svg[data-qr]').first()).toBeVisible();


    // exportar credencial
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);

    // Verificar que el archivo descargado es un PDF
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});

// negativo - inactivo
test(qase(6, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-2'), async ({ page }) => {
   
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    await page.getByRole('button', { name: 'Beneficiarios' }).click();

    // inactivo
    await page.getByRole('combobox').selectOption('inactivo');
    await expect(page.locator('.card').first()).toBeVisible();

    // credencial inactiva
    await page.locator('button[title="Ver credencial"]').first().click();
    await expect(page.getByText(/inactivo/i).first()).toBeVisible();

    // muestra que no esta activo
    await expect(page.getByText(/^activo$/i)).not.toBeVisible();

    // fecha inactiva
    await expect(page.getByText(/vigencia|vigente|válido/i).first()).toBeVisible();

    // exportar credencial inactiva
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);

    // pdf file
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});