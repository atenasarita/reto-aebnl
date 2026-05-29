import { FondoDonacionesRepository } from '../repositories/fondoDonaciones.repository';
import { RegistrarAbonoInput } from '../types/fondoDonaciones.types';

export class FondoDonacionesController {
  private readonly repository: FondoDonacionesRepository;

  constructor(repository: FondoDonacionesRepository = new FondoDonacionesRepository()) {
    this.repository = repository;
  }

  getSaldo() {
    return this.repository.getSaldo();
  }

  listarMovimientos(limite?: number) {
    return this.repository.listarMovimientos(limite);
  }

  registrarAbono(input: RegistrarAbonoInput) {
    return this.repository.registrarAbono(input);
  }
}
