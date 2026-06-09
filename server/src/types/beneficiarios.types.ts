import { CreateMembresiaInput, Membresia } from './membresias.types';
import { Espina_bifida } from './espina.types';

export type Genero = 'masculino' | 'femenino' | 'otro';
export type EstadoBeneficiario = 'activo' | 'inactivo';
export type EstadoMembresia = 'activa' | 'vencida';

export interface TipoEspina {
  id_espina: number;
  nombre: string;
}

export interface Padre {
  id_padre: number;
  id_datos_medicos: number;
  tipo_padre: string;
  nombre_completo: string | null;
  fecha_nacimiento: string | null;
  email: string | null;
  telefono: string | null;
  telefono_casa: string | null;
  telefono_trabajo: string | null;
}

export interface Identificadores {
  id_identificadores: number;
  id_beneficiario: number;
  CURP: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: Date | string;
  estado_nacimiento: string;
  fotografia: string;
  telefono: string;
  email: string;
}

export interface Datos_medicos {
  id_datos_medicos: number;
  id_beneficiario: number;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_parentesco: string;
  alergias: string;
  tipo_sanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  valvula: boolean;
  hospital: string;
  diagnostico_otro?: string;
}

export interface Direccion {
  id_direccion: number;
  id_beneficiario: number;
  domicilio_calle: string;
  domicilio_cp: string;
  domicilio_ciudad: string;
  domicilio_estado: string;
}

export interface Membresia {
  id_membresia: number;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoMembresia;
  metodo_pago: string;
}

export interface Beneficiario {
  id_beneficiario: number;
  folio: string;
  fecha_ingreso: string;
  genero: Genero;
  tipo_espinas: number[];
  estado: EstadoBeneficiario;
}

export interface BeneficiarioDetalle {
  id_beneficiario: number;
  folio: string;
  fecha_ingreso: string;
  genero: Genero;
  estado: EstadoBeneficiario;
  tipo_espina: TipoEspina[];
  identificadores: Identificadores;
  datos_medicos: Datos_medicos;
  direccion: Direccion;
  dias_para_vencer: number | null;
  membresia: Membresia | null;
}

export interface BeneficiarioConMembresiaProxVencer extends BeneficiarioDetalle {
  membresia: Membresia;
}

export interface CreatePadreInput {
  tipo_padre: string;
  nombre_completo?: string;
  fecha_nacimiento?: string;
  email?: string;
  telefono?: string;
  telefono_casa?: string;
  telefono_trabajo?: string;
}

export interface CreateIdentificadoresInput {
  CURP: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  estado_nacimiento: string;
  fotografia?: string;
  telefono?: string;
  email?: string;
}

export interface CreateDatosMedicosInput {
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_parentesco: string;
  alergias: string;
  tipo_sanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  valvula: boolean;
  hospital?: string;
  diagnostico_otro?: string;
  padres?: CreatePadreInput[];
}

export interface CreateDireccionInput {
  domicilio_calle: string;
  domicilio_cp: string;
  domicilio_ciudad: string;
  domicilio_estado: string;
}

export interface CreateBeneficiarioInput {
  folio?: string;
  fecha_ingreso: string;
  genero: Genero;
  tipo_espinas: number[];
  identificadores: CreateIdentificadoresInput;
  datos_medicos: CreateDatosMedicosInput;
  direccion: CreateDireccionInput;
  membresia?: {
    precio_mensual: number;
    meses: number;
    metodo_pago: string;
    fecha_inicio?: string;
  };
}