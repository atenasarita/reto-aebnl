import { TiposServicioRepository } from '../repositories/servicios.repository';

export class ServiciosController {
  
  private readonly repository: TiposServicioRepository;

  constructor(repository: TiposServicioRepository) {
    this.repository = repository;
  }

  async getTiposServicio() {
    return this.repository.getTiposServicio();
  }
}