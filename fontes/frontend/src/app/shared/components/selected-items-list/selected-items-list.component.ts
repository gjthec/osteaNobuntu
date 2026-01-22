import { AfterViewInit, Component, EventEmitter, Inject, Injector, Input, OnDestroy, Optional, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DefaultListComponent, IDefaultListComponentDialogConfig } from '../default-list/default-list.component';
import { SelectableCardComponent } from '../selectable-card/selectable-card.component';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';
import { DefaultCardComponent } from '../default-card/default-card.component';
import { DinamicBaseResourceFormComponent, IDinamicBaseResourceFormComponent } from '../dinamic-base-resource-form/dinamic-base-resource-form.component';
import { HttpClient } from '@angular/common/http';
import { ISearchableField } from '../search-input-field/search-input-field.component';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { FilterParameters } from '../filter/base-resource-filter.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-selected-items-list',
  templateUrl: './selected-items-list.component.html',
  styleUrls: ['./selected-items-list.component.scss']
})
export class SelectedItemsListComponent implements AfterViewInit, OnDestroy {
  /**
   * Campo com os dados dos itens que serÃo apresenados na lista.
   * @example ['nome':'Maria', 'idade':'44'].
   */
  @Input() itemsDisplayed: any[] = [];
  /**
   * Quantidade de colunas que tenha cada Card da lista.
   * @example "3"
   * Por padrão quando se está em dispositivos móveis a quantidade de colunas será 1.
   */
  @Input() columnsQuantity!: number;
  /**
   * Nomes dos campos que serão apresentados.
   * @example ['nome', 'idade'].
   */
  @Input() displayedfieldsName!: string[] | null;

  filterParameters?: FilterParameters[];
  /**
   * Tipos das variáveis da classe.
   * @example ['string', 'number'].
   */
  @Input() fieldsType!: string[];
  @Input() userConfig: any;
  /**
   * Essa lista será uma lista que tu seleciona os itens?
   * @example true;
   */
  @Input() isSelectable: boolean = true;
  /**
   * Valor máximo de itens que podem ser selecionados.
   * @example 2.\
   * Exemplo permitir selecionar tudo: null.
   */
  @Input() selectedItemsLimit: number = null;
  /**
   * Campo que saída para os valores que foram selecionados.
   */
  @Output() eventSelectedValues = new EventEmitter<any[]>();
  /**
   * Link completo no qual é capaz de obter as instâncias dessa classe no banco de dados.\
   * @example https://siteDoProgramador.com/api/carros
   */
  @Input() apiUrl!: string;
  /**
   * Campos pelo qual será realizada a busca no campo de buscas.\
   * @example ['name','phone'].
   */
  @Input() searchableFields: ISearchableField[] | null = null;
  /**
  * Número máximo de itens que serão renderizados na lista.\
  * @example 3
  */
  @Input() maxDisplayedItems: number = 25;
  /**
   * Nome da classe na qual o formulário pertence
   */
  @Input() className!: string;
  /**
   * Indica se a lista terá botão que direcionará para criação de novos itens.
   * @example "true" ou "false"
   */
  @Input() isAbleToCreate: boolean = true;
  /**
   * Indica que cada card da lista terá um botão que direcionará para editar cada item.
   * @example "true" ou "false"
   */
  @Input() isAbleToEdit: boolean = true;
  /**
   * Indica que cada item da lista poderá ser removido.
   * @example "true" ou "false"
   */
  @Input() isAbleToDelete: boolean = true;
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();

  /**
   * Itens da lista selecionados
   * @example [{'id':'1', 'nome':'aba'}, {'id':'2', 'nome':'Carlos'}]
   */
  selectedItems: any[] = [];
  /**
   * Lista com os componentes que estão sendo renderizados na lista.
   */
  private componentsCreatedList: any[] = [];
  /**
   * Estado do checkBox que seleciona todos os itens da lista.
   */
  selectAllCheckBox: boolean = false;
  /**
   * Estado que informa se o componente atual foi aberto por meio de um Dialog.
   * @example "true" ou "false"
   */
  isOpenedOnDialog: boolean = false;
  /**
   * JSONPath localização de onde se encontra o JSON que orienta na criação das paginas.
   */
  @Input() dataToCreatePage: IPageStructure;

  @ViewChild('placeToRender', { read: ViewContainerRef }) target!: ViewContainerRef;

  protected router: Router;
  private translocoService: TranslocoService;
  private matDialog: MatDialog;
  private httpClient: HttpClient;

