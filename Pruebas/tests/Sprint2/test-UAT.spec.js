/*
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

test('HU – 011 - Visualizar recibos por fecha', async ({ page }) => {
    qase.id(128);
    await test.step('Ingresar datos de inicio de sesión', async () => {
            await page.goto('https://aebnl.netlify.app');
            await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
            await page.getByRole('textbox', { name: '********' }).fill('admin1');
    });
    await test.step('Iniciar Sesión', async () => {
        await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    });
    await test.step('Ir a la página de recibos', async () => {
        await page.getByRole('button', { name: 'Recibos' }).click();
    });
    await test.step('Dar clic al menú de fechas', async () => {
        await page.locator('.fecha-input').click();
        
    });
}); 
*/
