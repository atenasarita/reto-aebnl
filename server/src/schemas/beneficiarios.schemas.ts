import { z } from 'zod';

export const tipoSanguineoSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

export const estadosMexicoSchema = z.enum([
	'Aguascalientes',
	'Baja California',
	'Baja California Sur',
	'Campeche',
	'Chiapas',
	'Chihuahua',
	'Ciudad de Mexico',
	'Coahuila',
	'Colima',
	'Durango',
	'Estado de Mexico',
	'Guanajuato',
	'Guerrero',
	'Hidalgo',
	'Jalisco',
	'Michoacan',
	'Morelos',
	'Nayarit',
	'Nuevo Leon',
	'Oaxaca',
	'Puebla',
	'Queretaro',
	'Quintana Roo',
	'San Luis Potosi',
	'Sinaloa',
	'Sonora',
	'Tabasco',
	'Tamaulipas',
	'Tlaxcala',
	'Veracruz',
	'Yucatan',
	'Zacatecas',
]);

export const createIdentificadoresSchema = z.object({
	CURP: z.string().trim().min(18, 'CURP es requerido').max(20),
	nombres: z.string().trim().min(1, 'nombres es requerido').max(40),
	apellido_paterno: z.string().trim().min(1, 'apellido_paterno es requerido').max(20),
	apellido_materno: z.string().trim().min(1, 'apellido_materno es requerido').max(20),
	fecha_nacimiento: z.coerce.date(),
	estado_nacimiento: estadosMexicoSchema,
	fotografia: z.string().trim().max(500).optional(),
	telefono: z.string().trim().max(10).optional(),
	email: z.string().trim().email('email invalido').max(100).optional(),
});

export const createDatosMedicosSchema = z.object({
	contacto_nombre: z.string().trim().min(1, 'contacto_nombre es requerido').max(20),
	contacto_telefono: z.string().trim().min(1, 'contacto_telefono es requerido').max(10),
	contacto_parentesco: z.string().trim().min(1, 'contacto_parentesco es requerido').max(20),
	alergias: z.string().trim().min(1, 'alergias es requerido').max(100),
	tipo_sanguineo: tipoSanguineoSchema,
});

export const createDireccionSchema = z.object({
	domicilio_calle: z.string().trim().min(1, 'domicilio_calle es requerido').max(100),
	domicilio_cp: z.string().trim().min(5, 'domicilio_cp debe tener 5 caracteres').max(5),
	domicilio_ciudad: z.string().trim().min(1, 'domicilio_ciudad es requerido').max(20),
	domicilio_estado: estadosMexicoSchema,
});

export const createBeneficiarioSchema = z.object({
	fecha_ingreso: z.coerce.date(),
	genero: z.enum(['masculino', 'femenino', 'otro']),
	tipo_espina: z.number().int().positive(),
	folio: z.string().trim().max(11).optional(),
	estado: z.enum(['activo', 'inactivo']).optional(),
	identificadores: createIdentificadoresSchema,
	datos_medicos: createDatosMedicosSchema,
	direccion: createDireccionSchema,
});