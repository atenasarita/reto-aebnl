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

test('HU - 028 - Visualizar fotografía de beneficiario registrado', async ({ page }) => {
    qase.id(80);
    await test.step('Given que el usuario tiene una sesión activa And existe un beneficiario previamente registrado', async () => {
        await page.getByRole('button', { name: 'Beneficiarios' }).click();
    });
    await test.step('And el beneficiario tiene una fotografía registrada', async () => {
        await page.getByRole('button', { name: '12' }).click();

    });
    await test.step('When el usuario accede al expediente del beneficiario', async () => {
        await page.getByRole('button', { name: 'Ver detalle' }).nth(3).click();
    });
    await test.step('Then el sistema debe mostrar la fotografía de perfil del beneficiario', async () => {
        await expect(page.getByRole('img', { name: 'Foto del beneficiario' })).toBeVisible();
    });
});


test('HU - 028 - Mostrar imagen predeterminada si no existe fotografía', async ({ page }) => {
    qase.id(81);
    await test.step('Given que el usuario tiene una sesión activa And existe un beneficiario previamente registrado And el beneficiario no tiene una fotografía registrada', async () => {
        await page.getByRole('button', { name: 'Beneficiarios' }).click();
    });

    await test.step('When el usuario accede al expediente del beneficiario', async () => {
        await page.getByRole('button', { name: 'Ver detalle' }).first().click();

    });
    await test.step('Then el sistema debe mostrar una imagen predeterminada', async () => {
        await expect(page.locator('div').filter({ hasText: /^JP$/ }).nth(2)).toBeVisible();
    });
});

test('HU - 026 - Visualizar alertas agrupadas por tipo', async ({ page }) => {
    qase.id(76);
    await test.step('Given que el usuario tiene una sesión activa And tiene permiso para acceder al módulo de alertas', async () => {
        await page.getByRole('button', { name: '6' }).click();
        await page.getByRole('button', { name: 'Terminación de una membresía' }).click();
    });

    await test.step('When accede al módulo de alertas', async () => {
        await page.getByRole('button', { name: '6' }).click();
        await page.getByRole('button', { name: 'Escasez de un producto en el' }).click();
    });

    await test.step('Then el sistema debe mostrar las alertas activas', async () => {
        await page.getByRole('button', { name: '6' }).click();
        await page.getByRole('button', { name: 'Prerregistros nuevos 0 Sin' }).click();
    });
});

test('HU - 026 - Clasificar correctamente las alertas por tipo', async ({ page }) => {
    qase.id(79);
        await test.step('Given que el usuario tiene una sesión activa And existen alertas de prerregistro, inventario y citas', async () => {
        await page.getByRole('button', { name: '6' }).click();
        await page.getByRole('button', { name: 'Terminación de una membresía' }).click();
        await expect(page.getByRole('heading', { name: 'Gestion de Beneficiarios' })).toBeVisible();
    });

    await test.step('When accede al módulo de alertas', async () => {
        await page.getByRole('button', { name: '6' }).click();
        await page.getByRole('button', { name: 'Escasez de un producto en el' }).click();
        await expect(page.getByRole('heading', { name: 'Inventario General' })).toBeVisible();
    });

    await test.step('Then cada alerta debe mostrarse dentro de su categoría correspondiente', async () => {
        await page.getByRole('button', { name: '6' }).click();
        await page.getByRole('button', { name: 'Prerregistros nuevos 0 Sin' }).click();
    });

    await test.step('And no debe mezclarse información entre tipos de alerta', async () => {
        await expect(page.getByRole('heading', { name: 'Personas en pre-registro' })).toBeVisible();
    });   
});


test('HU - 026 - Mostrar mensaje cuando no existan alertas activas', async ({ page }) => {
    qase.id(78);
    await test.step('Given no existen alertas activas en el sistema', async () => {
       await page.getByRole('button', { name: 'Alertas' }).click();
    });
        await test.step('Then el sistema debe mostrar un mensaje indicando que no hay alertas activas', async () => {
        await page.getByRole('button', { name: 'Prerregistros nuevos 0 Sin' }).click();
    });
});
