import { TiposServicioRepository } from '../repositories/servicios.repository';

export class TiposServicioController {
  private readonly repository: TiposServicioRepository;

  constructor(repository: TiposServicioRepository) {
    this.repository = repository;
  }

  async getTiposServicio() {
    return this.repository.getTiposServicio();
  }
}