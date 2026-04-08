import { DashboardRepository } from '../repositories/dashboard.repository';

export class DashboardController {
  private readonly repository: DashboardRepository;

  constructor(repository: DashboardRepository) {
    this.repository = repository;
  }

  async getAgendaHoy() {
    return this.repository.getAgendaHoy();
  }

  async getPreregistroPendiente() {
    return this.repository.getPreregistroPendiente();
  }

  async updatePreregistroEstado(idPreregistro: number, estado: string) {
    return this.repository.updatePreregistroEstado(idPreregistro, estado);
  }
}