import {
    BeneficiarioDetalle,
    CreateBeneficiarioInput, 
    CreateDireccionInput, 
    CreateIdentificadoresInput, 
    CreateDatosMedicosInput,
    Identificadores,
    Datos_medicos,
    Direccion,
    Beneficiario 
} from '../types/beneficiarios.types';

export interface BeneficiarioRepository 
{ 
    getBeneficiarios(): Promise<BeneficiarioDetalle[]>;
    getBeneficiarioById(id_beneficiario: number): Promise<BeneficiarioDetalle>;
    getBeneficiarioByFolio(folio: string): Promise<BeneficiarioDetalle>;
    createBeneficiario(input: CreateBeneficiarioInput): Promise<Beneficiario>;
    createIdentificadores(id_beneficiario: number, input: CreateIdentificadoresInput): Promise<Identificadores>;
    createDatosMedicos(id_beneficiario: number, input: CreateDatosMedicosInput): Promise<Datos_medicos>;
    createDireccion(id_beneficiario: number, input: CreateDireccionInput): Promise<Direccion>;
}