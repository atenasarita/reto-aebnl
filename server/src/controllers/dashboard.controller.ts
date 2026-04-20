import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardController {
  private readonly repository: DashboardRepository;

  constructor(repository: DashboardRepository) {
    this.repository = repository;
  }

  async getAgendaHoy() {
    return this.repository.getAgendaHoy();
  }

  async getPreregistroPendientes() {
    return this.repository.getPreregistroPendientes();
  }

  async updatePreregistroEstado(
    idPreregistro: number,
    estado: "pendiente" | "aceptado" | "rechazado"
  ) {
    return this.repository.updatePreregistroEstado({
      id_preregistro: idPreregistro,
      estado,
    });
  }
}

export default DashboardController;