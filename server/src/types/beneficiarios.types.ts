import { CreateMembresiaInput, Membresia } from './membresias.types';
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
    membresia: MembresiaResumen | null;
    dias_para_vencer?: number | null;
}

export interface MembresiaResumen {
  id_membresia: number;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  metodo_pago: string;
}


export interface Datos_medicos {
    id_datos_medicos: number;
    id_beneficiario: number;
    contacto_nombre: string;
    contacto_telefono: string;
    contacto_parentesco: string;
    alergias: string;
    tipo_sanguineo: TipoSanguineo;
    valvula: boolean;
    hospital: string;
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

export interface CreatePadreInput {
    tipo_padre: 'padre' | 'madre';
    nombre_completo?: string | null;
    fecha_nacimiento?: Date | string | null;
    email?: string | null;
    telefono?: string | null;
    telefono_casa?: string | null;
    telefono_trabajo?: string | null;
}

export interface CreateDatosMedicosInput {
    contacto_nombre: string;
    contacto_telefono: string;
    contacto_parentesco: string;
    alergias: string;
    tipo_sanguineo: TipoSanguineo;
    valvula: boolean;
    hospital?: string;
    padres?: CreatePadreInput[];
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

export interface BeneficiarioConMembresiaProxVencer extends BeneficiarioDetalle {
    membresia: {
        id_membresia: number;
        precio: number;
        fecha_inicio: string;
        fecha_fin: string;
        estado: string;
        metodo_pago: string;
    };
}