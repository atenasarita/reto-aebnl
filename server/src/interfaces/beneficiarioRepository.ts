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
  Padre,
} from '../types/beneficiarios.types';

export interface BeneficiarioRepository {
  getBeneficiarios(): Promise<BeneficiarioDetalle[]>;
  getBeneficiarioById(id_beneficiario: number): Promise<BeneficiarioDetalle>;
  getBeneficiarioByFolio(folio: string): Promise<BeneficiarioDetalle>;
  createBeneficiario(input: CreateBeneficiarioInput): Promise<Beneficiario>;
  createIdentificadores(
    id_beneficiario: number,
    input: CreateIdentificadoresInput
  ): Promise<Identificadores>;
  createDatosMedicos(
    id_beneficiario: number,
    input: CreateDatosMedicosInput
  ): Promise<Datos_medicos>;
  createDireccion(
    id_beneficiario: number,
    input: CreateDireccionInput
  ): Promise<Direccion>;
  getSiguienteFolio(): Promise<string>;
  getMembresiasProximas(): Promise<BeneficiarioConMembresiaProxVencer[]>;
  getPadresByBeneficiarioId(id_beneficiario: number): Promise<Padre[]>;
  updatePadres(id_beneficiario: number, input: any): Promise<void>;
  updateBeneficiario(id_beneficiario: number, input: any): Promise<void>;
  updateMembresia(id_beneficiario: number, input: any): Promise<void>;
}