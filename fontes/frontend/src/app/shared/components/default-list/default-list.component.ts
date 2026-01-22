import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { SelectableCardComponent } from '../selectable-card/selectable-card.component';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { DefaultCardComponent } from '../default-card/default-card.component';
import { TranslocoService } from '@ngneat/transloco';
import {
  ConfirmationDialogComponent,
  IConfirmationDialog,
} from '../confirmation-dialog/confirmation-dialog.component';
import {
  DinamicBaseResourceFormComponent,
  IDinamicBaseResourceFormComponent,
} from '../dinamic-base-resource-form/dinamic-base-resource-form.component';
import { environment } from 'environments/environment';
import { ISearchableField } from '../search-input-field/search-input-field.component';
import { IPageStructure, ITitle } from 'app/shared/models/pageStructure';
import { ViewMode, ViewToggleService } from 'app/shared/components/default-list/view-mode-selector/view-toggle.service';
import { TitleService } from 'app/shared/services/title.service';
import { Location } from '@angular/common';
import { SelectableListItemComponent } from '../selectable-list-item/selectable-list-item.component';
import { FilterParameters, FilterSearchParameters } from '../filter/base-resource-filter.component';
import { FilterService } from '../filter/filter.service';
import { SortField, SortOption } from '../sort-order-dialog/sort-order-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface IFieldProperty {
  /**
   * Nomes dos campos que serão apresentados.
   * @example ['nome', 'idade'].
   */
  name: string;
  /**
   * Tipos das variáveis da classe.
   * @example ['string', 'number'].
   */
  type: string;
  fieldList: IFieldProperty[];
  className?: string;
  fieldDisplayedInLabel: string;
  /**
   * Caso o attribute/atributo/campo da classe/variável seja um campo selecionável (opções fixas). Esse campo armazenará os nomes das opções disponívels para seleção.
   */
  optionList?: any[];
}

export interface IDefaultListComponentDialogConfig {
  /**
   * Campo com os dados dos itens que serÃo apresenados na lista.
   * @example ['nome':'Maria', 'idade':'44'].
   */
  itemsDisplayed: any;
  /**
   * Quantidade de colunas que tenha cada Card da lista.
   * @example "3"
   * Por padrão quando se está em dispositivos móveis a quantidade de colunas será 1.
   */
  columnsQuantity: number;

  fields: IFieldProperty[];

  filterParameters?: FilterParameters[];

  /**
   * Nomes dos campos que serão apresentados.
   * @example ['nome', 'idade'].
   */
  displayedfieldsName: string[];
  /**
   * Tipos das variáveis da classe.
   * @example ['string', 'number'].
   */
  fieldsType: string[];
  /**
   * Caso o conter um campo do tipo objeto, será o nome do campo que está dentro do que será exibido.
   * [Exemplo]: O campo tem um objeto, esse objeto tem "id", "name" e "age". O campo apresentado poderá ser o "name", assim aparecerá o valor do campo "name" no componente.
   * @example ['', '', 'id']
   */
  objectDisplayedValue: string[];
  userConfig: any;
  /**
   * Limite de itens que podem ser selecionados na lista
   */
  selectedItemsLimit: number;
  /**
   * Link no qual é utilizado para requisições para API.
   * @example "api/carros"
   */
  apiUrl: string;

  /**
   * Url no qual é utilizado para requisições na API na qual envolve a rota de leitura de registros no banco de dados.
   * @example "api/carros"
   */
  apiUrlToRead?: string;

  /**
   * Campos pelo qual será realizada a busca no campo de buscas.\
   * @example ['name','phone'].
   */
  searchableFields: ISearchableField[] | null;
  /**
   * Essa lista será uma lista que tu seleciona os itens?
   * @example true;
   */
  isSelectable: boolean;
  /**
   * Nome da classe na qual o formulário pertence
   */
  className: string;
  /**
   * Indica se a lista terá botão que direcionará para criação de novos itens.
   * @example "true" ou "false"
   */
  isAbleToCreate: boolean;
  /**
   * Indica que cada card da lista terá um botão que direcionará para editar cada item.
   * @example "true" ou "false"
   */
  isAbleToEdit: boolean;
  /**
   * Indica que cada item da lista poderá ser removido.
   * @example "true" ou "false"
   */
  isAbleToDelete: boolean;
  /**
   * Dados que orienta na criação das paginas.
   */
  dataToCreatePage: IPageStructure;
  /**
   * Define se o formulários que serão abertos a partir dessa lista serão abertos por dialog ou indo na página
   */
  useFormOnDialog: boolean;
  /**
   * Define se a lista irá obter os dados da API para apresentar para o usuário.
   */
  isEnabledToGetDataFromAPI: boolean;
  /**
   * Indica se a lista terá um botão de ação
   */
  hasCustomFunctionButton: boolean;
  /**
   * Recebe uma função customizada
   */
  customFunction: () => Promise<void>;
  /**
   * Nome do identificador do icone para o botão de função customizada
   */
  customFunctionButtonIconName: string;

}

