import { BeneficiarioRepository } from "../interfaces/beneficiarioRepository";
import { BeneficiarioDetalle } from "../types/beneficiarios.types";

export class BeneficiariosController {
  repository: BeneficiarioRepository;

  constructor(repository: BeneficiarioRepository) {
    this.repository = repository;
  }

  async getBeneficiarioByFolio(folio: string): Promise<BeneficiarioDetalle> {
    return this.repository.getBeneficiarioByFolio(folio);
  }
}