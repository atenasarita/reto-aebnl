import { BeneficiarioDetalle } from "../types/beneficiarios.types";

export interface BeneficiarioRepository {
  getBeneficiarioByFolio(folio: string): Promise<BeneficiarioDetalle>;
}