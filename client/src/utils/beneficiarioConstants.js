import {
  TbSquareNumber1Filled,
  TbSquareNumber2Filled,
  TbSquareNumber3Filled,
  TbSquareNumber4Filled,
} from "react-icons/tb";

export const estadosMexico = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
  'Ciudad de Mexico', 'Coahuila', 'Colima', 'Durango', 'Estado de Mexico', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon',
  'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo', 'San Luis Potosi', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatan', 'Zacatecas'
];

export const registroSteps = [
  { icon: TbSquareNumber1Filled, label: 'Datos Personales' },
  { icon: TbSquareNumber2Filled, label: 'Información Médica' },
  { icon: TbSquareNumber3Filled, label: 'Domicilio' },
  { icon: TbSquareNumber4Filled, label: 'Membresía' }
];

export const initialFormData = (fechaRegistro) => ({
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  CURP: '',
  genero: '',
  estado_nacimiento: '',
  fotografia: '',
  telefono: '',
  email: '',
  contacto_nombre: '',
  contacto_telefono: '',
  contacto_parentesco: '',
  alergias: 'Ninguna',
  tipo_sanguineo: '',
  valvula: false,
  hospital: '',
  domicilio_calle: '',
  domicilio_cp: '',
  domicilio_ciudad: '',
  domicilio_estado: '',
  tipo_espinas: [],
  fecha_inicio_membresia: fechaRegistro,
  meses_membresia: 6,
});