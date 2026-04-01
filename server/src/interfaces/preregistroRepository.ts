import { CrearPreregistroBody, PreregistroRow } from "../types/preregistros.types";

export interface IPreregistroRepository {
  crear(data: CrearPreregistroBody): Promise<PreregistroRow>;
  obtenerPorId(id: number): Promise<PreregistroRow | null>;
  listar(): Promise<PreregistroRow[]>;
}
