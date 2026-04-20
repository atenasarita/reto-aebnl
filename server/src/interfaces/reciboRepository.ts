import { ReciboCompleto } from "../types/recibos.types.js";

export interface IReciboRepository {
  /** Devuelve todos los recibos de una fecha */
  listarPorFecha(fecha: string): Promise<ReciboCompleto[]>;

  /** Devuelve un recibo completo por ID de servicio otorgado */
  obtenerPorId(idServicioOtorgado: number): Promise<ReciboCompleto | null>;
}