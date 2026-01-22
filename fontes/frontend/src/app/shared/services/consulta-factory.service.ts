import { Injectable, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs';
import { IConsultaPageStructure } from '../models/consulta.model';
import { ConsultaGeneratorService } from './consulta-generator.service';
import { DefaultConsultaComponent } from '../components/default-consulta/default-consulta.component';

@Injectable({
  providedIn: 'root'
})
export class ConsultaFactoryService {

  constructor(
    public consultaGenerator: ConsultaGeneratorService,
  ) {
  }

  /**
   * Criará a lista
   * @param target Referencia no HTML de onde será criado o componente da lista
   * @param JSONURL Caminho que se encontra o JSON que orienta na criação do componente
   */
  createList(target: ViewContainerRef, JSONURL: string, query?: string) {

    this.consultaGenerator.getJSONFromDicionario(JSONURL).pipe(take(1)).subscribe((pageData: IConsultaPageStructure) => {

      if (pageData == null) console.warn("Dados de criação de pagina não obtidos");
      if (target == null) console.warn("Target não instanciada");
      const createdComponent = target.createComponent(DefaultConsultaComponent).instance;
      createdComponent.target = target;
      createdComponent.name = pageData.config.name;
      createdComponent.descricao = pageData.config.descricao;
      createdComponent.apiUrl = pageData.config.apiUrl;
      createdComponent.parameters = pageData.parameters;
      createdComponent.return = pageData.return;
      createdComponent.className = pageData.config.name;
      createdComponent.query = query;
      createdComponent.isAbleToExportOnDocument = pageData.config.isAbleToExportOnDocument;
    });
  }
}
