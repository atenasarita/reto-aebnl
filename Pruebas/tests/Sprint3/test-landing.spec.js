import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';


test('Barra de Navegación en Landing Page', async ({ page }) => {
  qase.id(210);
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('NosotrosConsultasÁ')).toBeVisible();
  await page.getByRole('link', { name: 'Inicio' }).click();
  await expect(page.getByRole('link', { name: 'Acceso' })).toBeVisible();
});


test('Botones de Navegacion Landing Page', async ({ page }) => {
    qase.id(211);
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('link', { name: 'Iniciar pre-registro' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Saber más' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible();
});


test('Navegacion a Nosotros Landing Page', async ({ page }) => {
    qase.id(212);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Nosotros' }).click();
  await expect(page.locator('#nosotros')).toContainText('¿Quiénes somos?');
  await expect(page.locator('#nosotros')).toContainText('¿Qué es la espina bífida?');
});

test('Navegacion a Consultas Landing Page', async ({ page }) => {
    qase.id(213);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Consultas' }).click();
  await expect(page.locator('#consultas')).toContainText('Nuestras consultas');
  await expect(page.locator('#consultas')).toContainText('Acompañamos a familias en consultas, orientación y seguimiento continuo con un equipo comprometido con la salud y el bienestar.');
  await expect(page.getByRole('img', { name: 'Momentos de consultas y' })).toBeVisible();
});

test('Navegacion a Areas Medicas Landing Page', async ({ page }) => {
    qase.id(214);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Áreas' }).click();
  await expect(page.getByRole('heading', { name: 'Áreas médicas' })).toBeVisible();
  await expect(page.locator('#areas')).toContainText('Vinculamos a familias con especialistas en las principales disciplinas. Pasa el cursor sobre cada área.');
});

test('Navegacion a Testimonio Landing Page', async ({ page }) => {
    qase.id(215);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Testimonios' }).click();
  await expect(page.getByRole('heading', { name: 'Lo que dicen las familias' })).toBeVisible();
  await expect(page.locator('#testimonios')).toContainText('Más de 1,167 familias han encontrado orientación, acompañamiento y esperanza en la asociación.');
  await expect(page.getByRole('button', { name: 'Siguiente testimonio' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Testimonio anterior' })).toBeVisible();
});

test('Navegacion a Pre-registro Landing Page', async ({ page }) => {
    qase.id(216);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Pre-registro', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Registra al beneficiario' })).toBeVisible();
  await expect(page.locator('#preregistro')).toContainText('Ingresa los datos del paciente en tres pasos. Una vez registrado en el sistema, el equipo coordinará su primera cita con el especialista correspondiente.');
});

test('Navegacion a Apoyanos Landing Page', async ({ page }) => {
    qase.id(217);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Apóyanos' }).click();
  await expect(page.getByRole('heading', { name: 'Apóyanos' })).toBeVisible();
  await expect(page.locator('#donar')).toContainText('Tu donativo sostiene consultas, medicamentos y seguimiento para familias con espina bífida en Nuevo León.');
  await expect(page.getByText('Transferencia bancariaBancoBanorteCuenta0001617086-5CLABE072 580 00016170865')).toBeVisible();
});

test('Navegacion a Pagina de Login Landing Page', async ({ page }) => {
    qase.id(218);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Acceso' }).click();
  await expect(page.getByText('Sistemaadministrativo')).toBeVisible();
  await expect(page.getByText('Iniciar sesiónIngresa tus credenciales de accesoUsuarioContraseñaMostrar')).toBeVisible();
});