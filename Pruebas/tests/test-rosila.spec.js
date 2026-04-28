import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

// Prueba positiva
test('Alta de beneficiarios', async({page}) => {
    qase.id(30);

    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await test.step(`Ir a la página de registro de beneficiario`, async () => {
        await page.getByRole('button', { name: 'Nuevo Beneficiario' }).click();
    });

    await test.step(`Verificar folio y fecha de registro`, async () => {
        await expect(page.locator('div').filter({ hasText: /^FOLIO DE BENEFICIARIO$/ })).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /^FECHA DE REGISTRO$/ })).toBeVisible();
    });

    await test.step(`Capturar correo electronico`, async () => {
        await page.locator('input[name="email"]').click();
        await page.locator('input[name="email"]').fill('prueba@test.com');
        
    });

    await test.step(`Capturar telefono`, async () => {
        await page.locator('input[name="telefono"]').click();
        await page.locator('input[name="telefono"]').fill('1232433545');
    });

    await test.step(`Capturar nombres`, async () => {
        await page.locator('input[name="nombres"]').click();
        await page.locator('input[name="nombres"]').fill('Ramirovs');
    });

    await test.step(`Capturar apellido paterno`, async () => {
        await page.locator('input[name="apellido_paterno"]').click();
        await page.locator('input[name="apellido_paterno"]').fill('Juarez');
    });
    
    await test.step(`Capturar apellido materno`, async () => {
        await page.locator('input[name="apellido_materno"]').click();
        await page.locator('input[name="apellido_materno"]').fill('Lima');
    });

    await test.step(`Capturar fecha de nacimiento`, async () => {
        await page.locator('input[name="fecha_nacimiento"]').fill('2000-01-01');
    });

    await test.step(`Capturar CURP`, async () => {
        await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).click();
        await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).fill('JULI000101HNLXXYTK');
        
    });

    await test.step(`Seleccionar género`, async () => {
        await page.locator('select[name="genero"]').selectOption('masculino');
    });

    await test.step(`Seleccionar lugar de nacimiento`, async () => {
        await page.getByText('Lugar de Nacimiento').click();
        await page.locator('select[name="estado_nacimiento"]').selectOption('Nuevo Leon');
    });

    await test.step(`Dar clic en Continuar`, async () => {
        await page.getByRole('button', { name: 'Continuar' }).click();
    });

    await test.step(`Capturar nombre de tutor`, async () => {
        await page.locator('input[name="contacto_nombre"]').click();
        await page.locator('input[name="contacto_nombre"]').fill('Maria Limas');
    });

    await test.step(`Capturar teléfono de tutor`, async () => {
        await page.locator('input[name="contacto_telefono"]').click();
        await page.locator('input[name="contacto_telefono"]').fill('8123456789');
    });

    await test.step(`Capturar Parentesco`, async () => {
        await page.locator('input[name="contacto_parentesco"]').click();
        await page.locator('input[name="contacto_parentesco"]').fill('Madre');
    });

    await test.step(`Seleccionar tipo sanguineo`, async () => {
        await page.locator('select[name="tipo_sanguineo"]').selectOption('O+');
    });

    await test.step(`Seleccionar tipo de espina bifida`, async () => {
        await page.getByText('Meningocele', { exact: true }).click();
    });

    await test.step(`Capturar valvula`, async () => {
        await page.locator('select[name="valvula"]').selectOption('true');
    });

    await test.step(`Capturar hospital`, async () => {
        await page.locator('input[name="hospital"]').click();
        await page.locator('input[name="hospital"]').fill('Angeles');
    });

    await test.step(`Dar clic en Continuar`, async () => {
        await page.getByRole('button', { name: 'Continuar' }).click();
    });

    await test.step(`Capturar calle`, async () => {
        await page.locator('input[name="domicilio_calle"]').click();
        await page.locator('input[name="domicilio_calle"]').fill('Siempre Viva');
    });

    await test.step(`Seleccionar estado`, async () => {
        await page.getByRole('combobox').selectOption('Nuevo Leon');
    });

    await test.step(`Capturar ciudad`, async () => {
        await page.locator('div').filter({ hasText: /^Ciudad$/ }).click();
        await page.locator('input[name="domicilio_ciudad"]').click();
        await page.locator('input[name="domicilio_ciudad"]').fill('Monterrey');
    });

    await test.step(`Capturar codigo postal`, async () => {
        await page.locator('input[name="domicilio_cp"]').click();
        await page.locator('input[name="domicilio_cp"]').fill('64000'); 
    });

    await test.step(`Dar clic en continuar`, async () => {
        await page.getByRole('button', { name: 'Continuar' }).click();
    });

    await test.step(`Verificar meses de vigencia`, async () => {
        await expect(page.locator('input[name="fecha_inicio_membresia"]')).toBeVisible();
    });

    await test.step(`Verficar fechas de membresia`, async () => {
        await expect(page.locator('#root')).toContainText('Fecha de inicio de membresía');
        await expect(page.locator('#root')).toContainText('Fecha de vigencia');
    });
    await test.step(`Dar clic en Registrar`, async () => {
        await page.getByRole('button', { name: 'Registrar' }).click();
    });
});


