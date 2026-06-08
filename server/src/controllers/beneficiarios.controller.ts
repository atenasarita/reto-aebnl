import { BeneficiarioRepository } from '../interfaces/beneficiarioRepository';
import {
  CreateBeneficiarioInput,
  CreateDatosMedicosInput,
  CreateDireccionInput,
  CreateIdentificadoresInput,
} from '../types/beneficiarios.types';

export class BeneficiariosController {
  beneficiarioRepository: BeneficiarioRepository;

  constructor(beneficiarioRepository: BeneficiarioRepository) {
    this.beneficiarioRepository = beneficiarioRepository;
  }

  async getBeneficiarios() {
    return await this.beneficiarioRepository.getBeneficiarios();
  }

  async getBeneficiarioById(id_beneficiario: number) {
    return await this.beneficiarioRepository.getBeneficiarioById(id_beneficiario);
  }

  async getBeneficiarioByFolio(folio: string) {
    return await this.beneficiarioRepository.getBeneficiarioByFolio(folio);
  }

  async createBeneficiario(input: CreateBeneficiarioInput) {
    return await this.beneficiarioRepository.createBeneficiario(input);
  }

  async createIdentificadores(id_beneficiario: number, input: CreateIdentificadoresInput) {
    return await this.beneficiarioRepository.createIdentificadores(id_beneficiario, input);
  }

  async createDatosMedicos(id_beneficiario: number, input: CreateDatosMedicosInput) {
    return await this.beneficiarioRepository.createDatosMedicos(id_beneficiario, input);
  }

  async createDireccion(id_beneficiario: number, input: CreateDireccionInput) {
    return await this.beneficiarioRepository.createDireccion(id_beneficiario, input);
  }

  async getSiguienteFolio() {
    return await this.beneficiarioRepository.getSiguienteFolio();
  }

  async getMembresiasProximas() {
    return await this.beneficiarioRepository.getMembresiasProximas();
  }

  async getPadresByBeneficiarioId(id_beneficiario: number) {
    return await this.beneficiarioRepository.getPadresByBeneficiarioId(id_beneficiario);
  }

  async updatePadres(id_beneficiario: number, input: any) {
    await this.beneficiarioRepository.updatePadres(id_beneficiario, input);
    return { message: 'Datos de padres actualizados correctamente' };
  }

  async updateBeneficiario(id_beneficiario: number, input: any): Promise<void> {
    return this.beneficiarioRepository.updateBeneficiario(id_beneficiario, input);
  }
  async updateMembresia(id_beneficiario: number, input: any): Promise<void> {
    return this.beneficiarioRepository.updateMembresia(id_beneficiario, input);
  }
}