import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

async function loginAndGoToBeneficiarios(page) {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.getByRole('button', { name: 'Beneficiarios' }).click();
    await expect(page.locator('[class*="_card_"]').first()).toBeVisible({ timeout: 8000 });
}

test(qase(120, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-1'), async ({ page }) => {
    await loginAndGoToBeneficiarios(page);

    await page.locator('select.dropdown-select').selectOption('activo');
    await page.locator('input.search-input').fill('Atenas');
    await page.waitForTimeout(600);

    const firstCard = page.locator('[class*="_card_"]').first();
    await expect(firstCard).toBeVisible({ timeout: 8000 });

    await expect(firstCard.locator('[class*="_badge_"]')).toHaveText('Activo');
    await expect(firstCard.locator('[class*="_nombre_"]')).toContainText('Atenas');

    await firstCard.locator('button[title="Ver detalle"]').click();

    const detalle = page.locator('[class*="_modalBody_"]');
    await expect(detalle).toBeVisible({ timeout: 8000 });

    //verifica que usa el field correcto
    await expect(
        detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Nombre$/ })
    ).toBeVisible();

    await expect(
        detalle.locator('[class*="_fieldValue_"]').filter({ hasText: /atenas/i })
    ).toBeVisible();

    
    await expect(
        detalle.locator('[class*="_sectionLabel_"]').filter({ hasText: 'Vigencia de Membresía' })
    ).toBeVisible();
    await expect(
        detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Desde$/ })
    ).toBeVisible();
    await expect(
        detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Hasta$/ })
    ).toBeVisible();

    // cierra el detalle antes de seguir
    await firstCard.locator('button[title="Ver detalle"]').click(); 
    await page.locator('[class*="_closeBtn_"]').click();            
    await expect(detalle).not.toBeVisible({ timeout: 3000 });

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});

test(qase(121, 'HU - 006 - Consulta de beneficiarios - Caso de prueba #HU006-2'), async ({ page }) => {
    await loginAndGoToBeneficiarios(page);

    await page.locator('select.dropdown-select').selectOption('inactivo');
    await page.waitForTimeout(600);

    const firstCard = page.locator('[class*="_card_"]').first();
    await expect(firstCard).toBeVisible({ timeout: 8000 });

    await expect(firstCard.locator('[class*="_badge_"]')).toHaveText('Inactivo');
    await expect(firstCard.locator('[class*="_badge_"]')).not.toHaveText('Activo');

    await firstCard.locator('button[title="Ver detalle"]').click();

    const detalle = page.locator('[class*="_modalBody_"]');
    await expect(detalle).toBeVisible({ timeout: 8000 });

    await expect(
        detalle.locator('[class*="_fieldValue_"]').first()
    ).toBeVisible();

    await expect(
        detalle.locator('[class*="_sectionLabel_"]').filter({ hasText: 'Vigencia de Membresía' })
    ).toBeVisible();
    await expect(
        detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Desde$/ })
    ).toBeVisible();
    await expect(
        detalle.locator('[class*="_fieldLabel_"]').filter({ hasText: /^Hasta$/ })
    ).toBeVisible();

    await page.locator('[class*="_closeBtn_"]').click();
    await expect(detalle).not.toBeVisible({ timeout: 3000 });

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('button[title="Descargar PDF"]').first().click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});
