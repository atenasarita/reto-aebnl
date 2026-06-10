import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('admin1');
  await page.getByRole('button', { name: 'Entrar al sistema' }).click();
  await page.getByRole('button', { name: 'Inventario' }).click();
});

// HU - 015 - Movimiento de Inventario 
test('HU - 15 Registro Inventario Movimiento Entrada', async ({ page }) => {
  qase.id(228);
  await page.getByPlaceholder('Buscar por nombre o clave').fill('cur-004');

  const filaGasasPrueba = page.getByRole('row', { name: /Gasas Prueba.*cur-004/i });
  await expect(filaGasasPrueba).toBeVisible();

  const textoAntes = await filaGasasPrueba.textContent();
  const matchAntes = textoAntes?.match(/cur-004\s*(\d+)\s*caja/i);
  const cantidadAntes = Number(matchAntes?.[1]);

  await page.getByRole('button', { name: 'Registrar Movimiento' }).click();

  const modalMovimiento = page.locator('form').filter({ hasText: 'Registrar movimiento' });

  const producto = modalMovimiento.getByLabel('Producto');
  const valueProducto = await producto
    .locator('option')
    .filter({ hasText: /cur-004.*Gasas Prueba/i })
    .getAttribute('value');

  await producto.selectOption(valueProducto);

  await modalMovimiento.getByLabel('Tipo de movimiento').selectOption({ label: 'Entrada' });

  await modalMovimiento.getByRole('textbox', { name: 'Motivo, máximo 20 caracteres' }).click();
  await modalMovimiento.getByRole('textbox', { name: 'Motivo, máximo 20 caracteres' }).fill('Compra');

  await expect(modalMovimiento.getByRole('spinbutton', { name: 'Cantidad' })).toBeVisible();
  await modalMovimiento.getByRole('spinbutton', { name: 'Cantidad' }).fill('1');

  await modalMovimiento.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-09T09:00');

  await modalMovimiento.getByRole('button', { name: 'Registrar movimiento', exact: true }).click();

  const cantidadEsperada = cantidadAntes + 1;

  await expect(modalMovimiento).toBeHidden();

  await page.getByPlaceholder('Buscar por nombre o clave').fill('cur-004');

  const filaGasasPruebaDespues = page.getByRole('row', { name: /Gasas Prueba.*cur-004/i });
  await expect(filaGasasPruebaDespues).toContainText(`${cantidadEsperada} caja`);

  const textoDespues = await filaGasasPruebaDespues.textContent();
  const matchDespues = textoDespues?.match(/cur-004\s*(\d+)\s*caja/i);
  const cantidadDespues = Number(matchDespues?.[1]);

  expect(cantidadDespues).toBe(cantidadEsperada);
});