// Prueba negativa
test('Alta de beneficiarios Negativa', async({page}) => {
    qase.id(2);
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.locator('div:nth-child(4) > .input-box').click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.getByRole('button', { name: 'Nuevo Beneficiario' }).click();
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').fill('prueba@test.com');
    await page.locator('input[name="telefono"]').click();
    await page.locator('input[name="telefono"]').fill('1233405496');
    await page.locator('input[name="nombres"]').click();
    await page.locator('input[name="nombres"]').fill('Javier');
    await page.locator('input[name="apellido_paterno"]').click();
    await page.locator('input[name="apellido_paterno"]').fill('Plutarc');
    await page.locator('input[name="apellido_paterno"]').click();
    await page.locator('input[name="apellido_materno"]').click();
    await page.locator('input[name="apellido_materno"]').fill('Limas');
    await page.locator('input[name="fecha_nacimiento"]').fill('2026-04-28');
    await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).click();
    await page.locator('section').filter({ hasText: 'Datos PersonalesInformación M' }).locator('section').click();
    await page.getByText('GéneroSeleccionar género...').click();
    await page.locator('select[name="genero"]').selectOption('masculino');
    await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).dblclick();
    await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).fill('JULI000101HNLXXYTK');
    await page.locator('select[name="estado_nacimiento"]').selectOption('Nuevo Leon');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.locator('input[name="contacto_nombre"]').click();
    await page.locator('input[name="contacto_nombre"]').fill('fmfmdrfgmfdm');
    await page.locator('input[name="contacto_telefono"]').click();
    await page.locator('input[name="contacto_telefono"]').fill('3049545034');
    await page.locator('input[name="contacto_parentesco"]').click();
    await page.locator('input[name="contacto_parentesco"]').fill('mdfdfmmdfm');
    await page.locator('select[name="tipo_sanguineo"]').selectOption('B-');
    await page.locator('label').filter({ hasText: 'Espina Bífida Oculta' }).click();
    await page.getByText('Lipocele').click();
    await page.locator('input[name="padre_nombre"]').click();
    await page.locator('input[name="padre_nombre"]').fill('dmfmgfm');
    await page.locator('input[name="padre_email"]').click();
    await page.locator('input[name="contacto_nombre"]').dblclick();
    await page.locator('input[name="contacto_nombre"]').dblclick();
    await page.locator('input[name="contacto_nombre"]').fill('Maria');
    await page.locator('input[name="contacto_parentesco"]').click();
    await page.locator('input[name="contacto_parentesco"]').fill('mdfdfmmdfmMa');
    await page.locator('input[name="contacto_parentesco"]').dblclick();
    await page.locator('input[name="contacto_parentesco"]').fill('Madre');
    await page.locator('input[name="hospital"]').click();
    await page.locator('input[name="hospital"]').fill('Angeles');
    await page.locator('input[name="padre_nombre"]').click();
    await page.locator('input[name="padre_nombre"]').fill('');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.locator('input[name="domicilio_calle"]').click();
    await page.locator('input[name="domicilio_calle"]').fill('Siempre Viva');
    await page.getByRole('combobox').selectOption('Michoacan');
    await page.locator('input[name="domicilio_ciudad"]').click();
    await page.locator('input[name="domicilio_ciudad"]').fill('');
    await page.getByRole('combobox').selectOption('Nuevo Leon');
    await page.locator('input[name="domicilio_ciudad"]').click();
    await page.locator('input[name="domicilio_ciudad"]').fill('Monterrey');
    await page.locator('input[name="domicilio_cp"]').click();
    await page.locator('input[name="domicilio_cp"]').fill('64000');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Registrar' }).click();
    await page.getByText('Ya existe un registro con datos unicos de beneficiario.');
});