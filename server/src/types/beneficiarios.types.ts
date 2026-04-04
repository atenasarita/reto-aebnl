import { CreateMembresiaInput } from './membresias.types';
import { Espina_bifida } from './espina.types';

export type Genero = 'masculino' | 'femenino' | 'otro';
export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Estado = 'activo' | 'inactivo';

// Types base de datos
export interface Beneficiario {
    id_beneficiario: number;
    folio: string;
    fecha_ingreso: Date;
    genero: Genero;
    tipo_espinas: number[];
    estado: Estado;
}

export interface BeneficiarioDetalle {
    id_beneficiario: number;
    folio: string;
    fecha_ingreso: string;
    genero: Genero;
    estado: Estado;
    tipo_espina: Espina_bifida[];
    identificadores: Identificadores;
    datos_medicos: Datos_medicos;
    direccion: Direccion;
}

export interface Datos_medicos {
    id_datos_medicos: number;
    id_beneficiario: number;
    contacto_nombre: string;
    contacto_telefono: string;
    contacto_parentesco: string;
    alergias: string;
    tipo_sanguineo: TipoSanguineo;
}

export interface Identificadores {
    id_identificadores: number;
    id_beneficiario: number;
    CURP: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: Date;
    estado_nacimiento: string;
    fotografia: string;
    telefono: string;
    email: string;
}

export interface Direccion {
    id_direccion: number;
    id_beneficiario: number;
    domicilio_calle: string;
    domicilio_cp: string;
    domicilio_ciudad: string;
    domicilio_estado: string;
}

// Types funciones
export interface CreateIdentificadoresInput {
    CURP: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: Date;
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
    tipo_sanguineo: TipoSanguineo;
}

export interface CreateDireccionInput {
    domicilio_calle: string;
    domicilio_cp: string;
    domicilio_ciudad: string;
    domicilio_estado: string;
}

export interface CreateBeneficiarioInput {
    fecha_ingreso: Date;
    genero: Genero;
    tipo_espinas: number[];
    folio?: string;
    identificadores: CreateIdentificadoresInput;
    datos_medicos: CreateDatosMedicosInput;
    direccion: CreateDireccionInput;
    membresia?: CreateMembresiaInput;
}