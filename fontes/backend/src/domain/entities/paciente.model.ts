import { BaseResourceModel } from "./baseResource.model"  


export interface IPaciente extends BaseResourceModel { 
  nome?: string
  sexo?: string
  dataNascimento?: any
  cpf?: string
  telefone?: string
  email?: string
  indicacao?: string
  exigenciasTrabalho?: string
  atividadesLazer?: string
  posturaStress?: string
  limitacaoFuncionalAtual?: string
  pontuacaoIncapacidadeFuncional?: number
  pontuacaoEVA?: number
} 
export class Paciente extends BaseResourceModel implements IPaciente{ 
  nome?: string
  sexo?: string
  dataNascimento?: any
  cpf?: string
  telefone?: string
  email?: string
  indicacao?: string
  exigenciasTrabalho?: string
  atividadesLazer?: string
  posturaStress?: string
  limitacaoFuncionalAtual?: string
  pontuacaoIncapacidadeFuncional?: number
  pontuacaoEVA?: number
  constructor(input: IPaciente){
    super();
    this.id = input.id;
    this.nome = input.nome;
    this.sexo = input.sexo;
    this.dataNascimento = input.dataNascimento;
    this.cpf = input.cpf;
    this.telefone = input.telefone;
    this.email = input.email;
    this.indicacao = input.indicacao;
    this.exigenciasTrabalho = input.exigenciasTrabalho;
    this.atividadesLazer = input.atividadesLazer;
    this.posturaStress = input.posturaStress;
    this.limitacaoFuncionalAtual = input.limitacaoFuncionalAtual;
    this.pontuacaoIncapacidadeFuncional = input.pontuacaoIncapacidadeFuncional;
    this.pontuacaoEVA = input.pontuacaoEVA;
    this.createdAt = input.createdAt; 
    this.updatedAt = input.updatedAt; 
 }

  static fromJson(jsonData: IPaciente) : Paciente { 
    return new Paciente(jsonData);
  } 
}
