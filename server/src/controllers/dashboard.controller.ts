import { DashboardRepository } from '../repositories/dashboard.repository';

export class DashboardController {
  constructor(private readonly repository: DashboardRepository) {}

  async getAgendaHoy() {
    return this.repository.getAgendaHoy();
  }

  async getPreregistroPendiente() {
    return this.repository.getPreregistroPendiente();
  }
}