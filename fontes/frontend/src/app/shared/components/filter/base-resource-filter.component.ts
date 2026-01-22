import { Component, OnInit, Inject, Optional, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { FormMode } from './filter-form/filter-form.component';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { lastValueFrom, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';

/**
 * Parâmetros para uso do Filtro
 */
export interface FilterParameters {
  /**
   * Nome do campo que pode ser usado de filtro
   */
  fieldName: string;
  /**
   * Tipos dos campos
   */
  fieldType: string;
  /**
   * Nome da classe na qual da entidade pertence
   */
  className?: string;
  /**
   * Número limite de itens que podem ser selecionados
   */
  selectedItemsLimit?: number;
  /**
   * Caso o campo seja uma classe/entidade deverá saber o nome do campo dessa entidade que será apresentado. Exemplo: Se é uma entidade chamada Cliente, o campo "nome" é o que será apresentado, sendo o nome do cliente.
   */
  fieldDisplayedInLabel?: string;
  /**
   * Caso o type (tipo) do filtro seja um "selector", que permite selecionar uma opção. Esse campo armazenará um array com o nome das opções que podem ser selecionadas pelo usuário, para filtragem.
   */
  optionsToSelect?: string[];
}

export interface FilterSearchParameters {
  id?: number,
  name?: string,
  isPublic?: boolean,

  parameters: {
    conditions: string[],
    filterValues: FilterValue[],
  }
}

export interface FilterValue {
  filterParameter: {
    value: string,
    parameter: string
  },
  variableInfo: {
    fieldName: string,
    fieldType: string
  },
}

enum FilterTypes {
  filterNumberWithConditions,
  filterDate,
  filterTextWithConditions,
  filterBoolean,
  filterEntity,
  filterSelector
}

export interface SelectedFilter { //TODO change name to Filter
  index: number,
  // value: string,//TODO tirar esse no futuro
  filterParameters: FilterParameters,
  filterValues: any,
  selectedFilterOption: number,
  condition: FormControl<Condition>,
  filterComponentRef?: MatDialogRef<BaseResourceFilterComponent>
}

enum Condition {
  and = "and",
  or = "or"
}

@Component({
  selector: 'app-base-resource-filter',
  templateUrl: './base-resource-filter.component.html',
  styleUrls: ['./base-resource-filter.component.scss']
})
export class BaseResourceFilterComponent implements OnInit {
  /**
   * Indica se o componente apresenta a função para o usuário de realizar a pesquisa na API
   */
  @Input() isAbleToSearch: boolean = false;
  /**
   * Indica se o componente apresenta a função para o usuário de salvar registro dos parâmetros de busca com o filtro
   */
  @Input() isAbleToCreate: boolean = false;
  /**
   * Indica se o componente apresenta a função para o usuário de alterar registro dos parâmetros de busca com o filtro
   */
  @Input() isAbleToEdit: boolean = false;
  /**
   * Indica se o componente que permite adição de novos parâmetros para pesquisa
   */
  @Input() isAbleToAddSearchFilterParameter: boolean = true;
  /**
  * Nome da classe/entidade na qual os campos pertencem. Exemplo: Classe "Car".
  */
  @Input() className?: string;
  /**
   * Parâmetros do filtro que foram selecionados
   */
  selectedFilters: SelectedFilter[] = [];
  /**
   * Dados dos campos/variáveis da classe/entidade na qual podem ser selecionados para usados como parâmetros para a busca.
   */
  filterParameters: FilterParameters[];

  currentUri: string;

  JSONURL: string;

  @Input() selectedFilterSearchParameters: FilterSearchParameters;
  /**
   * Uri que serve para, quando é um filtro de entidade, ele possa ir pra pagina dessa entidade selecionar os itens de interesse
   */
  uriListPath?: string;

  filterSubmitFormEnabled: boolean = false;
  filterFormData;
  filterMode: FormMode = FormMode.edit;


  constructor(
    private dialogBaseResourceFilterComponentRef: MatDialogRef<BaseResourceFilterComponent>,
    private router: Router,
    private httpClient: HttpClient,
    // Componente para avisos
    private snackBar: MatSnackBar,
    // Tradução dos avisos
    private transloco: TranslocoService,
    @Optional() @Inject(DIALOG_DATA) private dialogData: { filterParameters: FilterParameters[], JSONURL: string, className: string, submitParametersToFetch: Function, isAbleToAddSearchFilterParameter?: boolean, isAbleToSearch?: boolean, selectedFilterSearchParameters: FilterSearchParameters, isAbleToCreate: boolean, isAbleToEdit: boolean }
  ) { }

  ngOnInit(): void {
    this.getDialogData();
  }

  getDialogData() {
    if (!this.dialogData) {
      return;
    }

    this.filterParameters = this.dialogData.filterParameters;
    this.JSONURL = this.dialogData.JSONURL;
    this.className = this.dialogData.className;
    this.isAbleToAddSearchFilterParameter = this.dialogData.isAbleToAddSearchFilterParameter;
    this.isAbleToSearch = this.dialogData.isAbleToSearch;
    this.selectedFilterSearchParameters = this.dialogData.selectedFilterSearchParameters;
    this.isAbleToCreate = this.dialogData.isAbleToCreate,
      this.isAbleToEdit = this.dialogData.isAbleToEdit;

    //Se o componente for aberto com parâmetros de filtragem na entrada ele irá carregar
    if (this.selectedFilterSearchParameters) {
      this.loadSearchFilterParameters(this.selectedFilterSearchParameters, this.className);
    }
  }

  addNewFilterParameter() {

    this.selectedFilters.push({
      index: this.selectedFilters.length + 1,
      filterParameters: this.filterParameters[0],
      selectedFilterOption: this.getFieldType(this.filterParameters[0].fieldType),
      condition: new FormControl<Condition>(Condition.and),
      filterValues: null,
      filterComponentRef: this.dialogBaseResourceFilterComponentRef
    });

  }

  removeFilter() {
    this.selectedFilters.pop();
  }

  onSelectedFieldChange(selectedFilterParameterName: string, _selectedFilter: number) {

    const filterModified = this.selectedFilters.find((selectedFilter) => selectedFilter.index === _selectedFilter);
    const newFilterSelected = this.filterParameters.find((filterParameter) => filterParameter.fieldName === selectedFilterParameterName);

    filterModified.selectedFilterOption = this.getFieldType(newFilterSelected.fieldType);
    filterModified.filterParameters = { ...newFilterSelected };

    if (newFilterSelected.fieldType == "entity" || newFilterSelected.fieldType == "foreignKey" || newFilterSelected.fieldType == "subform" || newFilterSelected.fieldType == "manyToOne") {
      filterModified.filterParameters.fieldType = "entity";
    }

  }

  getFieldType(fieldType: string): FilterTypes {

    if (fieldType == "string") {
      return FilterTypes.filterTextWithConditions;
    } else if (fieldType == "number") {
      return FilterTypes.filterNumberWithConditions;
    } else if (fieldType == "boolean") {
      return FilterTypes.filterBoolean;
    } else if (fieldType == "date") {
      return FilterTypes.filterDate;
    } else if (fieldType == "entity" || fieldType == "foreignKey" || fieldType == "subform" || fieldType == "manyToOne") {
      return FilterTypes.filterEntity;
    } else if (fieldType == "selector") {
      return FilterTypes.filterSelector;
    }

  }

  async getClassInfoFromJSON(classJSONPath: string): Promise<FilterParameters[]> {

    let pageStructure = await lastValueFrom(this.httpClient.get<IPageStructure>(classJSONPath));

    let filterParameters: FilterParameters[] = [];

    pageStructure.attributes.forEach(attribute => {
      filterParameters.push({
        fieldName: attribute.name,
        fieldType: attribute.type,
        className: attribute.className,
        fieldDisplayedInLabel: attribute.fieldDisplayedInLabel,
        optionsToSelect: attribute.optionList,
        selectedItemsLimit: attribute.selectItemsLimit
      });
    });

    return filterParameters;

  }

  async loadSearchFilterParameters(filterSearchParameters: FilterSearchParameters, className: string) {

    console.log("filterSearchParameters loaded: ", filterSearchParameters);
    let hasEmptyValue: boolean = false;
    this.selectedFilters = [];

    let conditionIndex: number = 0;

    const JSONURL = "../../../../assets/dicionario/" + className.charAt(0).toLowerCase() + className.slice(1) + ".json";

    const parameterEntityProperties = await this.getClassInfoFromJSON(JSONURL);

    filterSearchParameters.parameters.filterValues.forEach((filterValue) => {

      if(!filterValue.filterParameter.value){
        hasEmptyValue = true;
      }

      this.selectedFilters.push({
        index: this.selectedFilters.length + 1,
        filterParameters: {
          fieldName: filterValue.variableInfo.fieldName,
          fieldType: filterValue.variableInfo.fieldType,
          className: className,
          selectedItemsLimit: parameterEntityProperties.find(parameter => parameter.fieldName === filterValue.variableInfo.fieldName).selectedItemsLimit,
          fieldDisplayedInLabel: parameterEntityProperties.find(parameter => parameter.fieldName === filterValue.variableInfo.fieldName).fieldDisplayedInLabel,
          optionsToSelect: parameterEntityProperties.find(parameter => parameter.fieldName === filterValue.variableInfo.fieldName).optionsToSelect
        },
        selectedFilterOption: this.getFieldType(filterValue.variableInfo.fieldType),
        condition: new FormControl<Condition>(this.getCondition(filterSearchParameters.parameters.conditions[conditionIndex])),
        filterValues: filterValue.filterParameter,
        filterComponentRef: this.dialogBaseResourceFilterComponentRef
      });

      conditionIndex++;
    });

    const message = this.transloco.translate('componentsBase.snackbar.fillRequiredFields');
    const actionButtonMessage = this.transloco.translate('componentsBase.snackbar.close');

    if(hasEmptyValue){
      this.openSnackBarToAlert(message, actionButtonMessage);
    }

  }

  getCondition(value?: string): Condition {
    if (!value) {
      return Condition.and;
    }

    if (value === "and") {
      return Condition.and;
    } else if (value === "or") {
      return Condition.or;
    }
  }

  getAllSearchParameters(): FilterSearchParameters | null {
    let searchParameters: FilterSearchParameters = {
      parameters: {
        conditions: [],
        filterValues: []
      }
    };

    this.selectedFilters.forEach((filter, index) => {

      if (filter.filterValues != null) {
        const filterValue = {
          filterParameter: {
            parameter: filter.filterValues.parameter,
            value: filter.filterValues.value
          },
          variableInfo: {
            fieldName: filter.filterParameters.fieldName,
            fieldType: filter.filterParameters.fieldType
          }
        };

        searchParameters.parameters.filterValues.push(filterValue);

        if (index < this.selectedFilters.length) {
          searchParameters.parameters.conditions.push(filter.condition.value);
        }
      }

    });

    if (searchParameters.parameters.filterValues.length === 0) {
      return null;
    }

    return searchParameters;
  }

  applyFilters() {
    this.closeThisDialog();

    this.dialogData.submitParametersToFetch(this.getAllSearchParameters());
  }

  getChildData(filterIndex: number, newItem: any) {
    let filter = this.selectedFilters.find((filter) => filter.index == filterIndex);
    filter.filterValues = newItem;
  }

  closeThisDialog() {
    this.dialogBaseResourceFilterComponentRef.close(this.getAllSearchParameters());
  }

  openDialogToSubmitFilterParameters() {

    if (this.selectedFilterSearchParameters) {
      this.filterMode = FormMode.edit;
    } else {
      this.filterMode = FormMode.save;
    }

    this.filterFormData = { id: this.selectedFilterSearchParameters?.id ?? undefined, name: this.selectedFilterSearchParameters?.name ?? undefined, isPublic: this.selectedFilterSearchParameters?.isPublic ?? undefined, parameters: this.getAllSearchParameters().parameters, className: this.className, formMode: this.filterMode };
    this.filterSubmitFormEnabled = true;

  }

  async copyPageUrlWithFilterSearchParameterId() {

    if (this.isAbleToCreate == true) {
      return null;
    }

    if (this.isAbleToEdit == false) {
      return null;
    }

    const actionButtonMessage = this.transloco.translate('componentsBase.snackbar.close');

    try {
      const url = this.router.url;
      const pathOnly = url.split('?')[0].split('#')[0]; // remove query e hash

      await navigator.clipboard.writeText(environment.frontendUrl + pathOnly + "?filterSearchParameterId=" + this.selectedFilterSearchParameters.id);

      const message = this.transloco.translate('componentsBase.snackbar.linkCopiedSuccess');
      this.openSnackBarToAlert(message, actionButtonMessage);
    } catch {
      const message = this.transloco.translate('componentsBase.snackbar.linkCopyFailed');
      this.openSnackBarToAlert(message, actionButtonMessage);
    }
  }

  returnToLastPage(filterSubmitFormEnabled: boolean) {
    this.filterSubmitFormEnabled = filterSubmitFormEnabled;
  }

  openSnackBarToAlert(message: string, actionButtonMessage: string) {

    this.snackBar.open(message, actionButtonMessage, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      // panelClass: ['snackbar-copy'] // opcional: classe para estilo
    });
  }

}
