import {
    CreateBeneficiarioInput, 
    CreateDireccionInput, 
    CreateIdentificadoresInput, 
    CreateDatosMedicosInput,
    Identificadores,
    Datos_medicos,
    Direccion,
    Beneficiario 
} from '../types/beneficiarios.types.ts'

export interface BeneficiarioRepository 
{ 
    createBeneficiario(input: CreateBeneficiarioInput): Promise<Beneficiario>;
    createIdentificadores(id_beneficiario: number, input: CreateIdentificadoresInput): Promise<Identificadores>;
    createDatosMedicos(id_beneficiario: number, input: CreateDatosMedicosInput): Promise<Datos_medicos>;
    createDireccion(id_beneficiario: number, input: CreateDireccionInput): Promise<Direccion>;
}
