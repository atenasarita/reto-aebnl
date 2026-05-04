const { test, expect } = require('@playwright/test');
import { qase } from 'playwright-qase-reporter';
const path = require('path');
const dotenv = require(path.resolve(__dirname, '../../server/node_modules/dotenv'));
const oracledb = require(path.resolve(__dirname, '../../server/node_modules/oracledb'));

        // Cargar variables de entorno del servidor
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

// Función local para manipular la BD
async function modificarFechaBD(action, idBeneficiario) {
    const walletPath = path.resolve(__dirname, '../../server', process.env.ORACLE_WALLET_PATH || 'Wallet_clasedb');
    process.env.TNS_ADMIN = process.env.ORACLE_TNS_ADMIN || walletPath;

    let conn;
    try {
        conn = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECT_STRING,
            configDir: walletPath,
            walletLocation: walletPath,
            walletPassword: process.env.ORACLE_WALLET_PASSWORD,
        });

        if (action === 'vencer') {
            await conn.execute(`
                BEGIN
                    UPDATE MEMBRESIAS SET FECHA_FIN = (SYSDATE - 1), ESTADO = 'activa' WHERE ID_BENEFICIARIO = :id;
                    UPDATE BENEFICIARIO SET ESTADO = 'activo' WHERE ID_BENEFICIARIO = :id;
                END;
            `, [idBeneficiario], { autoCommit: true });
        } else if (action === 'restaurar') {
            await conn.execute(`
                BEGIN
                    UPDATE MEMBRESIAS SET FECHA_FIN = TO_DATE('01/05/2026', 'DD/MM/YYYY'), ESTADO = 'activa' WHERE ID_BENEFICIARIO = :id;
                    UPDATE BENEFICIARIO SET ESTADO = 'activo' WHERE ID_BENEFICIARIO = :id;
                END;
            `, [idBeneficiario], { autoCommit: true });
        }
    } finally {
        if (conn) await conn.close();
    }
}

test.skip(({ browserName }) => browserName === 'firefox', 'No correr en firefox debido a conflicto local');

test.describe('Automatización de cambio de membresía', () => {
    test.beforeAll(async () => {
        // Asegurarnos de que el beneficiario 60 inicie como activo y con fecha adelantada
        await modificarFechaBD('restaurar', 60);
    });    
    test(qase(13, 'HU-013 - 1 - Cambio automático de actividad de membresía a inactivo'), async ({ page }) => {
        await test.step('Paso 1: Ir a módulo Beneficiarios', async () => {
            // Iniciar sesión y navegar a beneficiarios
            await page.goto('http://localhost:5173/login');
            await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
            await page.getByRole('textbox', { name: '********' }).fill('admin1');
            await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
            await page.waitForURL('**/beneficiarios');
        });

        const targetBeneficiario = 'Maria Gonzalez';
        
        await test.step('Paso 2: Localizar beneficiario con membresía vencida', async () => {
            await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(targetBeneficiario);
            await page.waitForTimeout(2000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            await expect(card).toBeVisible();
            await expect(card).toContainText(/Activo/i);
            
            // Simular el tiempo que pasa para que la fecha venza (por db)
            console.log('Forzando caducidad en BD...');
            await modificarFechaBD('vencer', 60); 
        });

        await test.step('Paso 3: Esperar actualización automática del sistema', async () => {
            console.log('Corriendo cronjob...');
            // Invocamos el cronjob que actualiza masivamente
            require('child_process').execSync('npx tsx src/jobs/membresiaExpiration.job.ts', { cwd: '../server' });
            // Recargamos la interfaz para ver el cambio reflejado (o esperar a que haya poll)
            await page.reload();
            await page.waitForURL('**/beneficiarios');
        });

        await test.step('Paso 4: Validar estado en tarjeta del beneficiario', async () => {
            await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(targetBeneficiario);
            await page.waitForTimeout(2000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            await expect(card).toBeVisible();
            await expect(card).toContainText(/Inactivo/i);
        });

        await test.step('Paso 5: Aplicar filtro "Inactivo"', async () => {
            await page.locator('select.dropdown-select').selectOption('inactivo');
            await page.waitForTimeout(1000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            await expect(card).toBeVisible();
        });

        await test.step('Paso 6: Validar que beneficiario "Inactivo" no aparece en "Activos"', async () => {
            await page.locator('select.dropdown-select').selectOption('activo');
            await page.waitForTimeout(1000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            await expect(card).not.toBeVisible();
        });
    });

    test(qase(14, 'HU-013 - 2 - Cambio automático de actividad de membresía a inactivo'), async ({ page }) => {
        
        // Se restaura el inicio para asegurar que la fecha vigente sea mayor a HOY
        await modificarFechaBD('restaurar', 60);

        await test.step('Paso 1: Ir a módulo Beneficiarios', async () => {
            await page.goto('http://localhost:5173/login');
            await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
            await page.getByRole('textbox', { name: '********' }).fill('admin1');
            await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
            await page.waitForURL('**/beneficiarios');
        });

        const targetBeneficiario = 'Sofia Ramirez';
        
        await test.step('Paso 2: Localizar beneficiario con membresía no vencida', async () => {
            await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(targetBeneficiario);
            await page.waitForTimeout(2000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            await expect(card).toBeVisible();
            await expect(card).toContainText(/Activo/i);
            
            // En este caso NO modificamos la fecha para forzar la caducidad
        });

        await test.step('Paso 3: Esperar actualización automática del sistema', async () => {
            console.log('Corriendo cronjob...');
            require('child_process').execSync('npx tsx src/jobs/membresiaExpiration.job.ts', { cwd: '../server' });
            await page.reload();
            await page.waitForURL('**/beneficiarios');
        });

        await test.step('Paso 4: Validar estado en tarjeta del beneficiario', async () => {
            await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(targetBeneficiario);
            await page.waitForTimeout(2000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            await expect(card).toBeVisible();
            await expect(card).not.toContainText(/Inactivo/i);
            await expect(card).toContainText(/Activo/i);
        });

        await test.step('Paso 5: Aplicar filtro "Inactivo"', async () => {
            await page.locator('select.dropdown-select').selectOption('inactivo');
            await page.waitForTimeout(1000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            // Como su estado no cambia, NO debe aparecer aquí
            await expect(card).not.toBeVisible();
        });

        await test.step('Paso 6: Validar que beneficiario "Activo" aparece en "Activos"', async () => {
            await page.locator('select.dropdown-select').selectOption('activo');
            await page.waitForTimeout(1000);
            const card = page.locator('div[class*="card"]', { hasText: targetBeneficiario });
            // Debe aparecer aquí pues sigue siendo activo
            await expect(card).toBeVisible();
        });
    });

    test.afterAll(async () => {
        // Restaurar estado inicial en BD
        await modificarFechaBD('restaurar', 60);
    });
});