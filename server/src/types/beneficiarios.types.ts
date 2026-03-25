// Types base de datos
export interface Beneficiario {
    id_beneficiario: number;
    folio: string;
    fecha_ingreso: Date;
    genero: 'masculino' | 'femenino' | 'otro';
    tipo_espina: number;
    estado: 'activo' | 'inactivo';
}

export interface Datos_medicos {
    id_datos_medicos: number;
    id_beneficiario: number;
    contacto_nombre: string;
    contacto_telefono: string;
    contacto_parentesco: string;
    alergias: string;
    tipo_sanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
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
    tipo_sanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

export interface CreateDireccionInput {
    domicilio_calle: string;
    domicilio_cp: string;
    domicilio_ciudad: string;
    domicilio_estado: string;
}

export interface CreateBeneficiarioInput {
    fecha_ingreso: Date;
    genero: 'masculino' | 'femenino' | 'otro';
    tipo_espina: number;
    folio?: string;
    estado?: 'activo' | 'inactivo';
    identificadores: CreateIdentificadoresInput;
    datos_medicos: CreateDatosMedicosInput;
    direccion: CreateDireccionInput;
}