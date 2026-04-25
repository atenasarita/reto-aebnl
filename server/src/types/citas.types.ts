export type EstatusCita =  "programada" | "completada" | "cancelada";

export interface Cita {
    id_cita: number;
    id_beneficiario: number;
    fecha: Date;
    hora: string;
    id_especialista: number;
    id_catalogo_servicio: number;
    motivo?: string | null;
    notas?: string | null;
    estatus: EstatusCita;
}

export interface CitaDetalle {
    id_cita: number;
    id_beneficiario: number;
    fecha: Date;
    hora: string;
    id_especialista: number;
    id_catalogo_servicio: number;
    motivo?: string | null;
    notas?: string | null;
    estatus: EstatusCita;

}

export interface CreateCitaInput {
  id_beneficiario: number;
  fecha: Date;
  hora: string;
  id_especialista: number;
  id_catalogo_servicio: number;
  motivo?: string | null;
  notas?: string | null;
  estatus?: EstatusCita;
}