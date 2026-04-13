// Tabla de base de datos
export interface PreregistroRow {
  id_preregistro: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: Date;
  genero: string | null;
  id_espina: number | null;
  curp: string;
  id_beneficiario: number | null;
  estado: string;
}

// Para recibir el POST
export interface CrearPreregistroBody {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero?: string;
  espinaBifida: number[];
  diagnostico_otro?: string | null;
  curp: string;
}

// Respuesta al crear un preregistro
export interface PreregistroCreado {
  id_preregistro: number;
  estado: string;
  mensaje: string;
}
