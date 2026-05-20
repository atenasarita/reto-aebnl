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


test('HU - 019 - Visualizar accesos directos en el menú de inicio', async ({ page }) => {
  qase.id(61);

  await test.step('Given que el usuario se encuentra en la pestaña de tablero', async () => {
    await page.getByRole('button', { name: 'Inicio' }).click();
  });

  await test.step('Then el sistema debe mostrar los accesos directos disponibles', async () => {
    await expect(page.locator('#root')).toContainText('Registrar Servicio');
    await expect(page.locator('#root')).toContainText('Nuevo Beneficiario');
    await expect(page.locator('#root')).toContainText('Agendar Cita');
    await expect(page.locator('#root')).toContainText('Recibos');
  });

  await test.step('And los accesos deben incluir registrar beneficiario, registrar servicios, agendar citas y registrar recibo según el rol del usuario', async () => {
    await expect(page.locator('#root')).toContainText('Nuevo Beneficiario');
    await expect(page.locator('#root')).toContainText('Registrar Servicio');
    await expect(page.locator('#root')).toContainText('Agendar Cita');
    await expect(page.locator('#root')).toContainText('Recibos');
  });
});



test('HU - 019 - Redirigir al modulo de registro de servicios', async ({ page }) => {
  qase.id(118);

  await test.step('Given el usuario esta en el Menu de Inicio', async () => {
    await expect(page.getByRole('button', { name: 'Registrar Servicio Documentar' })).toBeVisible();
  });

  await test.step('And el usuario puede visualizar el acceso rápido de registro de servicios', async () => {
    await expect(page.getByRole('button', { name: 'Registrar Servicio Documentar' })).toBeVisible();
  });

  await test.step('Then el usuario puede dar clic al botón registrar servicio', async () => {
    await page.getByRole('button', { name: 'Registrar Servicio Documentar' }).click();
  });

  await test.step('And el sistema redirige a la pestaña de servicios', async () => {
    await expect(page.getByRole('heading', { name: 'Registrar Nuevo Servicio' })).toBeVisible();
  });
});

test('HU - 008 - Registrar servicio con beneficiario por folio', async ({ page }) => {
  qase.id(92);

  await test.step('Given que el usuario inició sesión en el sistema', async () => {
    await expect(page.getByRole('button', { name: 'Registrar Servicio Documentar' })).toBeVisible();
  });

  await test.step('And se encuentra en el módulo de servicios', async () => {
    await page.getByRole('button', { name: 'Registrar Servicio Documentar' }).click();
    await expect(page.getByRole('heading', { name: 'Registrar Nuevo Servicio' })).toBeVisible();
  });

  await test.step('When selecciona registrar un nuevo servicio', async () => {
    await expect(page.getByRole('textbox', { name: 'Nombre, folio o CURP...' })).toBeVisible();
  });

  await test.step('And elige un beneficiario mediante su folio', async () => {
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).fill('9002');
  });

  await test.step('Then el sistema debe asociar el servicio al beneficiario correspondiente', async () => {
    await expect(page.getByText('Sofia RamirezASEB-26-9002 ·')).toBeVisible();
  });
});

test('HU - 008 - Registrar servicio con beneficiario por nombre', async ({ page }) => {
  qase.id(93);

  await test.step('Given que el usuario inició sesión en el sistema', async () => {
    await expect(page.getByRole('button', { name: 'Registrar Servicio Documentar' })).toBeVisible();
  });

  await test.step('And se encuentra en el módulo de servicios', async () => {
    await page.getByRole('button', { name: 'Registrar Servicio Documentar' }).click();
    await expect(page.getByRole('heading', { name: 'Registrar Nuevo Servicio' })).toBeVisible();
  });

  await test.step('When selecciona registrar un nuevo servicio', async () => {
    await expect(page.getByRole('textbox', { name: 'Nombre, folio o CURP...' })).toBeVisible();
  });

  await test.step('And busca al beneficiario mediante su nombre', async () => {
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).fill('Sofia');
  });

  await test.step('Then el sistema debe permitir seleccionar al beneficiario correspondiente', async () => {
    await expect(page.getByText(/Sofia Ramirez.*ASEB-26-9002/)).toBeVisible();
  });
});


test('HU - 008 - Registrar servicio con consumo de materiales', async ({ page }) => {
  qase.id(95);
  await test.step('Given que el usuario esta registrado un servicio', async() => {
      await page.getByRole('button', { name: 'Registrar Servicio Documentar' }).click();
      await page.getByRole('button', { name: 'Citas del día' }).click();
      await page.getByRole('button', { name: 'Por beneficiario' }).click();
      await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).click();
      await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).fill('Sofia');
      await page.locator('div').filter({ hasText: /^Sofia RamirezASEB-26-9002 · RASO120202MNLBBB02$/ }).nth(1).click();
      await page.getByRole('button', { name: 'Continuar' }).click();
  });

  await test.step('When guarda servicio', async() => {
    await page.getByRole('textbox', { name: 'Hora de cita' }).click();
    await page.getByRole('textbox', { name: 'Hora de cita' }).fill('21:07');
    await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-18');
    await page.getByRole('combobox').first().selectOption('Procedimiento');
    await page.getByRole('combobox').nth(1).selectOption('24');
    await page.getByRole('button', { name: 'Continuar' }).click();
  });

  await test.step('Then el sistema debe registrar el servicio correctamente', async() => {
    await page.getByRole('combobox').selectOption('21');
    await page.getByRole('button', { name: 'Agregar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();   
  });
});