  constructor(
    protected injector: Injector,
    private matSnackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogInjectorData: IDefaultListComponentDialogConfig,
    @Optional() private matDialogComponentRef: MatDialogRef<DefaultListComponent>,
  ) {

    this.router = this.injector.get(Router);
    this.translocoService = this.injector.get(TranslocoService);
    this.matDialog = this.injector.get(MatDialog);
    this.httpClient = this.injector.get(HttpClient);

    if (matDialogComponentRef != null) {
      this.isOpenedOnDialog = true;
    }

    if (dialogInjectorData != null) {

      this.itemsDisplayed = dialogInjectorData.itemsDisplayed;
      this.columnsQuantity = dialogInjectorData.columnsQuantity;
      this.displayedfieldsName = dialogInjectorData.displayedfieldsName;
      this.fieldsType = dialogInjectorData.fieldsType;
      this.userConfig = dialogInjectorData.userConfig;
      this.searchableFields = dialogInjectorData.searchableFields;
      if (dialogInjectorData.selectedItemsLimit >= 0) {
        this.selectedItemsLimit = dialogInjectorData.selectedItemsLimit;
      }
      this.apiUrl = dialogInjectorData.apiUrl;
      this.isSelectable = dialogInjectorData.isSelectable;
      this.className = dialogInjectorData.className;
      this.isAbleToCreate = dialogInjectorData.isAbleToCreate;
      this.isAbleToEdit = dialogInjectorData.isAbleToEdit;
      this.dataToCreatePage = dialogInjectorData.dataToCreatePage;
    }

  }

  ngAfterViewInit(): void {

    this.filterParameters = [];
    for (let index = 0; index < this.itemsDisplayed.length; index++) {
      this.filterParameters.push({fieldName: this.itemsDisplayed[index], fieldType: this.fieldsType[index]});
    }

    setTimeout(()=>{
      this.getData();
    },0);
  }

  getData() {
    if (this.itemsDisplayed == null) return;
    if (this.itemsDisplayed.length == 0) return;

    if (this.maxDisplayedItems > this.itemsDisplayed.length) this.maxDisplayedItems = this.itemsDisplayed.length;

    const itemsToDisplay = this.itemsDisplayed.slice(0, this.maxDisplayedItems);

    this.createItemsOnList(itemsToDisplay);
  }

  /**
   * Realizará a requisição dos itens que foram selecionados para atualizar de acordo com as edições feitas.
   */
  refreshData(){
    let refreshedItems = [];

    this.itemsDisplayed.forEach((item) =>{
      this.httpClient.get(item.id).pipe(take(1)).subscribe({
        next: (data) => refreshedItems.push(data),
        error: (error) => this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.readErrorMessage"), 'OK', { duration: 3000 }),
      });
    });

    this.itemsDisplayed = refreshedItems;
  }

  select() {
    this.eventSelectedValues.emit(this.selectedItems);
    this.closeMatDialog(this.selectedItems);
  }

  cancel() {
    this.eventSelectedValues.emit(null);
    this.closeMatDialog(null);
  }

  closeMatDialog(selectedItems: any[]) {
    if (this.matDialogComponentRef != null) {
      this.matDialogComponentRef.close(selectedItems);
    }

  }