test('HU - 15 Registro Inventario Movimiento Salida', async ({ page }) => {
    qase.id(229);

  await page.getByPlaceholder('Buscar por nombre o clave').fill('cur-002');

  const filaVendaje = page.getByRole('row', { name: /vendaje.*cur-002/i });
  await expect(filaVendaje).toBeVisible();

  const textoAntes = await filaVendaje.textContent();
  const matchAntes = textoAntes?.match(/cur-002\s*(\d+)\s*caja/i);
  const cantidadAntes = Number(matchAntes?.[1]);

  await page.getByRole('button', { name: 'Registrar Movimiento' }).click();

  const modalMovimiento = page.locator('form').filter({ hasText: 'Registrar movimiento' });
  const producto = modalMovimiento.getByLabel('Producto');

  const valueProducto = await producto
    .locator('option')
    .filter({ hasText: /cur-002.*vendaje/i })
    .getAttribute('value');

  await producto.selectOption(valueProducto);

  await modalMovimiento.getByLabel('Tipo de movimiento').selectOption({ label: 'Salida' });

  await page.getByRole('textbox', { name: 'Motivo, máximo 20 caracteres' }).click();
  await page.getByRole('textbox', { name: 'Motivo, máximo 20 caracteres' }).fill('Compra');

  await expect(page.getByRole('spinbutton', { name: 'Cantidad' })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Cantidad' }).fill('1');

  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-09T09:00');

  await page.getByRole('button', { name: 'Registrar movimiento', exact: true }).click();

  const cantidadEsperada = cantidadAntes - 1;

  await page.getByPlaceholder('Buscar por nombre o clave').fill('cur-002');

  const filaVendajeDespues = page.getByRole('row', { name: /vendaje.*cur-002/i });
  await expect(filaVendajeDespues).toContainText(`${cantidadEsperada} caja`);

  const textoDespues = await filaVendajeDespues.textContent();
  const matchDespues = textoDespues?.match(/cur-002\s*(\d+)\s*caja/i);
  const cantidadDespues = Number(matchDespues?.[1]);

  expect(cantidadDespues).toBe(cantidadEsperada);
});

test('HU - 15 Salida mayor a Inventario (Stock)', async ({ page }) => {
    qase.id(230);

  await page.getByPlaceholder('Buscar por nombre o clave').fill('cur-001');

  const filaGasas = page.getByRole('row', { name: /Curación gasas cur-001 1 caja/i });

  await expect(filaGasas).toBeVisible();

  await page.getByRole('button', { name: 'Registrar Movimiento' }).click();

  const modalMovimiento = page.locator('form').filter({ hasText: 'Registrar movimiento' });

  const producto = modalMovimiento.getByLabel('Producto');
  const valueProducto = await producto
    .locator('option')
    .filter({ hasText: /cur-001.*gasas/i })
    .getAttribute('value');

  await producto.selectOption(valueProducto);

  await modalMovimiento.getByLabel('Tipo de movimiento').selectOption({ label: 'Salida' });

  await page.getByRole('spinbutton', { name: 'Cantidad' }).click();
  await page.getByRole('spinbutton', { name: 'Cantidad' }).fill('2');

  await page.getByRole('textbox', { name: 'Motivo, máximo 20 caracteres' }).click();
  await page.getByRole('textbox', { name: 'Motivo, máximo 20 caracteres' }).fill('Compra');

  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-01-09T09:00');

  await page.getByRole('button', { name: 'Registrar movimiento', exact: true }).click();

  await expect(page.getByText(/Stock insuficiente/i)).toBeVisible();
});

test('HU - 15 Registro de Movimiento en Reportes (Inventario)', async ({ page }) => {
    qase.id(231);

  await page.getByRole('button', { name: 'Reportes' }).click();
  await page.getByRole('link', { name: 'Inventario' }).click();
  await expect(page.getByLabel('Salida de vendaje, 2026-06-09 22:').getByText('vendaje')).toBeVisible();
  await expect(page.getByLabel('Salida de vendaje, 2026-06-09 22:').getByText('Tipo de movimiento: Salida')).toBeVisible();
  await expect(page.getByLabel('Salida de vendaje, 2026-06-09 22:').getByText('1', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Salida de vendaje, 2026-06-09 22:').getByText('Pprueba1')).toBeVisible();
});

// HU 016 - Administracion de Inventario

test('HU 016 -  Registrar Nuevo Producto', async ({ page }) => {
  qase.id(232);

  const bancoMedicinas = [
    'Diclofenaco',
    'Paracetamol',
    'Ibuprofeno',
    'Naproxeno',
    'Ketorolaco',
    'Loratadina',
    'Omeprazol',
    'Amoxicilina',
    'Metformina',
    'Salbutamol'
  ];

  const medicinaAleatoria = bancoMedicinas[Math.floor(Math.random() * bancoMedicinas.length)];
  const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
  const nombreMedicina = `${medicinaAleatoria} ${numeroAleatorio}`;

  await page.getByRole('button', { name: 'Nuevo Producto' }).click();

  await page.getByRole('textbox', { name: 'Nombre', exact: true }).click();
  await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill(nombreMedicina);

  await page.getByLabel('CategoríaSeleccionar…').selectOption('2');

  await page.getByRole('textbox', { name: 'Unidad de medida' }).click();
  await page.getByRole('textbox', { name: 'Unidad de medida' }).fill('caja');

  await page.getByRole('spinbutton', { name: 'Precio' }).click();
  await page.getByRole('spinbutton', { name: 'Precio' }).fill('200');

  await page.getByRole('spinbutton', { name: 'Cantidad inicial' }).click();
  await page.getByRole('spinbutton', { name: 'Cantidad inicial' }).fill('20');

  await page.getByRole('button', { name: 'Guardar producto' }).click();

  await page.waitForTimeout(1000);

  await page.getByPlaceholder('Buscar por nombre o clave').fill(nombreMedicina);

  const filaProducto = page.getByRole('row', { name: new RegExp(nombreMedicina, 'i') });

  await expect(filaProducto).toBeVisible();
  await expect(filaProducto).toContainText('Medicina');
  await expect(filaProducto).toContainText('20 caja');
  await expect(filaProducto).toContainText('$200.00');
});




test('HU 016 -  Formato correcto de tabla de Inventario', async ({ page }) => {
    qase.id(233);

  await expect(page.getByRole('columnheader', { name: 'CATEGORIA' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'NOMBRE' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'CLAVE' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'CANTIDAD' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'PRECIO' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'ACCIONES' })).toBeVisible();
  await page.getByPlaceholder('Buscar por nombre o clave').fill('cur-001');
  await expect(page.getByRole('row', { name: 'Curación gasas cur-001 1 caja' })).toBeVisible();
});


test('HU 016 - Eliminar producto de inventario', async ({ page }) => {
    qase.id(234);

  // Crear producto a eliminar
const bancoMedicinas = [
    'Diclofenaco',
    'Paracetamol',
    'Ibuprofeno',
    'Naproxeno',
    'Ketorolaco',
    'Loratadina',
    'Omeprazol',
    'Amoxicilina',
    'Metformina',
    'Salbutamol'
  ];

  const medicinaAleatoria = bancoMedicinas[Math.floor(Math.random() * bancoMedicinas.length)];
  const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
  const nombreMedicina = `${medicinaAleatoria} ${numeroAleatorio}`;

  await page.getByRole('button', { name: 'Nuevo Producto' }).click();

  await page.getByRole('textbox', { name: 'Nombre', exact: true }).click();
  await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill(nombreMedicina);

  await page.getByLabel('CategoríaSeleccionar…').selectOption('2');

  await page.getByRole('textbox', { name: 'Unidad de medida' }).click();
  await page.getByRole('textbox', { name: 'Unidad de medida' }).fill('caja');

  await page.getByRole('spinbutton', { name: 'Precio' }).click();
  await page.getByRole('spinbutton', { name: 'Precio' }).fill('200');

  await page.getByRole('spinbutton', { name: 'Cantidad inicial' }).click();
  await page.getByRole('spinbutton', { name: 'Cantidad inicial' }).fill('20');

  await page.getByRole('button', { name: 'Guardar producto' }).click();

  await page.waitForTimeout(1000);

  await page.getByPlaceholder('Buscar por nombre o clave').fill(nombreMedicina);

  const filaProducto = page.getByRole('row', { name: new RegExp(nombreMedicina, 'i') });
  await expect(filaProducto).toBeVisible();

  // Eliminar producto creado

  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain(`¿Eliminar «${nombreMedicina}» del inventario?`);
    expect(dialog.message()).toContain('El producto se desactivará y dejará de aparecer en el listado.');
    await dialog.accept();
  });

  await filaProducto.getByLabel('Eliminar producto').click();

  await expect(filaProducto).not.toBeVisible();
});