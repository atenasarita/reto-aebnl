import { describe, test, expect } from '@jest/globals';
import { buildBeneficiarioPayload } from '../client/src/utils/beneficiarioPayload.js';

describe('beneficiarioPayload', () => {
  describe('buildBeneficiarioPayload', () => {
    const baseFormData = {
      genero: 'M',
      tipo_espinas: [1, 2],
      CURP: 'PELA900101HMCLRR09',
      nombres: 'Pedro',
      apellido_paterno: 'López',
      apellido_materno: 'Arias',
      estado_nacimiento: 'CDMX',
      fotografia: 'foto.jpg',
      telefono: '5512345678',
      email: 'pedro@example.com',
      contacto_nombre: 'María',
      contacto_telefono: '5512345679',
      contacto_parentesco: 'Hermana',
      alergias: 'Penicilina',
      tipo_sanguineo: 'O+',
      valvula: true,
      hospital: 'Hospital Central',
      padre_nombre: 'Juan López',
      padre_fecha_nacimiento: '1960-01-01',
      padre_email: 'juan@example.com',
      padre_telefono: '5512345680',
      padre_telefono_casa: '5512345681',
      padre_telefono_trabajo: '5512345682',
      madre_nombre: 'Rosa Arias',
      madre_fecha_nacimiento: '1965-02-02',
      madre_email: 'rosa@example.com',
      madre_telefono: '5512345683',
      madre_telefono_casa: '5512345684',
      madre_telefono_trabajo: '5512345685',
      domicilio_calle: 'Calle 1 #100',
      domicilio_cp: '01234',
      domicilio_ciudad: 'Mexico',
      domicilio_estado: 'CDMX',
      fecha_inicio_membresia: '2025-01-01',
      meses_membresia: '12'
    };

    test('construye el payload completo con todos los datos', () => {
      const result = buildBeneficiarioPayload(baseFormData, '2025-01-01', '2000-01-01');

      expect(result.fecha_ingreso).toBe('2025-01-01');
      expect(result.genero).toBe('M');
      expect(result.tipo_espinas).toEqual([1, 2]);
      expect(result.identificadores.CURP).toBe('PELA900101HMCLRR09');
      expect(result.identificadores.nombres).toBe('Pedro');
      expect(result.identificadores.apellido_paterno).toBe('López');
      expect(result.identificadores.apellido_materno).toBe('Arias');
      expect(result.identificadores.fecha_nacimiento).toBe('2000-01-01');
      expect(result.identificadores.email).toBe('pedro@example.com');
      expect(result.datos_medicos.contacto_nombre).toBe('María');
      expect(result.datos_medicos.tipo_sanguineo).toBe('O+');
      expect(result.datos_medicos.valvula).toBe(true);
      expect(result.datos_medicos.padres).toHaveLength(2);
      expect(result.datos_medicos.padres[0].tipo_padre).toBe('padre');
      expect(result.datos_medicos.padres[1].tipo_padre).toBe('madre');
      expect(result.direccion.domicilio_calle).toBe('Calle 1 #100');
      expect(result.membresia.fecha_inicio).toBe('2025-01-01');
      expect(result.membresia.meses).toBe(12);
      expect(result.membresia.metodo_pago).toBe('efectivo');
    });

    test('convierte valvula string a booleano', () => {
      const result = buildBeneficiarioPayload({ ...baseFormData, valvula: 'true' }, '2025-01-01', '2000-01-01');
      expect(result.datos_medicos.valvula).toBe(true);
    });

    test('maneja campos opcionales como null cuando no están presentes', () => {
      const minimalData = {
        genero: 'F',
        tipo_espinas: [],
        CURP: 'TEST000000TESTXX00',
        nombres: 'Test',
        apellido_paterno: 'Usuario',
        apellido_materno: 'Prueba',
        estado_nacimiento: 'CDMX',
        fotografia: null,
        telefono: '5500000000',
        contacto_nombre: 'Contacto',
        contacto_telefono: '5500000001',
        contacto_parentesco: 'Amigo',
        tipo_sanguineo: 'A+',
        hospital: 'Hospital Test',
        domicilio_calle: 'Calle Test',
        domicilio_cp: '00000',
        domicilio_ciudad: 'Test',
        domicilio_estado: 'Test',
        fecha_inicio_membresia: '2025-01-01',
        meses_membresia: '6'
      };

      const result = buildBeneficiarioPayload(minimalData, '2025-01-01', '2000-01-01');

      expect(result.identificadores.email).toBeUndefined();
      expect(result.datos_medicos.alergias).toBeNull();
      expect(result.datos_medicos.padres[0].nombre_completo).toBeNull();
    });
  });
});