  createItemsOnList(itemsDisplayed: any[]) {
    this.componentsCreatedList = [];
    this.removeAllComponentsOnView();

    for (let index = 0; index < itemsDisplayed.length; index++) {

      let componentCreated;
      if (this.isSelectable == true) {
        componentCreated = this.target.createComponent(SelectableCardComponent).instance;
      } else {
        componentCreated = this.target.createComponent(DefaultCardComponent).instance;
      }

      this.componentsCreatedList.push(componentCreated);

      componentCreated.columnsQuantity = this.columnsQuantity;
      componentCreated.userConfig = this.userConfig;
      componentCreated.itemDisplayed = itemsDisplayed[index];

      componentCreated.displayedfieldsName = this.displayedfieldsName;
      componentCreated.fieldsType = this.fieldsType;
      componentCreated.className = this.className;

      if (this.isSelectable == true) {
        this.selectableFieldController(componentCreated);
        componentCreated.isEditable = this.isAbleToEdit;
        componentCreated.eventClickToEdit.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => { this.openFormDialogToEditItem(data) });
      } else {
        componentCreated.eventClick.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => { this.openFormDialogToEditItem(data) });
      }
    }

  }

  selectableFieldController(componentCreated: SelectableCardComponent) {
    if (this.selectedItemsLimit == null) {
      this.selectedItemsLimit = this.itemsDisplayed.length;
    }

    if (this.selectedItemsLimit == 1) {
      componentCreated.isCheckBox = false;
    } else {
      componentCreated.isCheckBox = true;
    }

    componentCreated.eventOnSelect.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.checkItem(this.selectedItemsLimit, componentCreated, data);
    });
  }

  checkItem(selectedItemsLimit: number, componentCreated: SelectableCardComponent, data) {
    const dataIsSelected: boolean = this.selectedItems.some(item => item === data);

    if (this.selectedItems.length == this.itemsDisplayed.length - 1) {
      this.selectAllCheckBox = true;
    }

    if (dataIsSelected == false) {

      if (selectedItemsLimit != null) {
        if (this.selectedItems.length < selectedItemsLimit) {
          this.selectedItems.push(data);
          componentCreated.isSelected = true;
        }
      } else {
        this.selectedItems.push(data);
        componentCreated.isSelected = true;
      }

    } else {
      if (this.selectAllCheckBox == true) {
        this.selectAllCheckBox = false;
      }
      this.selectedItems = this.selectedItems.filter(item => item !== data);
      componentCreated.isSelected = false;
    }
  }

  handlePageEvent($event) {

    let firstlItemToDisplayIndex: number = $event.pageIndex * $event.pageSize;//0
    let lastItemToDisplayIndex: number = firstlItemToDisplayIndex + $event.pageSize;//10 + 25 = 35

    if (lastItemToDisplayIndex > this.itemsDisplayed.length) lastItemToDisplayIndex = this.itemsDisplayed.length;

    const itemsToDisplay = this.itemsDisplayed.slice(firstlItemToDisplayIndex, lastItemToDisplayIndex);
    this.createItemsOnList(itemsToDisplay);

    //Regra para após de instanciar os cards pra nova pagina, verifique se os cards foram selecionados, para marcar eles
    if (this.isSelectable == true) {
      itemsToDisplay.forEach((item, index) => {
        const dataIsSelected: boolean = this.selectedItems.some(_item => _item === item);
        if (dataIsSelected == true) {
          this.componentsCreatedList[index].isSelected = true;
        }
      });
    }
  }

  removeAllComponentsOnView() {
    if (this.target == null) console.warn("target é null");
    this.target.clear();
  }

  /**
   * 
   * @param data 
   */
  goToEditPage(data) {
    const apiUrlSegments = this.apiUrl.split("/");
    this.router.navigate([apiUrlSegments[apiUrlSegments.length - 1] + "/" + data.id + "/edit"]);
  }

  onSelectedItemsCheckBoxChange(event) {
    this.selectAllCheckBox = event.checked;
    if (event.checked == true) {
      this.selectAllItems();
    } else {
      this.unSelectAllItems();
    }
  }

  selectAllItems() {
    this.selectedItems = this.itemsDisplayed;
    this.checkAllItems();
  }

  unSelectAllItems() {
    this.selectedItems = [];
    this.unCheckAllItems();
  }

  checkAllItems() {
    if (this.componentsCreatedList == null) return;

    this.componentsCreatedList.forEach(component => {
      component.isSelected = true;
    })
  }

  unCheckAllItems() {
    if (this.componentsCreatedList == null) return;

    this.componentsCreatedList.forEach(component => {
      component.isSelected = false;
    })
  }

  /**
   * Destrói as instâncias no momento que o componente foi eliminado
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  /**
   * Função que removerá os itens selecionados da lista e atualizará os itens da lista.
   * @returns retorna os itens restantes após a remoção.
   */
  deselectItens(): any[] {

    //Eu tenho que fazer alguma forma de ele pegar a apiUrl e os IDs dos itens que estão na lista e foram selecionados para remover todos

    if (this.selectedItems.length <= 0) {
      return;
    }

    let remainingItems = this.itemsDisplayed.filter(item => !this.selectedItems.includes(item));

    this.selectedItems = [];

    this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.deselectMessage"), 'OK', { duration: 3000 });

    this.itemsDisplayed = remainingItems;
    this.createItemsOnList(this.itemsDisplayed);

    return remainingItems;
  }

  return() {
    if (this.matDialogComponentRef == null) return;

    this.matDialogComponentRef.close(this.itemsDisplayed);
  }

  /**
   * Abre um dialog com um formuário que permite a edição do item;
   * @param data Dados do item a ser criado ou editado. Se for null ele só criará.
   */
  openFormDialogToEditItem(data?) {
    const config : IDinamicBaseResourceFormComponent = {
      dataToCreatePage: this.dataToCreatePage,
      className: this.className,
      currentAction: "edit",
      itemId: data.id,
    }

    const dialogRef = this.matDialog.open(DinamicBaseResourceFormComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: config

    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(item => {
      if (item == null) return;

      this.refreshData();
    });

  }

}
