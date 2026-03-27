export interface BeneficiarioDetalle {
    id_beneficiario: number;
    folio: string;
    fecha_ingreso: string;
    genero: 'masculino' | 'femenino' | 'otro' | null;
    estado: 'activo' | 'inactivo';
    tipo_espina: {
      id_espina: number | null;
      nombre: string | null;
    };
    identificadores: {
      curp: string | null;
      nombres: string | null;
      apellido_paterno: string | null;
      apellido_materno: string | null;
      fecha_nacimiento: string | null;
      estado_nacimiento: string | null;
      fotografia: string | null;
      telefono: string | null;
      email: string | null;
    };
    datos_medicos: {
      contacto_nombre: string | null;
      contacto_telefono: string | null;
      contacto_parentesco: string | null;
      alergias: string | null;
      tipo_sanguineo: string | null;
    };
    direccion: {
      domicilio_calle: string | null;
      domicilio_cp: string | null;
      domicilio_ciudad: string | null;
      domicilio_estado: string | null;
    };
  }