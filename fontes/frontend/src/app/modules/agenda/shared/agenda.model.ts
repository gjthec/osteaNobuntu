import { Paciente } from "app/modules/paciente/shared/paciente.model";
import { Avaliacao } from "app/modules/avaliacao/shared/avaliacao.model";

import { BaseResourceModel } from "app/shared/models/base-resource.model"; 

export class Agenda extends BaseResourceModel {
    id?: any;
    titulo?: string;
    observacao?: string;
    data?: any;
    hora?: string;
    status?: string;
    paciente?: Paciente;
    avaliacao?: Avaliacao;

    static fromJson(jsonData: any): Agenda{ 
        return Object.assign(new Agenda(), jsonData); 
    } 
}

