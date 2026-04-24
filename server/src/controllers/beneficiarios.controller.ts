import { BeneficiarioRepository } from "../interfaces/beneficiarioRepository";
import {
  Beneficiario,
  BeneficiarioDetalle,
  BeneficiarioConMembresiaProxVencer,
  CreateBeneficiarioInput,
  CreateDatosMedicosInput,
  CreateDireccionInput,
  CreateIdentificadoresInput,
  Datos_medicos,
  Direccion,
  Identificadores,
  Padre
} from "../types/beneficiarios.types";

export class BeneficiariosController {
    repository: BeneficiarioRepository;

    constructor(repository: BeneficiarioRepository) {
        this.repository = repository;
    }
    
    async getBeneficiarios(): Promise<BeneficiarioDetalle[]> {
        return this.repository.getBeneficiarios();
    }

    async getBeneficiarioById(id_beneficiario: number): Promise<BeneficiarioDetalle> {
        return this.repository.getBeneficiarioById(id_beneficiario);
    }

    async getBeneficiarioByFolio(folio: string): Promise<BeneficiarioDetalle> {
        return this.repository.getBeneficiarioByFolio(folio);
    }

    async getPadresByBeneficiarioId(id_beneficiario: number): Promise<Padre[]> {
        return this.repository.getPadresByBeneficiarioId(id_beneficiario);
    }
    
    async createBeneficiario(input: CreateBeneficiarioInput): Promise<Beneficiario> {
        return this.repository.createBeneficiario(input);
    }

    async createIdentificadores(id_beneficiario: number, input: CreateIdentificadoresInput): Promise<Identificadores> {
        return this.repository.createIdentificadores(id_beneficiario, input);
    }

    async createDatosMedicos(id_beneficiario: number, input: CreateDatosMedicosInput): Promise<Datos_medicos> {
        return this.repository.createDatosMedicos(id_beneficiario, input);
    }
    
    async createDireccion(id_beneficiario: number, input: CreateDireccionInput): Promise<Direccion> {
        return this.repository.createDireccion(id_beneficiario, input);
    }

    async getSiguienteFolio(): Promise<string> {
        return this.repository.getSiguienteFolio();
    }

    async getMembresiasProximas() {
        return await this.repository.getMembresiasProximas();
    }
}