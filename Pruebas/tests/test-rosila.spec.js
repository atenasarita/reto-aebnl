import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Alta de beneficiarios', async({page}) => {
    qase.id(2);

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
        await page.locator('input[name="telefono"]').fill('1232433546');
    });

    await test.step(`Capturar nombres`, async () => {
        await page.locator('input[name="nombres"]').click();
        await page.locator('input[name="nombres"]').fill('Javiers');
    });

    await test.step(`Capturar apellido paterno`, async () => {
        await page.locator('input[name="apellido_paterno"]').click();
        await page.locator('input[name="apellido_paterno"]').fill('Plutarcs');
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
        await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).fill('PELJ000101HNLXXYTF');
        
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
    await test.step(`Validar mensaje de éxito`, async () => {
        await expect(page.locator('#root')).toContainText('El beneficiario fue registrado correctamente en el sistema.');
        await expect(page.getByText('Registro exitosoEl')).toBeVisible();
    });
});