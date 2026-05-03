import { test, expect } from '@playwright/test';

test.describe('Registro de Beneficiario IA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Usuario' }).click();
    await page.getByRole('textbox', { name: 'Usuario' }).fill('prueba1');
    await page.getByRole('textbox', { name: '********' }).click();
    await page.getByRole('textbox', { name: '********' }).fill('admin1');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click(); 
  });

  const fillBeneficiario = async (page, datos) => {
    await page.getByRole('button', { name: 'Nuevo Beneficiario' }).click();

    // SECCIÓN 1: Datos Personales
    await page.locator('input[name="email"]').fill(datos.email);
    await page.locator('input[name="telefono"]').fill(datos.telefono);
    await page.locator('input[name="nombres"]').fill(datos.nombres);
    await page.locator('input[name="apellido_paterno"]').fill(datos.apellidoPaterno);
    await page.locator('input[name="apellido_materno"]').fill(datos.apellidoMaterno);
    await page.locator('input[name="fecha_nacimiento"]').fill(datos.fechaNacimiento);
    await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).fill(datos.curp);
    await page.locator('select[name="genero"]').selectOption(datos.genero);
    await page.locator('select[name="estado_nacimiento"]').selectOption(datos.estadoNacimiento);

    // Click en Continuar para ir a Información Médica
    await page.getByRole('button', { name: 'Continuar' }).click();

    // SECCIÓN 2: Información Médica
    await page.locator('input[name="contacto_nombre"]').fill(datos.contactoNombre);
    await page.locator('input[name="contacto_telefono"]').fill(datos.contactoTelefono);
    await page.locator('input[name="contacto_parentesco"]').fill(datos.contactoParentesco);
    await page.locator('select[name="tipo_sanguineo"]').selectOption(datos.tipoSanguineo);
    await page.getByText(datos.tipoEspina, { exact: true }).click();
    await page.locator('select[name="valvula"]').selectOption(datos.valvula);
    await page.locator('input[name="hospital"]').fill(datos.hospital);

    // Click en Continuar para ir a Domicilio
    await page.getByRole('button', { name: 'Continuar' }).click();

    // SECCIÓN 3: Domicilio
    await page.locator('input[name="domicilio_calle"]').fill(datos.calle);
    await page.getByRole('combobox').selectOption(datos.estado);
    await page.locator('input[name="domicilio_ciudad"]').fill(datos.ciudad);
    await page.locator('input[name="domicilio_cp"]').fill(datos.cp);

    // Click en Continuar para ir a Membresía
    await page.getByRole('button', { name: 'Continuar' }).click();

    // SECCIÓN 4: Membresía - Solo hacer clic en Registrar, sin modificar nada
    await page.getByRole('button', { name: 'Registrar' }).click();

    // Esperar el modal de éxito con el heading correcto
    await expect(page.getByRole('heading', { name: 'Registro exitoso' })).toBeVisible();
    await expect(page.getByText('El beneficiario fue registrado correctamente en el sistema.')).toBeVisible();

    // Hacer clic en Aceptar para cerrar el modal
    await page.getByRole('button', { name: 'Aceptar' }).click();
  };

  test('debería registrar un nuevo beneficiario exitosamente en Firefox', async ({ page }) => {
    test.skip(test.info().project.name !== 'firefox', 'Solo en Firefox');

    await fillBeneficiario(page, {
      email: 'juan.perez@example.com',
      telefono: '5551234567',
      nombres: 'Juanx',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'López',
      fechaNacimiento: '1990-01-01',
      curp: 'JUAP900101HDFRRNT0',
      genero: 'masculino',
      estadoNacimiento: 'Jalisco',
      contactoNombre: 'María Pérez',
      contactoTelefono: '5559876543',
      contactoParentesco: 'Madre',
      tipoSanguineo: 'O+',
      tipoEspina: 'Meningocele',
      valvula: 'false',
      hospital: 'Hospital General',
      calle: 'Calle Falsa 123',
      estado: 'Jalisco',
      ciudad: 'Guadalajara',
      cp: '44100',
    });
  });

  test('debería registrar un nuevo beneficiario exitosamente en Chromium', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'Solo en Chromium');

    await fillBeneficiario(page, {
      email: 'carla.rodriguez@example.com',
      telefono: '5557654321',
      nombres: 'Carlaxt',
      apellidoPaterno: 'Rodríguez',
      apellidoMaterno: 'Martínez',
      fechaNacimiento: '1992-02-02',
      curp: 'CARL920202HDFRRNS0',
      genero: 'femenino',
      estadoNacimiento: 'Jalisco',
      contactoNombre: 'Ana Martínez',
      contactoTelefono: '5558765432',
      contactoParentesco: 'Madre',
      tipoSanguineo: 'A+',
      tipoEspina: 'Meningocele',
      valvula: 'false',
      hospital: 'Hospital General',
      calle: 'Avenida Siempre Viva 742',
      estado: 'Jalisco',
      ciudad: 'Guadalajara',
      cp: '44120',
    });
  });

  test('no debería registrar beneficiario con CURP duplicado CARL920202HDFRRNX2', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuevo Beneficiario' }).click();
    await page.locator('input[name="email"]').fill('duplicado2@test.com');
    await page.locator('input[name="telefono"]').fill('5512345603');
    await page.locator('input[name="nombres"]').fill('Carlos');
    await page.locator('input[name="apellido_paterno"]').fill('Fernández');
    await page.locator('input[name="apellido_materno"]').fill('Muñoz');
    await page.locator('input[name="fecha_nacimiento"]').fill('1991-02-02');
    await page.getByRole('textbox', { name: 'XXXX000000XXXXXX00' }).fill('CARL920202HDFRRNX2');
    await page.locator('select[name="genero"]').selectOption('masculino');
    await page.locator('select[name="estado_nacimiento"]').selectOption('Jalisco');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.locator('input[name="contacto_nombre"]').fill('Laura Fernández');
    await page.locator('input[name="contacto_telefono"]').fill('5512345604');
    await page.locator('input[name="contacto_parentesco"]').fill('Madre');
    await page.locator('select[name="tipo_sanguineo"]').selectOption('A+');
    await page.getByText('Meningocele', { exact: true }).click();
    await page.locator('select[name="valvula"]').selectOption('false');
    await page.locator('input[name="hospital"]').fill('Hospital General');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.locator('input[name="domicilio_calle"]').fill('Calle 2');
    await page.getByRole('combobox').selectOption('Jalisco');
    await page.locator('input[name="domicilio_ciudad"]').fill('Guadalajara');
    await page.locator('input[name="domicilio_cp"]').fill('44120');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Registrar' }).click();
    await expect(page.getByText('Ya existe un registro con datos unicos de beneficiario.')).toBeVisible();
  });
});


