import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { BaseResourceFilterComponent, FilterParameters, FilterSearchParameters } from '../base-resource-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { FilterService } from '../filter.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Subscription, take } from 'rxjs';
import { DefaultListComponent, IDefaultListComponentDialogConfig } from '../../default-list/default-list.component';
import { LoadingDialogComponent } from '../../loading-dialog/loading-dialog.component';
import { IPageStructure } from 'app/shared/models/pageStructure';

@Component({
  selector: 'filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrl: './filter-menu.component.scss'
})
export class FilterMenuComponent implements AfterViewInit,OnDestroy {
  /**
  * Nome da classe/entidade na qual os campos pertencem. Exemplo: Classe "Car".
  */
  @Input() className?: string;
  @Input() filterParameters: FilterParameters[];
  @Input() JSONURL?: string;
  /**
   * Parâmetros de busca armazenados do filtro, caso o componente de filtro esteja sendo utilizado
   */
  filterSearchParameters: FilterSearchParameters[] = [];
  private subscription?: Subscription;
  /**
   * Parâmetros de busca armazenados do componente atual (search-input-field) da sua ultima busca na API
   */
  searchParameters: FilterSearchParameters = null;
  /**
   * Parâmetros para busca que serão enviados para o componente pai
   */
  @Output() returnFetchParameters: EventEmitter<any> = new EventEmitter<any>();

  isLoading: boolean = false;

  @ViewChild(MatMenu) menu!: MatMenu;

  constructor(
    private matDialog: MatDialog,
    private filterService: FilterService,
    private httpClient: HttpClient
  ) {
  }
  
  ngAfterViewInit(): void {
    this.getPublicFilterParameterList();
  }

  getPublicFilterParameterList() {

    this.subscription = this.filterService.filters$.subscribe(data => {
      this.filterSearchParameters = data ?? [];
    });

    this.filterService.fetchSearchFilterParameterList(this.className);
  }

  openFilter(isAbleToAddSearchFilterParameter: boolean = true, isAbleToSearch: boolean = true, isAbleToCreate: boolean = false, isAbleToEdit: boolean = false, selectedFilterSearchParameters?: FilterSearchParameters) {

    if (this.filterParameters.length == 0) {
      console.error("Data do open component missing.");
      return;
    }

    const dialogRef = this.matDialog.open(BaseResourceFilterComponent, {
      height: '80vh',
      width: '80vw',
      data: {
        filterParameters: this.filterParameters,
        JSONURL: this.JSONURL,
        className: this.className,
        isAbleToAddSearchFilterParameter: isAbleToAddSearchFilterParameter,
        isAbleToSearch: isAbleToSearch,
        selectedFilterSearchParameters: selectedFilterSearchParameters,
        isAbleToCreate: isAbleToCreate,
        isAbleToEdit: isAbleToEdit,

        submitParametersToFetch: (params: FilterSearchParameters) => {
          this.returnFetchParameters.emit(params);
        }
      }
    });

    dialogRef.disableClose = true;

  }

  openDefaultListToSelectFilterParameter() {

    const defaultJSONPath: string = environment.defaultJSONPath;
    const classJSONPath: string = defaultJSONPath + "filterSearchParameter.json";

    const loadingDialogRef = this.matDialog.open(LoadingDialogComponent, {
      maxHeight: "95vh",
      minHeight: "80vh",
      maxWidth: "95vw",
      minWidth: "80vw",
    });

    this.httpClient.get<IPageStructure>(classJSONPath).pipe(take(1)).subscribe({
      next: (pageStructure: IPageStructure) => {

        let attributeList = [];

        pageStructure.attributes.forEach((attribute) => {
          let childAttributes = [];
          attributeList.push({ name: attribute.name, type: attribute.type, fieldList: childAttributes, className: attribute.className, fieldDisplayedInLabel: attribute.fieldDisplayedInLabel });

        });

        const config: IDefaultListComponentDialogConfig = {
          itemsDisplayed: [],
          columnsQuantity: 1,
          //TODO remover esses dois
          displayedfieldsName: pageStructure.attributes.map(attribute => attribute.name),
          fieldsType: pageStructure.attributes.map(attribute => attribute.type),

          fields: attributeList,
          objectDisplayedValue: pageStructure.attributes.map(attribute => attribute.fieldDisplayedInLabel),
          userConfig: null,
          selectedItemsLimit: 1,
          apiUrl: pageStructure.config.apiUrl,
          apiUrlToRead: pageStructure.config.apiUrl + "?className=" + this.className,
          searchableFields: pageStructure.config.searchableFields,
          isSelectable: true,
          className: this.className,
          isAbleToCreate: false,
          isAbleToEdit: false,
          isAbleToDelete: false,
          dataToCreatePage: pageStructure,//TODO arrumar isso
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
        loadingDialogRef.close();

        dialogRef.afterClosed().pipe(take(1)).subscribe(selectedFilterSearchParameter => {

          this.openFilter(true, false, false, true, selectedFilterSearchParameter[0]);

        });

        dialogRef.disableClose = true;

      },
      error(error: any) {
        console.log(error);
      },
    });

  }

  search(filterSearchParameters: FilterSearchParameters) {

    let haveEmptyParameter: boolean;

    try {

      filterSearchParameters.parameters.filterValues.forEach((filterValue) => {
        const valueToSearch = filterValue.filterParameter.value;

        if (valueToSearch == null || valueToSearch == undefined || valueToSearch == "") {
          haveEmptyParameter = true;
        }
      });

      if (haveEmptyParameter == true) {
        this.openFilter(false, true, false, false, filterSearchParameters);
      } else {
        this.returnFetchParameters.emit(filterSearchParameters);
      }
    } catch (error) {
      console.error("Invalid search parameter.");
    }

  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
