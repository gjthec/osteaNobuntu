import { BaseResourceModel } from "./baseResource.model"  
import { Paciente } from "./paciente.model"; 
import { Avaliacao } from "./avaliacao.model"; 


export interface IAgenda extends BaseResourceModel { 
  titulo?: string
  observacao?: string
  data?: any
  hora?: string
  status?: string
  paciente?: Paciente
  avaliacao?: Avaliacao
} 
export class Agenda extends BaseResourceModel implements IAgenda{ 
  titulo?: string
  observacao?: string
  data?: any
  hora?: string
  status?: string
  paciente?: Paciente
  avaliacao?: Avaliacao
  constructor(input: IAgenda){
    super();
    this.id = input.id;
    this.titulo = input.titulo;
    this.observacao = input.observacao;
    this.data = input.data;
    this.hora = input.hora;
    this.status = input.status;
    this.paciente = input.paciente;
    this.avaliacao = input.avaliacao;
    this.createdAt = input.createdAt; 
    this.updatedAt = input.updatedAt; 
 }

  static fromJson(jsonData: IAgenda) : Agenda { 
    return new Agenda(jsonData);
  } 
}
