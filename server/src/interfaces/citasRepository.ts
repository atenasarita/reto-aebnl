import {Cita, CreateCitaInput} from '../types/citas.types';

export interface CitasRepository {
    getCitas(): Promise<Cita[]>;
    createCita(input: CreateCitaInput): Promise<{message: string}>;
}