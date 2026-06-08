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
    fecha + 
    rand("HM", 1) +     // fecha nacimiento
    rand(letras, 5) +   // entidad + consonantes
    rand(numeros, 2)    // homoclave
  );
}

const curp = generarCURP();

test(qase(108, 'HU - 007 - Pre-Registro de Beneficiarios - Caso de Prueba #HU007-1'), async ({ page }) => {
    const curpGenerada = generarCURP();

    await page.goto('http://localhost:5173');

    // Validar navegación
    await page.getByRole('link', { name: 'Iniciar pre-registro' }).click();

    // Datos Personales
    await page.getByRole('textbox', { name: 'Ej. Juan' }).click();
    await page.getByRole('textbox', { name: 'Ej. Juan' }).click();
    await page.getByRole('textbox', { name: 'Ej. Juan' }).fill('Juan');
    await page.getByRole('textbox', { name: 'Primer apellido' }).click();
    await page.getByRole('textbox', { name: 'Primer apellido' }).click();
    await page.getByRole('textbox', { name: 'Primer apellido' }).fill('Perez');
    await page.getByRole('textbox', { name: 'Segundo apellido' }).click();
    await page.getByRole('textbox', { name: 'Segundo apellido' }).fill('Alvarez');
    // Datos de Identificacion
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.locator('input[type="date"]').fill('2026-06-08');
    await page.locator('label').filter({ hasText: 'Masculino' }).click();
    await page.getByRole('textbox', { name: 'Clave Única de Registro de' }).click();
    await page.getByRole('textbox', { name: 'Clave Única de Registro de' }).fill(curpGenerada);
  // Datos de Diagnostico
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByText('Espina Bífida Oculta').click();
    await page.locator('label:nth-child(4) > .preregistro-checkbox-mark').click();
    await page.getByRole('button', { name: 'Enviar Preregistro' }).click();
    await expect(page.getByRole('heading', { name: '¡Preregistro completado!' })).toBeVisible();
    await expect(page.getByText('Tus datos han sido enviados')).toBeVisible();
});

test(qase(110, 'HU - 007 - CURP con longitud inválida - Caso de Prueba #HU007-2'), async ({ page }) => {
  const continuarBtn = page.getByRole('button', { name: 'Continuar' });

  const curpInput = page.getByRole('textbox', {
    name: 'Clave Única de Registro de'
  });

  const curpGenerada = generarCURP();

    await page.goto('http://localhost:5173');

    // Validar navegación
    await page.getByRole('link', { name: 'Iniciar pre-registro' }).click();


    // Datos personales
    await page.getByRole('textbox', { name: 'Ej. Juan' }).click();
    await page.getByRole('textbox', { name: 'Ej. Juan' }).click();
    await page.getByRole('textbox', { name: 'Ej. Juan' }).fill('Juan');
    await page.getByRole('textbox', { name: 'Primer apellido' }).click();
    await page.getByRole('textbox', { name: 'Primer apellido' }).click();
    await page.getByRole('textbox', { name: 'Primer apellido' }).fill('Perez');
    await page.getByRole('textbox', { name: 'Segundo apellido' }).click();
    await page.getByRole('textbox', { name: 'Segundo apellido' }).fill('Alvarez');
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Datos demográficos
    await page.locator('input[type="date"]').fill('2026-06-08');
    await page.locator('label').filter({ hasText: 'Masculino' }).click();
    await page.getByRole('textbox', { name: 'Clave Única de Registro de' }).click();


    // CURP inválida (<18 caracteres)
    await page.getByRole('textbox', { name: 'Clave Única de Registro de' }).fill('PELJ000101HNL');

    // VALIDACIÓN CLAVE
    await expect(continuarBtn).toBeDisabled();

    // Intentar hacer click (no debe avanzar)
    await continuarBtn.click({ force: true });

    // Validar que NO avanzó (seguimos en misma sección)
    await expect(curpInput).toBeVisible();

    // Corregir CURP
    await page.getByRole('textbox', { name: 'Clave Única de Registro de' }).fill(curpGenerada);

    // Ahora debe habilitarse
    await expect(continuarBtn).toBeEnabled();

    // Continuar flujo
    await continuarBtn.click();

    // Validar que ahora sí avanzó
    await page.getByText('Espina Bífida Oculta').click();
    await page.locator('label:nth-child(4) > .preregistro-checkbox-mark').click();
    await page.getByRole('button', { name: 'Enviar Preregistro' }).click();
    await expect(page.getByRole('heading', { name: '¡Preregistro completado!' })).toBeVisible();
    await expect(page.getByText('Tus datos han sido enviados')).toBeVisible();
});