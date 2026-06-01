let validateField;
let validateStepFields;
let validateStep;

beforeAll(async () => {
  const module = await import('../client/src/utils/beneficiarioValidation.js');
  validateField = module.validateField;
  validateStepFields = module.validateStepFields;
  validateStep = module.validateStep;
});

describe('beneficiarioValidation', () => {
  describe('validateField', () => {
    test('telefono invalido devuelve error', () => {
      expect(validateField('telefono', '123')).toBe('No es un numero de telefono valido');
    });

    test('domicilio_cp invalido devuelve error', () => {
      expect(validateField('domicilio_cp', '1234')).toBe('No es un codigo postal valido');
    });

    test('nombres con numeros devuelve error', () => {
      expect(validateField('nombres', 'Ana123')).toBe('Solo se permiten letras');
    });

    test('CURP invalida devuelve error', () => {
      expect(validateField('CURP', 'ABC123')).toBe('CURP invalida');
    });

    test('campo valido devuelve cadena vacia', () => {
      expect(validateField('telefono', '5512345678')).toBe('');
      expect(validateField('nombres', 'Ana María')).toBe('');
      expect(validateField('domicilio_cp', '01234')).toBe('');
      expect(validateField('CURP', 'PELA900101HMCLRR09')).toBe('');
    });
  });

  describe('validateStepFields', () => {
    const baseFormData = {
      nombres: 'Ana',
      telefono: '5512345678',
      apellido_paterno: 'Pérez',
      apellido_materno: 'López',
      CURP: 'PELA900101HMCLRR09',
      genero: 'F',
      estado_nacimiento: 'CDMX',
      contacto_nombre: 'Juan',
      contacto_telefono: '5512345678',
      contacto_parentesco: 'Padre',
      tipo_sanguineo: 'O+',
      hospital: 'General',
      tipo_espinas: ['Tipo 1'],
      domicilio_calle: 'Calle 1',
      domicilio_cp: '01234',
      domicilio_ciudad: 'Ciudad',
      domicilio_estado: 'CDMX',
      fecha_inicio_membresia: '2025-01-01',
      meses_membresia: '12',
    };

    test('step 0 con datos validos no devuelve errores', () => {
      const errors = validateStepFields(0, baseFormData, '2000-01-01');
      expect(errors).toEqual({});
    });

    test('step 0 sin fechaNacimiento devuelve error de fecha', () => {
      const errors = validateStepFields(0, baseFormData, '');
      expect(errors.fecha_nacimiento).toBe('Favor de llenar este campo');
    });

    test('step 1 sin tipo_espinas devuelve error', () => {
      const errors = validateStepFields(1, { ...baseFormData, tipo_espinas: [] }, null);
      expect(errors.tipo_espinas).toBe('Favor de seleccionar al menos una opción');
    });

    test('step 1 con telefono de contacto invalido devuelve error', () => {
      const errors = validateStepFields(1, { ...baseFormData, contacto_telefono: '123' }, null);
      expect(errors.contacto_telefono).toBe('No es un numero de telefono valido');
    });

    test('step 2 con cp invalido devuelve error', () => {
      const errors = validateStepFields(2, { ...baseFormData, domicilio_cp: '123' }, null);
      expect(errors.domicilio_cp).toBe('No es un codigo postal valido');
    });

    test('step 3 con meses_membresia cero devuelve error', () => {
      const errors = validateStepFields(3, { ...baseFormData, meses_membresia: '0' }, null);
      expect(errors.meses_membresia).toBe('Favor de llenar este campo');
    });
  });

  describe('validateStep', () => {
    const validFormData = {
      nombres: 'Ana',
      telefono: '5512345678',
      apellido_paterno: 'Pérez',
      apellido_materno: 'López',
      CURP: 'PELA900101HMCLRR09',
      genero: 'F',
      estado_nacimiento: 'CDMX',
      contacto_nombre: 'Juan',
      contacto_telefono: '5512345678',
      contacto_parentesco: 'Padre',
      tipo_sanguineo: 'O+',
      hospital: 'General',
      tipo_espinas: ['Tipo 1'],
      domicilio_calle: 'Calle 1',
      domicilio_cp: '01234',
      domicilio_ciudad: 'Ciudad',
      domicilio_estado: 'CDMX',
      fecha_inicio_membresia: '2025-01-01',
      meses_membresia: '12',
    };

    test('validateStep devuelve true con datos validos', () => {
      expect(validateStep(0, validFormData, '2000-01-01')).toBe(true);
    });

    test('validateStep devuelve false con datos invalidos', () => {
      expect(validateStep(0, { ...validFormData, telefono: '' }, '')).toBe(false);
    });
  });
});
