import { test, expect } from '@playwright/test';
const { qase } = require('playwright-qase-reporter');

test.describe('Inicio de sesión (HU-002) — versión IA', () => {
  const BASE = 'http://localhost:5173';

  /**
   * Completa el formulario de login sin enviarlo.
   */
  const rellenarCredenciales = async (page, { usuario, contraseña }) => {
    await page.goto(`${BASE}/login`);
    await page.getByRole('textbox', { name: 'Usuario' }).fill(usuario);
    await page.getByRole('textbox', { name: "Contraseña" }).fill(contraseña);
  };

  test(qase(111, 'HU-002-1 — inicio de sesión exitoso redirige a beneficiarios'), async ({
    page,
  }) => {
    await rellenarCredenciales(page, { usuario: 'prueba1', contraseña: 'admin1' });
    await page.getByRole('button', { name: 'Entrar al sistema' }).click();

    await expect(page).toHaveURL(/\/recibos/);
  });

  test(qase(112, 'HU-002-2 — credenciales incorrectas muestran mensaje de error'), async ({
    page,
  }) => {
    await rellenarCredenciales(page, { usuario: 'admin2', contraseña: 'prueba2' });
    await page.getByRole('button', { name: 'Entrar al sistema' }).click();

 
    await expect(page.getByRole('alert')).toContainText('Usuario o contraseña incorrectos.');
    await expect(page).toHaveURL(/\/login/);
  });
});
