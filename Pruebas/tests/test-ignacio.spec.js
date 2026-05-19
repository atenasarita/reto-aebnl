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

test(qase(13, 'HU - 013 - Cambio automático de actividad de membresía a inactivo #HU013-1'), async ({ page }) => {  
    
    // Iniciar Sesión
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL('**/beneficiarios');

    // Buscar el beneficiario
    const beneficiarioAVencer= 'Maria Gonzalez'; 
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioAVencer);
    await page.waitForTimeout(2000); 
    const tarjeta = page.locator('div[class*="card"]', { hasText: beneficiarioAVencer });

    // Verificar si tiene el estatus de Activo
    await expect(tarjeta).toContainText(/Activo/i, { timeout: 15000 });

    // Invocar Cron
    console.log('Forzando caducidad en BD y corriendo cronjob...');
    
    // Modificar BD 
    await modificarFechaBD('vencer', 60); 
    require('child_process').execSync('npx tsx src/jobs/membresiaExpiration.job.ts', { cwd: '../server' });

    await page.reload();

    // Aplicar filtro de Inactivo
    await page.locator('select.dropdown-select').selectOption('inactivo');

    // Verificar que aparece el beneficiario
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioAVencer);
    await page.waitForTimeout(1000);
    await expect(tarjeta).toBeVisible();

    // Aplicar filtro de Activo
    await page.locator('select.dropdown-select').selectOption('activo');

    // Verificar que no está activo
    await expect(page.locator('div[class*="card"]', { hasText: beneficiarioAVencer })).not.toBeVisible();

    // Restaurar estado inicial en DB
    console.log('Restaurando BD a su estado original...');
    await modificarFechaBD('restaurar', 60);
});

test(qase(14, 'HU - 013 - Cambio automático de actividad de membresía a inactivo #HU013-2'), async ({ page }) => {  
    
    // Iniciar Sesión
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.waitForURL('**/beneficiarios');

    // Buscar el beneficiario que no se va a vencer
    const beneficiarioActivo = 'Sofia Ramirez'; 
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioActivo);
    await page.waitForTimeout(2000);
    const tarjeta = page.locator('div[class*="card"]', { hasText: beneficiarioActivo });

    // Verificar si tiene el estatus de Activo al inicio
    await expect(tarjeta).toContainText(/Activo/i, { timeout: 15000 });

    // Adelantar la fecha del sistema
    console.log('Adelantando fecha del sistema...');
    await page.clock.setFixedTime(new Date('2026-05-01T03:00:00Z')); 
    await page.reload();

    // Aplicar filtro de Activo
    await page.locator('select.dropdown-select').selectOption('activo');

    // Verificar que el beneficiario aparece
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, folio o CURP...' }).fill(beneficiarioActivo);
    await page.waitForTimeout(1000);
    await expect(tarjeta).toBeVisible();

    // Aplicar filtro de Inactivo
    await page.locator('select.dropdown-select').selectOption('inactivo');

    // Verificar que el beneficiario no aparece
    await expect(page.locator('div[class*="card"]', { hasText: beneficiarioActivo })).not.toBeVisible();
});