@Component({
  selector: 'default-list',
  templateUrl: './default-list.component.html',
  styleUrls: ['./default-list.component.scss'],
})
export class DefaultListComponent
  implements AfterViewInit, OnDestroy, IDefaultListComponentDialogConfig {
  private popStateListener: (event: PopStateEvent) => void;
  viewMode: string = 'list-layout'; // Definindo o modo padrão como 'list-layout'
  // viewMode: ViewMode = ViewMode.listLayout;
  @Input() currentView: string; // Valor padrão é 'card'
  @Input() itemsDisplayed: any[] = [];
  @Input() columnsQuantity = 3;

  @Input() fields: IFieldProperty[];
  filterParameters?: FilterParameters[];
  searchParameters: FilterSearchParameters;

  @Input() displayedfieldsName: string[] | null;
  @Input() fieldsType: string[];
  @Input() objectDisplayedValue: string[];
  @Input() userConfig: any;
  @Input() isSelectable: boolean = true;
  @Input() selectedItemsLimit: number | null = null;
  @Input() visibleList: boolean[] = [];
  @Input() sortableFields: SortField[] = [];
  /**
 * Campo com o titulo com as traduções que serão apresentadas no componente.
 */
  @Input() title: ITitle;
  /**
   * Campo que saída para os valores que foram selecionados.
   */
  @Output() eventSelectedValues = new EventEmitter<any[]>();
  @Input() apiUrl!: string;
  @Input() apiUrlToRead?: string;
  @Input() searchableFields: ISearchableField[] | null = null;
  /**
   * Número máximo de itens que serão renderizados na lista.\
   * @example 3
   */
  @Input() maxDisplayedItems: number = 25;
  @Input() className!: string;
  @Input() isAbleToCreate: boolean = true;
  @Input() isAbleToEdit: boolean = true;
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
  @Input() dataToCreatePage: IPageStructure;
  /**
   * Rota que levará para pagina da classe
   */
  @Input() route: string;
  @Input() isEnabledToGetDataFromAPI: boolean = true;
  /**
   * Define se o menu é fixado na tela
   */
  @Input() menuIsFixedOnScreen: boolean = true;
  @Input() useFormOnDialog: boolean = false;

  /**
   * Indica que a pagina está em carregamento
   */
  isLoading: boolean = true;
  /**
   * Quantidade total de itens existentes na busca
   */
  totalItems: number = 0;
  /**
   * Indicador da pagina atual
   */
  currentPageIndex: number = 1;
  /**
   * URL do arquivo JSON que orienta a criação da lista
   */
  JSONURL: string;
  /**
   * Indica se está sendo utilizado uma query de busca dados feita pelo filtro
   */
  filterEnabled: boolean = false;
  /**
   * Campo que armazena o texto de erro retornado da API
   */
  error?: string;

  hasCustomFunctionButton: boolean = false;

  @Input() customFunctionButtonIconName: string;

  @Input() customFunction: () => Promise<void>;

  @ViewChild('placeToRender', { read: ViewContainerRef })
  target!: ViewContainerRef;

  protected router: Router;
  private http: HttpClient;
  private translocoService: TranslocoService;
  private matDialog: MatDialog;


  constructor(
    protected injector: Injector,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public dialogInjectorData: IDefaultListComponentDialogConfig,
    @Optional()
    private matDialogComponentRef: MatDialogRef<DefaultListComponent>,
    private viewToggleService: ViewToggleService,
    private titleService: TitleService,
    private location: Location,
    private filterService: FilterService,
    private activatedRoute: ActivatedRoute,
    private matSnackBar: MatSnackBar
  ) {
    this.router = this.injector.get(Router);
    this.http = this.injector.get(HttpClient);
    this.translocoService = this.injector.get(TranslocoService);
    this.matDialog = this.injector.get(MatDialog);
    this.activatedRoute = this.injector.get(ActivatedRoute);

    if (matDialogComponentRef != null) {
      this.isOpenedOnDialog = true;
    }

    if (dialogInjectorData != null) {
      this.itemsDisplayed = dialogInjectorData.itemsDisplayed;
      this.columnsQuantity = dialogInjectorData.columnsQuantity;
      this.displayedfieldsName = dialogInjectorData.displayedfieldsName;
      this.fieldsType = dialogInjectorData.fieldsType;
      this.objectDisplayedValue = dialogInjectorData.objectDisplayedValue;
      this.userConfig = dialogInjectorData.userConfig;
      this.searchableFields = dialogInjectorData.searchableFields;
      if (dialogInjectorData.selectedItemsLimit >= 0) {
        this.selectedItemsLimit = dialogInjectorData.selectedItemsLimit;
      }
      this.apiUrl = dialogInjectorData.apiUrl;
      this.apiUrlToRead = dialogInjectorData.apiUrlToRead;
      this.isSelectable = dialogInjectorData.isSelectable;
      this.className = dialogInjectorData.className;
      this.isAbleToCreate = dialogInjectorData.isAbleToCreate;
      this.isAbleToEdit = dialogInjectorData.isAbleToEdit;
      this.isAbleToDelete = dialogInjectorData.isAbleToDelete;
      this.dataToCreatePage = dialogInjectorData.dataToCreatePage;
      this.useFormOnDialog = dialogInjectorData.useFormOnDialog;
      this.isEnabledToGetDataFromAPI =
        dialogInjectorData.isEnabledToGetDataFromAPI;
      this.fields = dialogInjectorData.fields;
      //TODO arrumar essa parte caso seja aberto como popup
      this.hasCustomFunctionButton = dialogInjectorData.hasCustomFunctionButton;
    }
  }

  ngAfterViewInit(): void {

    this.filterParameters = this.buildFilterParameters(this.fields);

    

    this.stayOnPageInCaseOfDialog();
    //Título da página
    this.changeTitle();

    this.onListViewModeChange();

    setTimeout(() => {
      if (this.isEnabledToGetDataFromAPI == true) {

        const filterSearchParameterQuery = this.getFilterSearchParameterInQuery();

        // Se encontrou o filterSearchParameter na query da pagina e não é aberto essa lista como dialog/popup
        if (filterSearchParameterQuery != null && !this.matDialogComponentRef) {
          this.getDataFromAPIUsingRegisteredCustomQuery(this.apiUrl, filterSearchParameterQuery);
        } else {
          this.getDataFromAPI(this.apiUrl);
        }

      } else {
        this.getData(this.itemsDisplayed);
      }
    }, 0);
  }

  /**
   * Obtem o campo 'filterSearchParameterId' na query da pagina
   * @returns Retorna o indentificador do registro FilterSearchParameter
   */
  getFilterSearchParameterInQuery(): number | null {
    const filterSearchParameterQuery = this.activatedRoute.snapshot.queryParamMap.get('filterSearchParameterId');
    // Validação/saneamento
    const filterSearchParameterId = filterSearchParameterQuery && filterSearchParameterQuery.trim() !== '' ? Number(filterSearchParameterQuery) : null;

    return filterSearchParameterId;
  }

  /**
   * Para o funcionamento de componentes como o do filtro de busca é necessário passar para o filtro de busca dados da classe/entidade para que possa ser contruído os parâmetros de busca para buscas personalizadas na API.
   * @param fields Dados dos campos da classe
   * @returns Retorna os dados de parâmetros para o uso no componente de filtro
   */
  buildFilterParameters(fields: IFieldProperty[]): FilterParameters[] {
    let filterParameters: FilterParameters[] = [];

    for (let index = 0; index < fields.length; index++) {

      if (fields && fields.length > 0) {
        filterParameters.push({ fieldName: fields[index].name, fieldType: fields[index].type, className: this.fields[index]?.className, fieldDisplayedInLabel: this.fields[index]?.fieldDisplayedInLabel, optionsToSelect: this.fields[index]?.optionList })
      } else {
        filterParameters.push({ fieldName: fields[index].name, fieldType: fields[index].type });
      }

    }

    return filterParameters;
  }

  /**
   * Fica ouvindo mudanças relacionadas ao modo de exibição dos dados na lista (cards ou list)
   */
  onListViewModeChange() {
    // Inscreve-se no serviço para ouvir as mudanças no modo de exibição
    this.viewToggleService.viewMode$.subscribe((mode: ViewMode) => {
      this.viewMode = mode;

      //TODO testar em várias situações, depois refatorar
      //Isso faz com que, ao mudar o modo de visualização, ele irá renderizar tudo novaamente
      if (this.itemsDisplayed.length > 0) {

        if (this.maxDisplayedItems > this.itemsDisplayed.length)
          this.maxDisplayedItems = this.itemsDisplayed.length;

        const itemsToDisplay = this.itemsDisplayed.slice(
          0,
          this.maxDisplayedItems
        );

        this.createItemsOnList(itemsToDisplay, this.isSelectable, this.viewMode, this.selectedItems, this.selectedItemsLimit);
      }

    });
  }

  stayOnPageInCaseOfDialog() {
    // Adiciona um estado ao histórico quando o diálogo abre
    history.pushState({ dialogOpen: true }, '', this.location.path());

    // Listener para o evento popstate (back/forward do navegador)
    this.popStateListener = (event: PopStateEvent) => {
      if (event.state?.dialogOpen) {
        if (this.matDialogComponentRef) {
          this.matDialogComponentRef.close();
        }
        this.location.back(); // Remove o estado adicionado
      }
    };

    window.addEventListener('popstate', this.popStateListener);
  }

  /**
   * Realiza a requisição na API para obter os dados e popular a lista.
   * @param apiUrl Campos pelo qual será realizada a busca no campo de buscas. @example "api/carros"
   */
  getDataFromAPI(apiUrl: string) {

    this.error = "";
    let usedApiUrl: string;
    if (!this.apiUrlToRead) {
      usedApiUrl = apiUrl;
    } else {
      usedApiUrl = this.apiUrlToRead;
    }

    this.isLoading = true;
    this.removeAllComponentsOnView();

    const url = this.setPageAndLimitOnUrl(usedApiUrl);
    this.requestAllValuesFromAPI(url).pipe(take(1))
      .subscribe({
        next: (response) => {
          this.totalItems = response.total;
          this.isLoading = false;
          this.itemsDisplayed = response.items;

          this.createItemsOnList(this.itemsDisplayed, this.isSelectable, this.viewMode, this.selectedItems, this.selectedItemsLimit);
        },
        error(error) {
          this.isLoading = false;
          this.error = "Error to get data";
        },
      });
  }

  getDataFromAPIUsingRegisteredCustomQuery(apiUrl: string, filterSearchParameterId: number) {

    this.error = "";
    let usedApiUrl: string;
    if (!this.apiUrlToRead) {
      usedApiUrl = apiUrl;
    } else {
      usedApiUrl = this.apiUrlToRead;
    }

    this.isLoading = true;
    this.removeAllComponentsOnView();
    this.filterEnabled = true;

    this.requestValuesFromAPIWithParameters(usedApiUrl, null, this.maxDisplayedItems, this.currentPageIndex, filterSearchParameterId).pipe(take(1)).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.totalItems = response.total;
        this.itemsDisplayed = response.items;
        this.createItemsOnList(this.itemsDisplayed, this.isSelectable, this.viewMode, this.selectedItems);

      },
      error: (error) => {
        this.isLoading = false;
        this.error = "Error to get data";
      },
    });
  }

  setPageAndLimitOnUrl(apiUrl: string): string {
    const hasQueryParams = this.hasQueryParams(apiUrl)

    if (this.currentPageIndex != null && this.maxDisplayedItems != null) {

      if (hasQueryParams == true) {
        apiUrl += `&page=${this.currentPageIndex}&pageSize=${this.maxDisplayedItems}`;
      } else {
        apiUrl += `?page=${this.currentPageIndex}&pageSize=${this.maxDisplayedItems}`;
      }
    }
    return apiUrl;
  }

  /**
   * Verifica se a apiUrl contém algum campo de parâmetros
   * @param apiUrl 
   * @returns Se tem campo de parâmetros retorna verdadeiro, se não, retorna falso
   */
  hasQueryParams(apiUrl: string): boolean {
    const url = new URL(apiUrl, window?.location?.origin || 'http://localhost');
    return url.searchParams.toString() !== '';
  }

  getData(itemsDisplayed: Object[]) {
    if (itemsDisplayed.length == 0) return;

    this.isLoading = false;

    if (this.maxDisplayedItems > itemsDisplayed.length)
      this.maxDisplayedItems = itemsDisplayed.length;

    const itemsToDisplay = itemsDisplayed.slice(0, this.maxDisplayedItems);

    this.createItemsOnList(itemsToDisplay, this.isSelectable, this.viewMode, this.selectedItems, this.selectedItemsLimit);
  }

  /**
   * Função que irá instanciar os components Card na tela, com os dados dos itens.
   * @param itemsDisplayed Array com os itens que serão apresentados. @example [{"name":"Marie", "age":22}, {"name":"Josef", "age":32}]
   */
  createItemsOnList(itemsDisplayed: any[], isSelectable: boolean, viewMode?: string, selectedItems?: any[], selectedItemsLimit?: number) {
    this.componentsCreatedList = [];
    this.removeAllComponentsOnView();

    //Verifica se todos os itens da pagina foram selecionados para marcar o seletor que indica que foram todos selecionados
    this.selectAllCheckBox = false;
    const selectedItemsIds = new Set(selectedItems.map(item => item.id));
    if (itemsDisplayed.every(item => selectedItemsIds.has(item.id))) {
      this.selectAllCheckBox = true;
    }

    for (let index = 0; index < itemsDisplayed.length; index++) {

      let componentCreated;

      if (isSelectable == true) {
        componentCreated = this.createSelectableItemOnList(itemsDisplayed[index], viewMode, selectedItems, selectedItemsLimit);
      } else {
        componentCreated = this.createItemOnList();
      }

      this.componentsCreatedList.push(componentCreated);

      componentCreated.columnsQuantity = this.columnsQuantity;
      componentCreated.userConfig = this.userConfig;
      componentCreated.itemDisplayed = itemsDisplayed[index];

      componentCreated.displayedfieldsName = this.displayedfieldsName;

      componentCreated.fieldsType = this.fieldsType;
      componentCreated.attributes = this.dataToCreatePage.attributes;
      componentCreated.objectDisplayedValue = this.objectDisplayedValue;
      componentCreated.visibleList = this.visibleList;

      componentCreated.className = this.className;
      // Passa o viewMode para o SelectableCardComponent
      componentCreated.viewMode = this.viewMode;

    }
  }

  createSelectableItemOnList(itemData: any, viewMode?: string, selectedItems?: any[], selectedItemsLimit?: number): SelectableCardComponent | SelectableListItemComponent {
    let componentCreated;

    //Muda o componente de acordo com o layout selecionado
    if (viewMode == ViewMode.cardLayout) {
      componentCreated = this.target.createComponent(
        SelectableCardComponent
      ).instance;
    } else {
      componentCreated = this.target.createComponent(
        SelectableListItemComponent
      ).instance;
    }

    if (selectedItems && selectedItems.length > 0) {
      if (selectedItems.some((selectedItem) => selectedItem.id === itemData.id)) {
        componentCreated.isSelected = true;
      }
    }

    this.selectableFieldController(componentCreated);
    componentCreated.isEditable = this.isAbleToEdit;
    componentCreated.eventClickToEdit
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        this.editItem(data);
      });

    return componentCreated;
  }

  createItemOnList(viewMode?: string): DefaultCardComponent {
    let componentCreated;

    if (viewMode == ViewMode.cardLayout) {
      componentCreated = this.target.createComponent(DefaultCardComponent).instance;
    } else {
      //TODO trocar aqui para a lista não selecionável, não lembro onde está
      componentCreated = this.target.createComponent(DefaultCardComponent).instance;
    }

    componentCreated.eventClick
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        this.editItem(data);
      });

    return componentCreated;
  }



  /**
   * Encaminha para pagina de edição.
   * @param item Dados do item que será alterado. @example [{"name":"Marie", "age":22}.
   */
  editItem(item: Object) {
    if (this.useFormOnDialog == true) {
      this.openFormOnDialog('edit', item['id']);
    } else {
      this.goToEditPage(item['id']);
    }
  }

  /**
   * Redirecina para pagina de alteração do item
   * @param itemId ID do item que será alterado.
   * @returns
   */
  goToEditPage(itemId: string) {
    if (this.route == undefined || this.route == null) {
      console.warn("O valor de 'route' não foi passado corretamente");
      return;
    }
    this.router.navigate([this.route + '/' + itemId + '/edit']);
  }

  /**
   * Abre o formulário em popUp/dialog tanto para edição ou criação.
   * @param action Qual ação será feita, sendo criação "new" ou edição "edit"
   * @param _itemId Id do item que será editado. Se for criado então pode ser "null" o valor preenchido no campo
   */
  openFormOnDialog(action: string, _itemId: string | null) {
    if (action !== 'edit' && action !== 'new') return;
    if (this.useFormOnDialog == false) return;

    console.log(
      'Dados para criação do form através da lista: ',
      this.dataToCreatePage
    );

    const config: IDinamicBaseResourceFormComponent = {
      dataToCreatePage: this.dataToCreatePage,
      className: this.className,
      currentAction: action,
      itemId: action === 'edit' && _itemId ? _itemId : null,
    };

    const dialogRef = this.matDialog.open(DinamicBaseResourceFormComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: config,
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((item) => {
        if (item == null) return;

        if ('action' in item) {
          return;
        }
      });
  }

  /**
   * Encaminha para pagina de criação
   */
  createItem() {
    if (this.isAbleToCreate == false) return;

    if (this.useFormOnDialog == true) {
      this.openFormOnDialog('new', null);
    } else {
      this.gotToCreationPage();
    }
  }

  /**
   * Redirecina para pagina de criação do item
   */
  gotToCreationPage() {
    if (this.route == undefined || this.route == null) {
      console.warn("O valor de 'route' não foi passado corretamente");
      return;
    }

    this.router.navigate([this.route + '/new']);
  }

  selectableFieldController(componentCreated: SelectableCardComponent) {
    if (this.selectedItemsLimit == null) {
      this.selectedItemsLimit = this.itemsDisplayed.length;
    }

    componentCreated.eventOnSelect
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {

        this.selectedItems = this.SelectItem(this.selectedItemsLimit, componentCreated, this.selectedItems, data);
      });
  }

  /**
   * Marca o item como selecionado
   * @param selectedItemsLimit Limite de itens que podem ser selecionados na lista
   * @param componentCreated Componente instanciado na lista 
   * @param selectedItems Lista com itens selecionados
   * @param data Dados do item
   * @returns Lista com itens que estão selecionados no momento atual
   */
  SelectItem(
    selectedItemsLimit: number,
    componentCreated: SelectableCardComponent,
    selectedItems: any[],
    data
  ): any[] {

    const dataIsSelected: boolean = selectedItems.some(
      (item) => item.id === data.id
    );

    if (selectedItems.length == this.itemsDisplayed.length - 1) {
      this.selectAllCheckBox = true;
    }

    //Se o componente não foi selencionado
    if (dataIsSelected == false) {
      if (selectedItemsLimit != null) {
        //Se o limite de itens selecionados não foi ultrapassado
        if (selectedItems.length < selectedItemsLimit) {
          selectedItems.push(data); //Seleciona o item
          componentCreated.isSelected = true;
        }
      } else {
        selectedItems.push(data);
        componentCreated.isSelected = true;
      }
    } else {
      if (this.selectAllCheckBox == true) {
        this.selectAllCheckBox = false;
      }
      selectedItems = selectedItems.filter((item) => item !== data);
      componentCreated.isSelected = false;
    }

    return selectedItems;
  }

  handlePageEvent($event) {
    if ($event == null) return;

    this.currentPageIndex = $event.pageIndex + 1; // O pageIndex começa em 0, então adicionamos 1 para corresponder à nossa lógica de paginação
    this.maxDisplayedItems = $event.pageSize; // Atualiza o número de itens exibidos por página

    if (this.filterEnabled == true && this.searchParameters) {
      this.fetchWithCustomQuery(this.searchParameters, this.apiUrl, this.maxDisplayedItems, this.currentPageIndex);
    } else {
      this.getDataFromAPI(this.apiUrl);
    }
  }

  removeAllComponentsOnView() {
    if (this.target == null) console.warn('target é null');
    this.target.clear();
  }

  getInstanceVariableValue(instance, variableName: string) {
    return instance[variableName];
  }

  onSelectedItemsCheckBoxChange(event) {
    this.selectAllCheckBox = event.checked;
    if (event.checked == true) {
      this.selectedItems = this.selectAllItems(this.itemsDisplayed, this.selectedItemsLimit, this.selectedItems);
    } else {
      this.selectedItems = this.unSelectAllItems(this.itemsDisplayed, this.selectedItems);
    }
  }

  selectAllItems(itemsDisplayed: any, selectedItemsLimit: number, selectedItems: any[]): any[] {

    if (itemsDisplayed.length <= 0) {
      return selectedItems;
    }

    if (itemsDisplayed.length > selectedItemsLimit) {
      return selectedItems;
    }

    //Obtem os id's dos itens já selecionados
    const existingItemsIds = new Set(selectedItems.map(item => item.id));
    //Obtem os itens que não estão selecionados
    const uniqueItems = itemsDisplayed.filter(item => !existingItemsIds.has(item.id));

    let temporarySelectedItems = [...selectedItems, ...uniqueItems];

    //Se a quantidade de itens que forem selecionados for maior que o limite
    if (temporarySelectedItems.length > selectedItemsLimit) {
      //Impedirá a seleção
      return selectedItems;
    }

    //Marca os itens selecionados na vizualização
    this.checkAllItemsOnView();
    //Armazena me memória os antigos itens e novos itens selecionados
    selectedItems = [...this.selectedItems, ...uniqueItems];

    return selectedItems;
  }

  unSelectAllItems(itemsDisplayed: any, selectedItems: any[]): any[] {
    const existingItemsIds = new Set(itemsDisplayed.map(item => item.id));

    selectedItems = selectedItems.filter(item => !existingItemsIds.has(item.id));

    this.unCheckAllItemsOnView();

    return selectedItems;
  }

  checkAllItemsOnView() {
    if (this.componentsCreatedList == null) return;

    this.componentsCreatedList.forEach((component) => {
      component.isSelected = true;
    });
  }

  unCheckAllItemsOnView() {
    if (this.componentsCreatedList == null) return;

    this.componentsCreatedList.forEach((component) => {
      component.isSelected = false;
    });
  }

  /**
   * Realiza uma requisição GET para API a partir do caminho passado.
   * @param apiUrl Caminho da API para realizar a requisição @example O trecho "api/carros" de "https://siteDoProgramador.com/api/carros"
   * @returns Retorna um observador que irá observar os dados que serão retornados da API.
   */
  requestAllValuesFromAPI(apiUrl: string, page?: number, pageSize?: number): Observable<any> {
    if (page & pageSize) {
      return this.http.get(environment.backendUrl + '/' + apiUrl + "?page=" + page + "&pageSize=" + pageSize);
    }
    return this.http.get(environment.backendUrl + '/' + apiUrl);

  }

  ngOnDestroy(): void {
    // Remove o listener ao destruir o componente
    window.removeEventListener('popstate', this.popStateListener);
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  /**
   * Função que removerá os itens selecionados na API e atualizará os itens da lista com os itens da API.
   */
  deleteSelectedItens(): any[] {
    if (this.selectedItems.length <= 0) {
      return;
    }

    let dialogMessage: string = this.translocoService.translate(
      'componentsBase.confirmation-dialog.messageToConfirmDelete'
    );

    //Irá abrir o dialog para perguntar para o usuário se ele tem certeza se quer remover os itens e depois dará continuidade com base na resposta selecionada pelo usuário.
    this.openConfirmationDialog(dialogMessage)
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: boolean) => {
        if (result == true) {
          this.selectedItems.forEach((item) => {
            this.http
              .delete(
                environment.backendUrl + '/' + this.apiUrl + '/' + item.id
              )
              .subscribe({
                next: () => {
                  // console.log("Item deletado: ", item);
                  this.selectedItems = [];

                  this.getDataFromAPI(this.apiUrl);
                },
                error: (error) => {
                  console.error('Erro ao deletar item: ', item, error);
                },
              });
          });

          this.matSnackBar.open(this.translocoService.translate('componentsBase.default-list.items-deleted-successfully'), 'OK', { duration: 3000 });

          this.getDataFromAPI(this.apiUrl);
        }
      });
  }

  /**
   * Função que irá alterar o título da página.
   */
  changeTitle() {
    if (this.title == null) return;
    this.titleService.setSubTitle(this.title[this.translocoService.getActiveLang()]);
    this.translocoService.langChanges$.subscribe((lang) => {
      this.titleService.setSubTitle(this.title[lang]);
    });
  }

  /**
   * Fechará e esse componte que foi como dialog.
   */
  return() {
    if (this.matDialogComponentRef == null) return;

    this.matDialogComponentRef.close(null);
  }

  /**
   * Fechará e esse componte e retornará os itens que foram selecionados para o componente pai que abriu esse componente como dialog.
   */
  returnWithSelectedItems() {
    if (this.matDialogComponentRef == null) return;

    this.matDialogComponentRef.close(this.selectedItems);
  }

  /**
   * Abrirá um dialog com o conponente de confirmação, que permite o usuário.
   * @param message Mensagem que será apresentada no componente de confirmação.
   * @returns Retorna uma referência do componente de confirmação que foi aberto na página atual.
   */
  openConfirmationDialog(
    message: string
  ): MatDialogRef<ConfirmationDialogComponent> {
    const confirmationDialog: IConfirmationDialog = {
      message: message,
    };
    // console.log(message);
    return this.matDialog.open(ConfirmationDialogComponent, {
      data: confirmationDialog,
    });
  }

  /**
   * Faz a busca na API com base nos parâmetros definidos pelo usuário
   * @param searchParameters Estrutura de dados com parâmetros de busca feitos pelo usuário
   * @param apiUrl URL que será feito a requisição
   * @param limitPerPage Limite de itens por pagina que serão retornados
   * @param offset Pagina
   * @returns Irá ser criado Cards com dados recebidos da requisição nesse componente atual
   */
  fetchWithCustomQuery(searchParameters: FilterSearchParameters, apiUrl: string, limitPerPage: number, offset: number) {

    if (!searchParameters || searchParameters == null) {
      this.filterEnabled = false;
      this.getDataFromAPI(this.apiUrl);
      return;
    }

    this.isLoading = true;
    this.removeAllComponentsOnView();

    this.filterEnabled = true;
    this.searchParameters = searchParameters;
    this.filterService.saveSearchParametersOnLocalStorage(searchParameters);

    this.requestValuesFromAPIWithParameters(apiUrl, searchParameters, limitPerPage, offset).pipe(take(1)).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.totalItems = response.total;
        this.itemsDisplayed = response.items;
        this.createItemsOnList(this.itemsDisplayed, this.isSelectable, this.viewMode, this.selectedItems);

      },
      error: (error) => {
        this.isLoading = false;
        this.error = "Error to get data";
      },
    });

  }

  fetchWithSortedQuery(sortedField: SortOption[], apiUrl: string, limitPerPage: number, offset: number) {

    if (!sortedField || sortedField == null) {
      this.getDataFromAPI(this.apiUrl);
      return;
    }

    this.isLoading = true;
    this.removeAllComponentsOnView();
    const sortedFieldInOrder = sortedField.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    this.requestValuesFromAPIWithSortParameters(apiUrl, sortedFieldInOrder, limitPerPage, offset).pipe(take(1)).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.totalItems = response.total;
        this.itemsDisplayed = response.items;
        this.createItemsOnList(this.itemsDisplayed, this.isSelectable, this.viewMode, this.selectedItems);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = "Error to get data";
      },
    });
  }

  requestValuesFromAPIWithSortParameters(apiUrl: string, sortedField: SortOption[], limitPerPage?: number, offset?: number): Observable<any> {
    const filters = this.searchParameters?.parameters || this.searchParameters
    if (offset != null && limitPerPage != null) {
      return this.http.post(environment.backendUrl + '/' + apiUrl + "/eagerloading?page=" + offset + "&pageSize=" + limitPerPage + "&sort=" + sortedField.map(f => f.field + ':' + f.direction).join(','), filters);
    }
    return this.http.post(environment.backendUrl + '/' + apiUrl + "&sort=" + sortedField.map(f => f.field + ':' + f.direction).join(','), filters);
  }

  requestValuesFromAPIWithParameters(apiUrl: string, searchParameters: FilterSearchParameters, limitPerPage?: number, currentPage?: number, filterSearchParameterId?: number): Observable<any> {
    let url: string;
    let parametersAdded: boolean = false;

    url = environment.backendUrl + '/' + apiUrl + "/custom", searchParameters;

    if (filterSearchParameterId) {
      url = url + "?filterSearchParameterId=" + filterSearchParameterId;
      parametersAdded = true;
    }

    //Se já foi adicionado parametros altera para lidar com a paginação
    if (parametersAdded == true) {
      url = url + "&"
    } else {
      url = url + "?"
    }

    if (currentPage != null && limitPerPage != null) {
      url = url + "page=" + currentPage + "&pageSize=" + limitPerPage;
    }

    return this.http.post(url, searchParameters);
  }

  clearSearchInputEvent() {
    this.maxDisplayedItems = 25; //Default para 25 itens
    this.ngAfterViewInit();
  }

  /**
   * Realiza o download de todos os dados da lista em CSV ou XLSX
   * @param format Formato do arquivo: 'csv' ou 'xlsx'
   */
  downloadData(format: 'csv' | 'xlsx') {
    this.isLoading = true;

    // Determina a URL baseada no formato
    const downloadUrl = `${this.apiUrl}/exportDocument/${format}`;

    // Faz a requisição POST para o endpoint de download
    this.http.post(environment.backendUrl + '/' + downloadUrl, this.searchParameters?.parameters, { 
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Extrai o nome do arquivo do header Content-Disposition
        let filename = `${this.className}_export.${format}`;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match?.[1]) {
            filename = match[1];
          }
        }

        // Cria blob e trigger do download
        const blob = new Blob([response.body!], { 
          type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao fazer download:', error);
        this.isLoading = false;
        this.error = `Erro ao fazer download do arquivo ${format.toUpperCase()}`;
      }
    });
  }
}