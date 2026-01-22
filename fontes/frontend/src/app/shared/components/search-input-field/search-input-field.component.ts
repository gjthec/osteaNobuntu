import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FilterParameters, FilterSearchParameters } from '../filter/base-resource-filter.component';
import { Subject } from 'rxjs';
import { SortOrderDialogComponent, SortField, SortOption } from '../sort-order-dialog/sort-order-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface ISearchableField {
  name: string,
  type: string
}

@Component({
  selector: 'search-input-field',
  templateUrl: './search-input-field.component.html',
  styleUrls: ['./search-input-field.component.scss']
})
export class SearchInputFieldComponent implements AfterViewInit, OnDestroy {
  /**
   * Nome da classe/entidade na qual os campos pertencem. Exemplo: Classe "Car".
   */
  @Input() className?: string;

  @Input() filterParameters: FilterParameters[];

  @Input() JSONURL?: string;
  /**
   * Campos disponíveis para ordenação
   */
  @Input() sortableFields: SortField[] = [];
  /**
  * Chamará a função responsável por mostrar os dados filtrados.
  */
  @Output() showDataFromFilter: EventEmitter<any> = new EventEmitter<any>();

  @Output() returnFetchParameters: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Evento emitido quando a ordenação for alterada
   */
  @Output() sortOrderChanged: EventEmitter<SortOption[] | null> = new EventEmitter<SortOption[] | null>();
  /**
   * Chamará a função responsável por limpar o campo de busca.
   */
  @Output() clearSearchInputEvent: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Campos pelo qual será realizada a busca no campo de buscas.
   */
  @Input() searchableFields: ISearchableField[] | null = null;
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();
  /**
   * Variável que indica se o filtro está sendo utilizado.
   */
  usingFilter: boolean = false;

  searchInputValue = new FormControl<string | null>(null);
  /**
   * Parâmetros de busca armazenados do filtro, caso o componente de filtro esteja sendo utilizado
   */
  filterSearchParameters: FilterSearchParameters = null;
  /**
   * Parâmetros de busca armazenados do componente atual (search-input-field) da sua ultima busca na API
   */
  searchParameters: FilterSearchParameters = null;
  /**
   * Ordenação atual aplicada
   */
  currentSortOrder: SortOption[] | null = null;

  constructor(
    private dialog: MatDialog,
  ) { }

  ngAfterViewInit(): void {
    this.sendParametersToFetch(this.searchInputValue, this.searchableFields);
  }

  sendParametersToFetch(searchInput: FormControl<string | null>, searchableFields: ISearchableField[]) {

    searchInput.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        debounceTime(500), // espera meio segundo após a última tecla
        distinctUntilChanged(),// só dispara se o valor mudar
      ).subscribe({
        next: (searchInputValue) => {
          const newSearchParameters = this.createSearchParameters(searchableFields, searchInputValue);
          this.searchParameters = newSearchParameters;
          this.usingFilter = newSearchParameters ? true : false;
          this.returnFetchParameters.emit(newSearchParameters);
        },
        error: (error) => {
          console.warn("Error to send input parameter to fetch.");
        },
      });

  }

  search(searchParameters: FilterSearchParameters) {
    this.filterSearchParameters = searchParameters;

    let _params;
    if (this.searchParameters == null) {
      _params = this.filterSearchParameters;
    } else {
      // _params = this.mergeSearchParameters(this.filterSearchParameters, this.searchParameters.parameters, this.searchParameters.conditions);
      _params = [this.filterSearchParameters, this.searchParameters];
    }
    
    this.usingFilter = true;
    this.returnFetchParameters.emit(_params);
  }

  createSearchParameters(searchableFields: ISearchableField[], searchInputValue: string): FilterSearchParameters {

    if(!searchInputValue){
      if(this.filterSearchParameters){
        return this.filterSearchParameters;
      } else {
        return null;
      }
    }
    
    //Caso queira fazer um botão que possibilite que as palavras sejam pesquisadas separadamente, só adicionar o parâmetro para esse searchOnSplitString
    let searchOnSplitString = false;
    let sentences: string[];
    if (searchOnSplitString) {
      sentences = this.splitStringIntoArray(searchInputValue);
    } else {
      sentences = [searchInputValue];
    }

    let newFilterSearchParameters: FilterSearchParameters = {
      parameters: {
        conditions: [],
        filterValues: []
      }
    };

    searchableFields.forEach((searchableField: ISearchableField) => {

      sentences.forEach((sentence, index) => {

        if (sentence != null) {
          index++;
          newFilterSearchParameters.parameters.filterValues.push({ filterParameter: { parameter: "contains", value: sentence }, variableInfo: { fieldName: searchableField.name, fieldType: searchableField.type } });

          if (index > 1) {
            newFilterSearchParameters.parameters.conditions.push("and");
          }
        }

      });

    });

    // if (newFilterSearchParameters.parameters.filterValues.length == 0
    // ) {
    //   return null;
    // };

    if(this.filterSearchParameters){
      newFilterSearchParameters.parameters.conditions.push(...this.filterSearchParameters.parameters.conditions);
      newFilterSearchParameters.parameters.filterValues.push(...this.filterSearchParameters.parameters.filterValues);
    }

    return newFilterSearchParameters;

  }

  splitStringIntoArray(sentence: string): string[] {
    const words: string[] = sentence.split(' ');

    // Filtering out empty words resulting from extra spaces
    const filteredWords: string[] = words.filter(word => word !== '');

    return filteredWords;
  }

  openSortOrderDialog() {
    if (this.sortableFields.length === 0) {
      console.warn("Nenhum campo de ordenação foi configurado");
      return;
    }

    const dialogRef = this.dialog.open(SortOrderDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        availableFields: this.sortableFields,
        currentSorts: this.currentSortOrder
      }
    });

    dialogRef.afterClosed().subscribe((result: SortOption[] | null) => {
      if (result !== undefined) {
        this.currentSortOrder = result;
        this.sortOrderChanged.emit(result);
      }
    });
  }

  clearSearchInput() {
    this.searchInputValue.setValue(null);
    this.filterSearchParameters = null;
    this.usingFilter = false;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

}