test('HU - 008 - Guardar servicio con datos obligatorios', async ({ page }) => {
  qase.id(94);

  await test.step('Given que el usuario esta registrado un servicio', async() => {
    await page.getByRole('button', { name: 'Registrar Servicio Documentar' }).click();
    await page.getByRole('button', { name: 'Citas del día' }).click();
    await page.getByRole('button', { name: 'Por beneficiario' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).fill('Sofia');
      
  });
  await test.step('capturó el beneficiario, tipo de servicio, fecha y monto', async() => {
    await page.locator('div').filter({ hasText: /^Sofia RamirezASEB-26-9002 · RASO120202MNLBBB02$/ }).nth(1).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  });
  await test.step('When guarda la información del servicio', async() => {
    await page.getByRole('textbox', { name: 'Hora de cita' }).click();
    await page.getByRole('textbox', { name: 'Hora de cita' }).fill('21:07');
    await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-18');
    await page.getByRole('combobox').first().selectOption('Procedimiento');
    await page.getByRole('combobox').nth(1).selectOption('24');
    await page.getByRole('button', { name: 'Continuar' }).click();
  });
  await test.step('Then el sistema debe registrar el servicio correctamente', async() => {
    await page.getByRole('combobox').selectOption('21');
    await page.getByRole('button', { name: 'Agregar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();  
  });
});

test('HU - 008 - Generar registro de pago correspondiente', async ({ page }) => {
  qase.id(96);
  await test.step('Given que el usuario registró un servicio correctamente', async() => {
      await page.getByRole('button', { name: 'Registrar Servicio Documentar' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).fill('sofia');
    await page.locator('div').filter({ hasText: /^Sofia RamirezASEB-26-9002 · RASO120202MNLBBB02$/ }).nth(1).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  });

  await test.step('When confirma el registro del servicio', async() => {
    await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-21');
    await page.getByRole('textbox', { name: 'Hora de cita' }).click();
    await page.getByRole('textbox', { name: 'Hora de cita' }).fill('21:05');
    await page.getByRole('combobox').first().selectOption('Consultas');
    await page.getByRole('combobox').nth(1).selectOption('146');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('combobox').selectOption('2');
    await page.getByRole('button', { name: 'Agregar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  });
  await test.step('Then el sistema debe generar el registro de pago correspondiente', async() => {
    await expect(page.getByText('Resumen del RegistroESTADO')).toBeVisible();
  });
});


test('HU - 008 - Generar recibo al finalizar el proceso', async ({ page }) => {
  qase.id(97);
  await test.step('Given que el usuario registró un servicio correctamente', async() => {
    await page.getByRole('button', { name: 'Servicios' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Nombre, folio o CURP...' }).fill('so');
    await page.getByText('Sofia RamirezASEB-26-9002 ·').click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-18');
    await page.getByRole('textbox', { name: 'Hora de cita' }).click();
    await page.getByRole('textbox', { name: 'Hora de cita' }).click();
    await page.getByRole('textbox', { name: 'Hora de cita' }).click();
    await page.getByRole('textbox', { name: 'Hora de cita' }).fill('21:04');
    await page.getByRole('combobox').first().selectOption('Consultas');
    await page.getByRole('combobox').nth(1).selectOption('146');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('combobox').selectOption('46');
    await page.getByRole('button', { name: 'Agregar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('textbox', { name: '0.00' }).first().click();
    await page.getByRole('textbox', { name: '0.00' }).first().fill('0');
    await page.getByRole('combobox').selectOption('efectivo');
    await page.getByRole('textbox', { name: '0.00' }).nth(1).click();
    await page.getByRole('textbox', { name: '0.00' }).nth(1).fill('100');
    await page.getByRole('button', { name: 'Guardar' }).click(); 
  });
  await test.step('And finalizó el proceso de registro', async() => {
    await expect(page.getByRole('heading', { name: 'Servicio registrado' })).toBeVisible();

  });
  await test.step('When solicita generar el recibo', async() => {
    await page.getByRole('button', { name: 'Recibos' }).click();

  });
  await test.step('Then el sistema debe permitir generar el recibo del servicio', async() => {
    await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-18');
    await expect(page.getByRole('cell', { name: 'Sofia Ramirez' }).first()).toBeVisible(); 
  });
});