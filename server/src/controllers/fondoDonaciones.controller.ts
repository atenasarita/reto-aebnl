import { FondoDonacionesRepository } from '../repositories/fondoDonaciones.repository';
import { CrearDonadorInput, RegistrarAbonoInput } from '../types/fondoDonaciones.types';

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

  listarDonadores() {
    return this.repository.listarDonadores();
  }

  crearDonador(input: CrearDonadorInput) {
    return this.repository.crearDonador(input);
  }

  registrarAbono(input: RegistrarAbonoInput) {
    return this.repository.registrarAbono(input);
  }
}
