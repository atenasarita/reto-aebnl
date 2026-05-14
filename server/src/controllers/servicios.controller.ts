import { ServicioRepository } from '../repositories/servicios.repository';

export class ServiciosController {
  
  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  async getTiposServicio() {
    return this.repository.getTiposServicio();
  }
}