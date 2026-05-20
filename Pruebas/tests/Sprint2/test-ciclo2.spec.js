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


test('HU - 019 - Redirigir al modulo de registro de recibos por acceso directo', async ({ page }) => {
    qase.id(63);
    await test.step('Given que el usuario tiene una sesión activa And se encuentra en el menú de Inicio', async () => {
        await page.getByRole('button', { name: 'Inicio' }).click();
    });
    await test.step('When hace clic en acceso directo "recibos"', async () => {
        await page.getByRole('button', { name: 'Recibos Control de pagos y' }).click();

    });
    await test.step('El sistema debe rederigirlo al módulo de recibos', async () => {
      await expect(page.getByRole('heading', { name: 'Recibos', exact: true })).toBeVisible();
    });
});

test('HU - 023 - Redirigir al módulo de Recibos con navbar', async ({ page }) => {
    qase.id(91);
    await test.step('When el usuario selecciona acceso al módulo de Recibos', async () => {
        await page.getByRole('button', { name: 'Recibos', exact: true }).click();
    });
    await test.step('Then el sistema debe redirigirlo a la pantalla de Recibos', async () => {
        await expect(page.getByRole('heading', { name: 'Recibos', exact: true })).toBeVisible();
    });
});


test('HU - 023 - Mostrar mensaje sin registros', async ({ page }) => {
    qase.id(85);
    await test.step('Given que no existen servicios registrados en la fecha seleccionada', async () => {
        await page.getByRole('button', { name: 'Recibos', exact: true }).click();
        await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-25');
    });
    await test.step('When el usuario consulta el historial de recibos', async () => {
        await page.getByRole('heading', { name: 'Recibos del día' }).click();

    });
    await test.step('Then el sistema debe indicar que no hay registros', async () => {
        await expect(page.getByText('Sin recibos para esta fecha.')).toBeVisible();
    });
});

test('HU - 023 - Visualización de recibos por fecha seleccionada ', async ({ page }) => {
    qase.id(82);
    await test.step('Given el usuario ingresa a la pestaña de recibos', async () => {
        await page.getByRole('button', { name: 'Recibos', exact: true }).click();
    });
    await test.step('When el usuario selecciona una fecha especifica', async () => {
        await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-15');
    });
    await test.step('Then el sistema muestra los recibos de esa fecha', async () => {
        await expect(page.getByRole('heading', { name: 'Recibos del día' })).toBeVisible();
        await expect(page.getByText('15 may').first()).toBeVisible();
        await expect(page.getByText('Recibos del día1115 may')).toBeVisible();
        await expect(page.getByText('11', { exact: true })).toBeVisible();
    });
});

test('HU - 023 - Actualizar historial al cambiar fecha', async ({ page }) => {
    qase.id(86);
    await page.getByRole('button', { name: 'Recibos', exact: true }).click();
    await page.getByRole('button', { name: 'Hoy' }).click();
    await expect(page.getByText('Mostrando 5 de 5 recibos · 19 may')).toBeVisible();
    await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-15');
    await expect(page.getByText('Mostrando 11 de 11 recibos · 15 may')).toBeVisible();
});

test('HU - 023 - Validar información de cada recibo', async ({ page }) => {
    qase.id(84);
    await test.step('Given que el sistema muestra el historial de recibos', async () => {
        await page.getByRole('button', { name: 'Recibos', exact: true }).click();
        await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-15');
    });
    await test.step('When el usuario visualiza los registros disponibles', async () => {
        await page.getByRole('button', { name: 'Ver detalle del recibo 86' }).click();
    });
    await test.step('Then cada registro debe incluir beneficiario, tipo de servicio, hora y estatus', async () => {
        await expect(page.getByText('Folio #86Sofia RamirezCONSULTA DENTAL · 15 may 2026 00:26✕')).toBeVisible();
        await expect(page.getByText('Artículos de inventarioArtí')).toBeVisible();
        await expect(page.getByText('Resumen financieroMonto')).toBeVisible();
    });
});

test('HU - 023 - Evitar registros de fechas incorrectas ', async ({ page }) => {
    qase.id(90);
    await test.step('Given que existen recibos registrados en diferentes fechas', async () => {
        await page.getByRole('button', { name: 'Recibos Control de pagos y' }).click();
    });
    await test.step('When el usuario selecciona una fecha específica', async () => {
        await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-05-15');

    });
    await test.step('Then el sistema debe mostrar únicamente los recibos de esa fecha', async () => {
        await expect(page.getByText('Mostrando 11 de 11 recibos · 15 may')).toBeVisible();
    });
});


