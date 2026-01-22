import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectedFilter } from '../base-resource-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { DefaultListComponent, IDefaultListComponentDialogConfig } from '../../default-list/default-list.component';
import { lastValueFrom, take } from 'rxjs';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { FormGeneratorService } from 'app/shared/services/form-generator.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'filter-entity',
  templateUrl: './filter-entity.component.html',
  styleUrls: ['./filter-entity.component.scss'],
})
export class FilterEntityComponent implements OnInit {
  /**
   * Dados de parâmetros do filtro que já foram preenchidos pelo usuário
   */
  @Input() selectedFilterData: SelectedFilter;
  label: string = "Select entities";
  /**
   * Todos os dados dos itens selecionados
   */
  selectedValues: JSON[] = [];
  /**
   * Dados que serão apresentados na tela dos itens selecionados
   */
  selectedValuesDisplayed: FormControl<string> = new FormControl<string>('');

  /**
   * Irá emitir um sinal para o componente pai, enviando dados ligados a qual valor e parâmetro da busca deverá ser utilizados
   */
  @Output() newEntityEvent = new EventEmitter<{ parameter: string, value: string[] }>();

  constructor(
    private matDialog: MatDialog,
    private httpClient: HttpClient,
    private formGenerator: FormGeneratorService
  ) { }

  ngOnInit(): void {
    this.loadValues(this.selectedFilterData);
  }

  async loadValues(selectedFilterData: SelectedFilter) {
    if (!selectedFilterData) {
      return;
    }

    if (selectedFilterData.filterValues) {

      if (!selectedFilterData.filterValues.value || selectedFilterData.filterValues.value.length == 0) {
        this.markInvalid();
        return;
      }

      for (let idListIndex = 0; idListIndex < selectedFilterData.filterValues.value.length; idListIndex++) {
        const filterValue = selectedFilterData.filterValues.value[idListIndex];
        const data = await this.fetchByIdList(selectedFilterData.filterValues.value[idListIndex], selectedFilterData.filterParameters.fieldName);
        this.selectedValues.push(data as JSON);
      }
      
      const resultItemNameList: string[] = this.selectedValues.map((_result) => _result[selectedFilterData.filterParameters.fieldDisplayedInLabel]);
      this.selectedValuesDisplayed.setValue(resultItemNameList.join(', '));

    }
  }

  async fetchByIdList(id: number, className: string): Promise<JSON> {
    try {
      return lastValueFrom(this.httpClient.get<JSON>(environment.backendUrl + "/api/" + className.toLowerCase() + "/" + id));
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  openDefaultListToSelectItems(className: string, selectedItemsLimit: number, fieldNameToShowOnDisplay: string) {
    const JSONURL = "../../../../assets/dicionario/" + className.charAt(0).toLowerCase() + className.slice(1) + ".json"
    let attributeList = [];

    this.formGenerator.getJSONFromDicionario(JSONURL).pipe(take(1)).subscribe({
      next: (pageData: IPageStructure) => {
        if (pageData == null) {
          console.warn("Dados de criação de pagina não obtidos");
        }

        const config: IDefaultListComponentDialogConfig = {
          itemsDisplayed: [],
          columnsQuantity: 3,

          //TODO remover esses dois
          displayedfieldsName: pageData.attributes.map(attribute => attribute.name),
          fieldsType: pageData.attributes.map(attribute => attribute.type),

          fields: attributeList,

          objectDisplayedValue: pageData.attributes.map(attribute => attribute.fieldDisplayedInLabel),//{propertiesAttributes: param.properties, apiUrl: param.apiUrl},
          userConfig: null,
          selectedItemsLimit: selectedItemsLimit,
          apiUrl: pageData.config.apiUrl,
          searchableFields: [],
          isSelectable: true,
          className: pageData.config.name,//É fieldName pois aqui será editado a campo que está na classe do ClasNa
          isAbleToCreate: false,
          isAbleToEdit: false,
          isAbleToDelete: false,
          dataToCreatePage: pageData,
          useFormOnDialog: true,
          isEnabledToGetDataFromAPI: true,

          //TODO arrumar isso
          hasCustomFunctionButton: false,
          customFunction: null,
          customFunctionButtonIconName: null
        }

        const dialogRef = this.matDialog.open(DefaultListComponent, {
          maxHeight: "95vh", // Altura máxima de 90% da tela
          minHeight: "80vh",
          maxWidth: "95vw",
          minWidth: "80vw",
          data: config,
        });

        dialogRef.afterClosed().pipe(take(1)).subscribe(result => {

          this.selectedValues = result;
          const resultItemNameList: string[] = result.map((_result) => _result[fieldNameToShowOnDisplay]);
          this.selectedValuesDisplayed.setValue(resultItemNameList.join(', '));

          //TODO tem que verificar se os campos tem ID mesmo, pois pode dar problemas
          this.newEntityEvent.emit({ parameter: "in", value: this.selectedValues.map((value) => value["id"]) });
        });

        dialogRef.disableClose = true;
      },
    });

  }

  /**
   * Deixa o campo de inserção de dados do Formulário marcado como errado
   */
  markInvalid() {
    console.log("chamada no entity");
    this.selectedValuesDisplayed.markAsTouched();
    this.selectedValuesDisplayed.updateValueAndValidity();
  }

  removeSelectedItems() {
    this.selectedValues = [];
    this.newEntityEvent.emit({ parameter: "in", value: null });
    this.selectedValuesDisplayed.setValue('');
  }
}
