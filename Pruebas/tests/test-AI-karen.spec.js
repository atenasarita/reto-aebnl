import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

function generarCURP() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';

  const rand = (chars, len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  const fecha = '000101'; // puedes hacerlo dinámico si quieres

  return (
    rand(letras, 4) +   // iniciales
    fecha +             // fecha nacimiento
    rand(letras, 6) +   // entidad + consonantes
    rand(numeros, 2)    // homoclave
  );
}

const curp = generarCURP();

test(qase(6, 'HU - 007 - Pre-Registro de Beneficiarios - Caso de Prueba #HU007-1'), async ({ page }) => {

    await page.goto('http://localhost:5173/login');

    // Login
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Validar navegación
    await expect(page.getByRole('button', { name: 'Prerregistro' })).toBeVisible();

    // Ir a prerregistro
    await page.getByRole('button', { name: 'Prerregistro' }).click();

    // Datos personales
    await page.getByRole('textbox', { name: 'Ej. Aldo' }).fill('Juan');
    await page.getByRole('textbox', { name: 'Ej. Flores' }).fill('Pérez');
    await page.getByRole('textbox', { name: 'Ej. González' }).fill('Lopez');

    await page.getByRole('button', { name: 'Continuar →' }).click();

    // Validar cambio de sección
    await expect(page.locator('input[type="date"]')).toBeVisible();

    // Datos demográficos
    await page.locator('input[type="date"]').fill('2000-01-01');
    await page.getByRole('combobox').selectOption('masculino');
    await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).fill(curp);

    await page.getByRole('button', { name: 'Continuar →' }).click();

    // Validar siguiente sección
    await expect(page.getByText('Espina Bífida Oculta')).toBeVisible();

    // Diagnóstico
    await page.getByText('Espina Bífida Oculta').click();

    // Registro
    await page.getByRole('button', { name: 'Registrarse ✓' }).click();

    // Validar pantalla de éxito
    const successContainer = page.locator('.step-content.success-screen');

    await expect(successContainer).toBeVisible();
});

test(qase(8, 'HU - 007 - CURP con longitud inválida - Caso de Prueba #HU007-2'), async ({ page }) => {

    await page.goto('http://localhost:5173/login');

    // Login
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await page.getByRole('button', { name: 'Prerregistro' }).click();

    // Datos personales
    await page.getByRole('textbox', { name: 'Ej. Aldo' }).fill('Ana');
    await page.getByRole('textbox', { name: 'Ej. Flores' }).fill('Garcia');
    await page.getByRole('textbox', { name: 'Ej. González' }).fill('Diaz');

    await page.getByRole('button', { name: 'Continuar →' }).click();

    // Datos demográficos
    await page.locator('input[type="date"]').fill('2000-01-01');
    await page.getByRole('combobox').selectOption('femenino');

    const curpInput = page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' });
    const continuarBtn = page.getByRole('button', { name: 'Continuar →' });

    // CURP inválida (<18 caracteres)
    await curpInput.fill('PELJ000101HNL');

    // VALIDACIÓN CLAVE
    await expect(continuarBtn).toBeDisabled();

    // Intentar hacer click (no debe avanzar)
    await continuarBtn.click({ force: true });

    // Validar que NO avanzó (seguimos en misma sección)
    await expect(curpInput).toBeVisible();

    // Corregir CURP
    await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).fill(curp);

    // Ahora debe habilitarse
    await expect(continuarBtn).toBeEnabled();

    // Continuar flujo
    await continuarBtn.click();

    // Validar que ahora sí avanzó
    await expect(page.locator('label:nth-child(7) > .checkbox-card-mark')).toBeVisible();

    await page.locator('label:nth-child(7) > .checkbox-card-mark').click();
    await page.getByRole('button', { name: 'Registrarse ✓' }).click();
});