test('HU - 009 - Visualizar reporte mensual de personas atendidas', async ({ page }) => {
    qase.id(98);
    await test.step('Given que el usuario accede al menú de reportes', async () => {
        await page.getByRole('button', { name: 'Reportes' }).click();
        await page.getByRole('link', { name: 'Período' }).click();
    });
    await test.step('When selecciona una opción de fecha mensual', async () => {
        await page.getByText('Servicios otorgados por díaMayo').click();
    });
    await test.step('Then el sistema debe mostrar en pantalla la gráfica de personas atendidas por mes', async () => {
        await page.locator('div').filter({ hasText: 'Nuevos beneficiarios31' }).nth(4).click();
        await page.getByRole('paragraph').filter({ hasText: '31' }).click();
        await page.locator('div').filter({ hasText: 'Total atendidos9' }).nth(4).click();
        await page.getByText('9').nth(1).click();
        await page.getByText('Servicios otorgados por díaMayo').click();
        await page.getByText('Mayo 2026').click();
        // await expect(page.locator('section')).toMatchAriaSnapshot(`- application: /1 2 3 4 5 6 7 8 9 \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ 0 4 8 \\d+ \\d+/`);
    await page.getByRole('article').filter({ hasText: 'Reporte Mensual de' }).click();
    await expect(page.locator('section')).toMatchAriaSnapshot(`
        - heading "Servicios otorgados por día" [level=3]
        - text: /Mayo \\d+/
        `);
    });
});


test('HU - 009 - Visualizar reporte anual de personas atendidas', async ({ page }) => {
    qase.id(99);
    await test.step('Given que el usuario inició sesión en el sistema And accede al menú de reportes', async () => {
        await page.getByRole('button', { name: 'Reportes' }).click();
        await page.getByRole('link', { name: 'Período' }).click();
    });

    await test.step('When selecciona una opción de fecha anual', async () => {
        await page.getByRole('link', { name: 'Anual' }).click();
    });
    await test.step('Then el sistema debe mostrar en pantalla la gráfica de personas atendidas por año', async () => {
        await expect(page.getByRole('heading', { name: 'Reporte Anual de Operaciones' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Servicios otorgados por mes' })).toBeVisible();
        await page.getByRole('button', { name: 'Nuevos beneficiarios' }).click();
        await expect(page.getByRole('heading', { name: 'Nuevos beneficiarios por mes' })).toBeVisible();
        await expect(page.getByText('Total atendidos')).toBeVisible();
        await expect(page.getByText('11').first()).toBeVisible();
    });
});

test('HU - 009 - Visualizar reporte por rango de fechas', async ({ page }) => {
    qase.id(100);
    await test.step('Given que el usuario se encuentra en el menú de reportes', async () => {
        await page.getByRole('button', { name: 'Reportes' }).click();
    });
    await test.step('When selecciona un rango de fechas específico', async () => {
        await page.getByRole('link', { name: 'Personalizado' }).click();
        await page.getByRole('button', { name: 'Generar reporte' }).click();
    });
    await test.step('Then el sistema debe mostrar la información de personas atendidas correspondiente a ese periodo', async () => {
        await page.getByRole('application').filter({ hasText: '05-0105-0405-0705-1005-1305-' }).click();
        await page.getByLabel('Resumen de configuración del').getByText('may 2026 — 31 may 2026').click();
        await page.getByRole('application').filter({ hasText: '05-0105-0405-0705-1005-1305-' }).click();
    });
});

// SKIP hasta tener la funcionalidad de exportar lista
test.skip('HU - 009 - Exportar reporte en formato CSV', async ({ page }) => {
    qase.id(101)
    await test.step('Given que el usuario se encuentra en el menú de reportes', async () => {
        await page.getByRole('button', { name: 'Reportes' }).click();
        await page.getByRole('link', { name: 'Período' }).click();
    });
    await test.step('And existe información disponible en el reporte', async () => {
        await page.getByText('Servicios otorgados por díaMayo').click();
        await page.getByRole('application').filter({ hasText: '12345678910111213141516171819202122232425262728293031036912' }).click();

    });
    await test.step('When presiona el botón de exportar', async () => {
        await page.getByRole('button', { name: 'Exportar' }).click();

    });
    await test.step('Then el sistema debe generar un archivo en formato .csv', async () => {

    });
});

test.skip('HU - 009 - Validar contenido del archivo CSV', async ({ page }) => {
    qase.id(102)
    await test.step('Given que el usuario exportó el reporte en formato .csv', async () => {
        
    });
    await test.step('When abre el archivo descargado', async () => {


    });
    await test.step('Then el archivo debe contener la información de personas atendidas correspondiente al periodo seleccionado', async () => {

    });
});

test('HU - 009 - Mostrar mensaje cuando no existan datos', async ({ page }) => {
    qase.id(103);
    await test.step('Given que no existen personas atendidas en el periodo seleccionado', async () => {
        await page.getByRole('button', { name: 'Reportes' }).click();

    });
    await test.step('When el usuario consulta el reporte', async () => {
        await page.getByRole('link', { name: 'Personalizado' }).click();

    });
    await test.step('Then el sistema debe indicar que no hay datos disponibles para ese periodo', async () => {
        await page.getByText('Sin datos para mostrarDefine').click();
        await page.getByText('Sin datos para mostrar').click();
    });
});







