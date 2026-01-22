import { Injectable, ViewContainerRef } from '@angular/core';
import { catchError, Observable, of, take, tap, throwError } from 'rxjs';
import { DefaultListComponent } from '../components/default-list/default-list.component';
import { IPageStructure } from '../models/pageStructure';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ListFactoryService {

  private _pageData: Map<string, IPageStructure> = new Map();

  // JSONURL: string;

  constructor(private httpClient: HttpClient) {
    // this.JSONURL = JSONURL;
  }

  getPageDataByEntity(entityName: string): IPageStructure | null {
    return this._pageData.get(entityName) || null;
  }

  setPageDataForEntity(entityName: string, value: IPageStructure): void {
    this._pageData.set(entityName, value);
  }

  get allPageData(): Map<string, IPageStructure> {
    return this._pageData;
  }

  //Alteração futura de armazenar em memória
  getPageData(JSONURL?: string): Observable<IPageStructure> {

    // const cachedData = this._pageData.get(entityName);
    // if (cachedData) {
    //   console.log(`Dados da entidade '${entityName}' pegos na memória`);
    //   return of(cachedData);
    // }

    const url = JSONURL;
    return this.httpClient.get<IPageStructure>(url).pipe(
      tap(data => {
        // this._pageData.set(entityName, data);
        // console.log(`Dados da entidade '${entityName}' pegos do JSON`);
      }),
      catchError(error => {
        // console.warn(`Dados de criação de página para '${entityName}' não obtidos`, error);
        return throwError(() => error);
      })
    );
  }

  // Método adicional para limpar dados de uma entidade específica
  clearEntityData(entityName: string): void {
    this._pageData.delete(entityName);
  }

  // Método adicional para limpar todos os dados
  clearAllData(): void {
    this._pageData.clear();
  }

  /**
   * Criará a lista
   * @param target Referencia no HTML de onde será criado o componente da lista
   * @param JSONURL Caminho que se encontra o JSON que orienta na criação do componente
   */
  createList(target: ViewContainerRef, JSONURL: string, customFunction?: () => Promise<void>, customFunctionButtonIconName?: string) {

    this.httpClient.get<IPageStructure>(JSONURL).pipe(take(1)).subscribe({
      next: (pageData: IPageStructure) => {

        if (pageData == null) {
          console.warn("Dados de criação de pagina não obtidos");
        }

        if (target == null) {
          console.warn("Target não instanciada");
        }

        const createdComponent = target.createComponent(DefaultListComponent).instance;
        createdComponent.apiUrl = pageData.config.apiUrl;
        createdComponent.columnsQuantity = pageData.config.columnsQuantity;
        createdComponent.title = pageData.config.title;
        createdComponent.isAbleToCreate = pageData.config.isAbleToCreate;

        if(createdComponent.hasCustomFunctionButton == true){
          createdComponent.customFunction = customFunction;
          createdComponent.customFunctionButtonIconName = customFunctionButtonIconName;
        } else {
          createdComponent.customFunction = null;
          createdComponent.customFunctionButtonIconName = null;
        }

        //TODO criar estrutura para unificar esses
        createdComponent.displayedfieldsName = pageData.attributes.map(attribute => attribute.name);
        createdComponent.fieldsType = pageData.attributes.map(attribute => attribute.type);

        //TODO percorrer os atributos
        let attributeList = [];

        pageData.attributes.forEach((attribute) => {

          let childAttributes = [];

          if (attribute.properties) {
            //TODO percorrer as properties
            attribute.properties.forEach((attribute) => {
              childAttributes.push({ name: attribute.name, type: attribute.type });
            });
          }
          attributeList.push({ name: attribute.name, type: attribute.type, fieldList: childAttributes, className: attribute.className, fieldDisplayedInLabel: attribute.fieldDisplayedInLabel, optionList: attribute.optionList });

        });

        createdComponent.fields = attributeList;

        //TODO adicionar um campo novo que se for um do tipo objeto ele irá pegar os nomes 
        createdComponent.sortableFields = pageData.config.sortableFields;
        createdComponent.isSelectable = pageData.config.edit;
        createdComponent.selectedItemsLimit = null;
        createdComponent.searchableFields = pageData.config.searchableFields;
        createdComponent.className = pageData.config.name;
        createdComponent.dataToCreatePage = pageData;
        createdComponent.objectDisplayedValue = pageData.attributes.map(attribute => attribute.fieldDisplayedInLabel);
        createdComponent.route = pageData.config.route;
        createdComponent.visibleList = pageData.attributes.map(attribute => attribute.visibleList);
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
      }
    });

  }

  //TODO adicionar funçao de abrir com popup aqui?
}
