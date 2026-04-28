import { test, expect } from '@playwright/test';

test('HU-002-1 - Inicio de sesión exitoso', async ({ page }) => {
    // 1. Ingresar a la login
    await page.goto('http://localhost:5173/login');

    // 2. Ingresar nombre de usuario prueba1
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');

    // 3. Ingresar contraseña admin1
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');

    // 4. Clic en "Iniciar sesión"
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

});

test('HU-002-2 - Inicio de sesión fallido por credenciales incorrectas', async ({ page }) => {
    // 1. Ingresar a la login
    await page.goto('http://localhost:5173/login');

    // 2. Ingresar un usuario no registrado
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin2');
    // 3. Ingresar una contraseña incorrecta
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('prueba2');

    // 4. Clic en "Iniciar sesión"
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // 5. Verificar que se muestre un mensaje de error
    await page.getByText('Usuario o contraseña incorrectos.')
});