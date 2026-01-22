import { BaseResourceModel } from "app/shared/models/base-resource.model"; 

export class Paciente extends BaseResourceModel {
    id?: any;
    nome?: string;
    sexo?: string;
    dataNascimento?: any;
    cpf?: string;
    telefone?: string;
    email?: string;
    indicacao?: string;
    exigenciasTrabalho?: string;
    atividadesLazer?: string;
    posturaStress?: string;
    limitacaoFuncionalAtual?: string;
    pontuacaoIncapacidadeFuncional?: number;
    pontuacaoEVA?: number;

    static fromJson(jsonData: any): Paciente{ 
        return Object.assign(new Paciente(), jsonData); 
    } 
}

