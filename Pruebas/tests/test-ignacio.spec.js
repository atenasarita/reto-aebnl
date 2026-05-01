const { test, expect } = require('@playwright/test');
import { qase } from 'playwright-qase-reporter';

test(qase(13, 'HU - 013 - Cambio automático de actividad de membresía a inactivo #HU013-1'), async ({ page }) => {  
    
    // Iniciar Sesión
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL('**/beneficiarios');

    // Buscar el beneficiario
    const beneficiarioAVencer= 'Maria Gonzalez Martinez'; 
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioAVencer);
    const tarjeta = page.locator('.tarjeta-beneficiario', { hasText: beneficiarioAVencer });

    // Verificar si tiene el estatus de Activo
    await expect(tarjeta.locator('.badge-estado')).toHaveText(/Activo/i);

    // Aplicar la hora en la que se termina la membresía
    console.log('Cambiando fecha del sistema...');
    await page.clock.setFixedTime(new Date('2026-05-01T03:00:00Z')); 
    await page.reload();

    // Aplicar filtro de Inactivo
    await page.getByText('Todos', { exact: true }).click();
    await page.getByText('Inactivo', { exact: true }).click();

    // Verificar que aparece el beneficiario
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioAVencer);
    await expect(tarjeta).toBeVisible();

    // Aplicar filtro de Activo
    await page.getByText('Inactivo', { exact: true }).click();
    await page.getByText('Activo', { exact: true }).click(); 

    // Verificar que no está activo
    await expect(page.locator('.tarjeta-beneficiario', { hasText: beneficiarioAVencer })).not.toBeVisible();
});

test(qase(14, 'HU - 013 - Cambio automático de actividad de membresía a inactivo #HU013-2'), async ({ page }) => {  
    
    // Iniciar Sesión
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL('**/beneficiarios');

    // Buscar el beneficiario que no se va a vencer
    const beneficiarioActivo = 'Sofia Ramirez Santos'; 
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioActivo);
    const tarjeta = page.locator('.tarjeta-beneficiario', { hasText: beneficiarioActivo });

    // Verificar si tiene el estatus de Activo al inicio
    await expect(tarjeta.locator('.badge-estado')).toHaveText(/activo/i);

    // Adelantar la fecha del sistema
    console.log('Adelantando fecha del sistema...');
    await page.clock.setFixedTime(new Date('2026-05-01T03:00:00Z')); 
    await page.reload();

    // Aplicar filtro de Activo
    await page.getByText('Todos', { exact: true }).click();
    await page.getByText('Activo', { exact: true }).click();

    // Verificar que el beneficiario aparece
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioActivo);
    await expect(tarjeta).toBeVisible();

    // Aplicar filtro de Inactivo
    await page.getByText('Activo', { exact: true }).click();
    await page.getByText('Inactivo', { exact: true }).click(); 

    // Verificar que el beneficiario no aparece
    await expect(page.locator('.tarjeta-beneficiario', { hasText: beneficiarioActivo })).not.toBeVisible();
});