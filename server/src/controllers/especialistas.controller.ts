import { EspecialistasRepository } from '../repositories/especialistas.repository';

export class EspecialistasController {
  private readonly repository: EspecialistasRepository;

  constructor(repository: EspecialistasRepository) {
    this.repository = repository;
  }

  async getEspecialistasByEspecialidad(idEspecialidad: number) {
    return this.repository.getEspecialistasByEspecialidad(idEspecialidad);
  }
}