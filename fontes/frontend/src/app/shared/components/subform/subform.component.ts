import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Inject, Injector, Input, OnInit, Optional, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { environment } from 'environments/environment';
import { catchError, forkJoin, lastValueFrom, Observable, Subject, take, takeUntil } from 'rxjs';
import { IDefaultListComponentDialogConfig, DefaultListComponent, IFieldProperty } from '../default-list/default-list.component';
import { ISearchableField } from '../search-input-field/search-input-field.component';
import { SortField, SortOption } from '../sort-order-dialog/sort-order-dialog.component';
import { FilterParameters } from '../filter/base-resource-filter.component';
import { FormGeneratorService } from 'app/shared/services/form-generator.service';
import { FormSpaceBuildComponent } from '../form-space-build/form-space-build.component';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SelectableCardComponent } from '../selectable-card/selectable-card.component';
import { OnlineOfflineService } from 'app/shared/services/online-offline.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageStructureAttribute } from '../../models/pageStructure';
import { Validators } from '@angular/forms';
import { ConsultaService } from 'app/shared/services/consulta.service';
import { ImportCsvComponent, ImportCsvResult } from '../import-csv/import-csv.component';
import { map } from 'jquery';
import { FilterSearchParameters } from '../filter/base-resource-filter.component';
interface Link {
  addressDestination: string;
  mapping: { [key: string]: string };
}

export interface QueryParam {
  variableName: string; // Nome da variável (ex: "situacao")
  className: string; // Nome da classe (opcional)
  attributeName: string; // Nome do atributo (opcional)
}

interface ParsedUrl {
  path: string;
  parameters: QueryParam[];
}

interface ISubformAttribute {
  name: string;
  type: string;
  className?: string;
  foreignKeyName?: string; // Nome real da chave estrangeira no banco de dados
  forageinKey?: string; // Campo legado (typo de foreignKey)
}

/**
 * Componente SubForm com grid responsiva
 * 
 * O componente agora exibe os cards em uma grid responsiva que se adapta ao tamanho da tela:
 * - Mobile (≤576px): 1 coluna
 * - Tablet pequeno (577-768px): auto-fit com mínimo 250px
 * - Tablet (769-992px): auto-fit com mínimo 220px  
 * - Desktop pequeno (993-1200px): auto-fit com mínimo 250px
 * - Desktop grande (≥1201px): auto-fill com mínimo 300px
 * 
 * @example
 * <app-subform 
 *   [itemsDisplayed]="items"
 *   [gridColumns]="3"
 *   [className]="'MinhaClasse'"
 *   [dataToCreatePage]="pageStructure">
 * </app-subform>
 */
@Component({
  selector: 'app-subform',
  templateUrl: './subform.component.html',
  styleUrls: ['./subform.component.scss']
})
export class SubformComponent implements AfterViewInit {
    @Input() form!: FormGroup;
  @Input() itemsDisplayed: any[] = [];
  @Input() columnsQuantity: number = 1;
  @Input() gridColumns: number | null = null; // Permite override das colunas da grid
  @Input() displayedfieldsName: string[] | null;
  @Input() fieldsType: string[];
  @Input() objectDisplayedValue: string[]
  @Input() userConfig: any;
  @Input() isSelectable: boolean = true;
  @Input() selectedItemsLimit: number | null = null;
  @Input() index: number;

  @Input() foreignKeyName: string; // Nome real da chave estrangeira, se necessário
  @Input() classImported: { nameClass: string, jsonPath: string, attributeClass: string, links: Link | null }[] = [];
  /**
   * Campo que saída para os valores que foram selecionados.
   */
  @Output() eventSelectedValues = new EventEmitter<any[]>();
  @Input() apiUrl!: string;
  @Input() searchableFields: ISearchableField[] | null = [];
  /**
   * Parâmetros de filtro para o componente
   */
  filterParameters: FilterParameters[] | null = null;
  /**
   * Campos disponíveis para ordenação
   */
  sortableFields: SortField[] = [];
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
  @Input() useFormOnDialog: boolean = true;
  @Input() searchInputFieldVisible: boolean = false;

  isLoading: boolean = true;

  subClassJSONDictionary: IPageStructure;

  @ViewChild('placeToRender', { read: ViewContainerRef }) target!: ViewContainerRef;

  // protected router: Router;
  // private http: HttpClient;
  private translocoService: TranslocoService;
  // private matDialog: MatDialog;
  // protected activatedRoute: ActivatedRoute;
  currentAction: string;
  protected formBuilder: FormBuilder;
  createdSubClass: any[] = [];
  resourceForm: any;
  public inputValue: FormControl<object[]> = new FormControl<object[]>([]);
  private isOnline: boolean;  
  private pathToGo: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  searchParameters: FilterSearchParameters | null = null;

 constructor(
    private matDialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formGeneratorService: FormGeneratorService,
    private matSnackBar: MatSnackBar,
    private http: HttpClient,
    private consultaService: ConsultaService
  ) {
    this.formPrincipal = this.fb.group({});
    this.formArray = this.fb.array([]);
    this.formPrincipal.addControl('dados', this.formArray);

    this.isOpenedOnDialog = false; // Ajuste conforme necessidade
  }
  /**
   * Função que irá instanciar os components Card na tela, com os dados dos itens.
   * @param itemsDisplayed Array com os itens que serão apresentados. @example [{"name":"Marie", "age":22}, {"name":"Josef", "age":32}]
   */
  createItemsOnList(itemsDisplayed: any[], itemDisplayedOnSubFormType: string[], objectDisplayedValue: string[], attributesOnSubForm: any[] = [], clearExisting: boolean = true) {
    this.componentsCreatedList = [];
    this.target.clear();

    for (let index = 0; index < itemsDisplayed.length; index++) {

      let componentCreated;

      const componentRef = this.target.createComponent(SelectableCardComponent);
      componentCreated = componentRef.instance;
      
      // Adiciona classe CSS para styling da grid
      if (componentRef.location?.nativeElement) {
        const element = componentRef.location.nativeElement;
        element.classList.add('card-item');
        
        // Garante que o elemento tenha altura adequada
        element.style.minHeight = '120px';
        element.style.height = 'auto';
        element.style.overflow = 'visible';
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
      }
      
      this.componentsCreatedList.push(componentCreated);

      componentCreated.columnsQuantity = this.columnsQuantity;
      componentCreated.userConfig = this.userConfig;
      componentCreated.itemDisplayed = itemsDisplayed[index];

      componentCreated.displayedfieldsName = this.displayedfieldsName;
      componentCreated.fieldsType = this.fieldsType;
      componentCreated.objectDisplayedValue = objectDisplayedValue;
      componentCreated.attributes = attributesOnSubForm;
      componentCreated.classFather = this.className;
      componentCreated.isSubForm = true;
      componentCreated.visibleList = this.getVisibleList();

      componentCreated.className = this.className;

      componentCreated.isEditable = this.isAbleToEdit;
      componentCreated.eventClickToEdit.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => { this.editItem(data) });
      this.selectItem(componentCreated);

    }
    
    // Após criar todos os cards, força atualização do layout
    setTimeout(() => {
      this.ensureCardsVisibility();
    }, 100);
''
  }

  /**
   * Força o reajuste do layout da grid e dos cards
   * Útil quando o conteúdo dos cards muda dinamicamente
   */
  public refreshLayout(): void {
    setTimeout(() => {
      this.applyGridStyles();
      this.ensureCardsVisibility();
    }, 50);
  }

  /**
   * Garante que todos os cards sejam visíveis e tenham altura adequada
   */
  private ensureCardsVisibility(): void {
    if (!this.target?.element?.nativeElement) return;
    
    const gridContainer = this.target.element.nativeElement.parentElement;
    if (!gridContainer) return;
    
    const cards = gridContainer.querySelectorAll('.card-item');
    cards.forEach((card: HTMLElement) => {
      // Força recálculo de altura
      card.style.height = 'auto';
      
      // Garante que o conteúdo interno seja visível
      const cardContainer = card.querySelector('#card-container') as HTMLElement;
      if (cardContainer) {
        cardContainer.style.height = 'auto';
        cardContainer.style.minHeight = '100px';
        cardContainer.style.display = 'flex';
        cardContainer.style.flexDirection = 'column';
      }
      
      // Remove qualquer overflow hidden que possa estar cortando o conteúdo
      card.style.overflow = 'visible';
    });
  }

  selectItem(componentCreated: SelectableCardComponent) {
    componentCreated.eventOnSelect.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.checkItem(this.selectedItemsLimit, componentCreated, data);
    });
  }

  /**
   * Encaminha para pagina de edição.
   * @param item Dados do item que será alterado. @example [{"name":"Marie", "age":22}.
   */
  editItem(item: any) {
    let nameClass = this.dataToCreatePage.attributes[this.index].className;
    nameClass = nameClass.charAt(0).toLowerCase() + nameClass.slice(1);

    let jsonPath = environment.jsonPath + nameClass + ".json";

    this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: IPageStructure) => {
      this.subClassJSONDictionary = JSONDictionary;

      const dialogRef = this.matDialog.open(FormSpaceBuildComponent, {
        id: this.dataToCreatePage.attributes[this.index].name,
        maxHeight: '95vh', // Altura máxima de 90% da tela
        width: '80vw',      // Largura de 80% da tela
        data: {
          dataToCreatePage: JSONDictionary,
          currentFormAction: 'edit',
          submitFormFunction: this.submitEditForm.bind(this),
          itemToEdit: item,
          deleteFormFunction: (item: any) => {
            this.itemsDisplayed = this.itemsDisplayed.filter((element) => element.id != item.id);
          },
          returnFormFunction: () => {
            dialogRef.close();
          },
          //Ele normalmente recebe o resorceForm para pode preencher com cada campo de inserção com base no JSON
          //Ele ainda tem o emissõr que o terminou de preencher cada campo do resourceForm
        }
      })

      const instance = dialogRef.componentInstance as FormSpaceBuildComponent;

      instance.formIsReady.subscribe((isReady: boolean) => {
        if (isReady) {
          for(const key in item) {
            if(instance.resourceForm.controls[key]) {
              instance.resourceForm.controls[key].setValue(item[key]);
            } else {
              instance.resourceForm.addControl(key, new FormControl(item[key]));
            }
          }
        }
      });      
    }); 
  }

//    editItem(data: any): void {
//   this.currentAction = 'edit';
//   this.selectedItem = data;

// }
  submitEditForm(JSONDictionary: IPageStructure, item: FormGroup, itemEdited: any) {
    if (itemEdited == null) return;

    if(item.invalid) {
      item.markAllAsTouched();
      this.matSnackBar.open('Erro ao editar item!', 'Fechar', {
        duration: 2000,
      });
      return
    }
      this.editSubFormOffline(JSONDictionary, item, itemEdited.value);
  }

  editSubFormOffline(JSONDictionary: IPageStructure, item: any, itemEdited: any) {
  this.itemsDisplayed = this.itemsDisplayed.map((element) => {
    if (element === item) {
      return { ...element, ...itemEdited };
    }
    return element;
  });

  // Atualiza inputValue com o item editado sem duplicar
  let valueToInput = this.objectTratament(itemEdited);

  let currentValue = this.inputValue.value as { id?: any }[] || [];

  const tratedItem = this.objectTratament(item);

  // Atualiza currentValue substituindo o item editado pelo novo valor
  currentValue = currentValue.map(existing => this.compareItems(existing, tratedItem) ? valueToInput : existing);
  
  this.inputValue.setValue(currentValue);
  
  let { itemDisplayedOnSubFormType, objectDisplayedValueOnSubForm, attributesOnSubForm } = this.getAttributesToSubForm(JSONDictionary);

  this.createItemsOnList(this.itemsDisplayed, itemDisplayedOnSubFormType, objectDisplayedValueOnSubForm, attributesOnSubForm);

  this.matDialog.getDialogById(this.dataToCreatePage.attributes[this.index].name).close();
}

  
  submitForm(JSONDictionary: IPageStructure, item: FormGroup) {
    if (item == null) return;
    this.createSubFormOffline(JSONDictionary, item);
  }
    
  /**
   * Realizar uma alteração nos dados do formulário, removendo objetos e substituindo somente pelos IDs
   * @param item Formulário
   */
  objectTratament(item){
    for(let field in item){
      if(item[field] instanceof Object){
        if(item[field] instanceof Array){
          item[field] = item[field].map((value) => value.id == undefined || value.id == null ? value : value.id);
        } else {
          if(item[field].id == undefined || item[field].id == null){
            continue;
          }
          item[field] = item[field].id;
        }
      }
    }
    return item;
  }

  createSubFormOffline(JSONDictionary: IPageStructure, item: FormGroup) {
    if (item.invalid) {
      item.markAllAsTouched();
      this.matSnackBar.open('Erro ao criar item!', 'Fechar', { duration: 2000 });
      return;
    }
    const newItem = item.value;
    this.itemsDisplayed.push(newItem);
    
    // MODIFICADO: Após adicionar, vai para a última página para ver o novo item
    this.currentPage = this.getTotalPages();
    this.renderItems();

    let valueToInput = this.objectTratament({ ...newItem });
    const currentValue = this.inputValue.value || [];
    this.inputValue.setValue([...currentValue, valueToInput]);
    this.matDialog.getDialogById(this.dataToCreatePage.attributes[this.index].name).close();
  }

  deleteSubForm(items: any[]) {
    let confirmation = confirm("Deseja realmente deletar os itens selecionados?");
    if (!confirmation) return;
    this.selectedItems = []; //Para o botão de deletar não ficar ativo
    items.forEach((item) => {
      let nameClass = this.dataToCreatePage.attributes[this.index].className;
      nameClass = nameClass.charAt(0).toLowerCase() + nameClass.slice(1);

      let jsonPath = environment.jsonPath + nameClass + ".json";

      this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: IPageStructure) => {
        this.subClassJSONDictionary = JSONDictionary;

        if(item.id != null && item.id != undefined){
          this.deleteSubFormOnApi(JSONDictionary, item);
        } else {
          this.deleteSubFormOffline(JSONDictionary, item);
        }
      });
    });
  }

deleteSubFormOffline(JSONDictionary: IPageStructure, item: any) {
    this.itemsDisplayed = this.itemsDisplayed.filter((element) => !this.compareItems(element, item));
    const treatedObjects = this.itemsDisplayed.map(item => this.objectTratament(item))
    this.inputValue.setValue(treatedObjects);
    // MODIFICADO: Garante que não fiquemos em uma página vazia após a exclusão
    if (this.currentPage > this.getTotalPages()) {
      this.currentPage = this.getTotalPages();
    }
    if (this.currentPage === 0 && this.itemsDisplayed.length > 0) {
      this.currentPage = 1;
    }
    
    this.renderItems();

    this.matSnackBar.open('Item deletado com sucesso!', 'Fechar', { duration: 2000 });
  }

  deleteSubFormOnApi(JSONDictionary: IPageStructure, item: any) {
    this.http.delete(environment.backendUrl + '/' + JSONDictionary.config.apiUrl + '/' + item.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
          this.deleteSubFormOffline(JSONDictionary, item);
          this.matSnackBar.open('Item deletado com sucesso!', 'Fechar', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.matSnackBar.open('Erro ao deletar item!', 'Fechar', {
            duration: 2000,
          });
        }
      });
  }


  //TODO: quando o subform é chamado pelo foreign key ao criar um novo item, ele não pega a currentAction
  private setCurrentAction() {
    if (this.activatedRoute.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else{
      this.currentAction = "edit";
      this.displayDataOnEdit();
    }
  }

  private async displayDataOnEdit() {
    this.inputValue.valueChanges.pipe(take(1), takeUntil(this.ngUnsubscribe)).subscribe(async (data: any[]) => {
      if (!data || data.length === 0) {
        console.warn('Nenhum dado recebido para edição.');
        return;
      }
      this.getDataFromEagerLoading().subscribe((items) => {
      });
    });
  }

  private getDataFromEagerLoading(): Observable<any[]> {
    try {
      // Usar POST /eagerloading com WhereOptions correto
      const body = this.getBodyForEagerLoading();
      // Adicionar query parameters para paginação
      const apiUrl = `${environment.backendUrl}/${this.apiUrl}/eagerloading`;
      
      this.http.post(apiUrl, body).pipe(take(1)).subscribe((itemsFromApi: any) => {
        if (itemsFromApi && itemsFromApi.items) {
          this.itemsDisplayed = itemsFromApi.items;
          this.renderItems();
        } else {
          console.warn('Nenhum item encontrado no API.');
        }
      });

    } catch (error) {
      console.error('Erro ao buscar itens do API:', error);
    }
    return new Observable(observer => {
      observer.next(this.itemsDisplayed);
      observer.complete();
    });
  }

  private getBodyForEagerLoading(): any {
    
    if (!this.subClassJSONDictionary?.attributes || !this.resourceForm) {
      console.warn('SubClassJSONDictionary ou resourceForm não está disponível');
      return {};
    }

    // Encontra o campo que referencia a entidade pai
    const parentField = this.subClassJSONDictionary.attributes.find(attr => 
      attr.className === this.dataToCreatePage.config.name
    );

    if (!parentField) {
      console.warn('Campo de referência da entidade pai não encontrado');
      return {};
    }

    const parentId = this.resourceForm.get('id')?.value;
    
    if (!parentId) {
      console.warn('ID da entidade pai não encontrado');
      return {};
    }

    // Determinar o nome real da chave estrangeira
    const foreignKeyName = this.foreignKeyName;

    // Criar WhereOptions para o Sequelize
    const whereOptions = {
      [foreignKeyName]: parentId
    };

    return whereOptions;
  }

  private getVisibleList() {
    let visibleList = [];
    this.subClassJSONDictionary.attributes.forEach((element) => {
        visibleList.push(element.visibleList);
    });
    return visibleList;
  }
 
  formArray: FormArray;
  formPrincipal: FormGroup;
  formGroup!: FormGroup;

ngOnInit(): void {
  this.initializeForm();
  this.formGroup = this.form;
}

  ngAfterViewInit(): void {
    this.getSubForm();
    this.isLoading = false;
    this.setCurrentAction();
    this.applyGridStyles();
    this.setupResizeObserver();
    
    const attribute = this.dataToCreatePage?.attributes?.[this.index];
    const formArray = this.formGroup?.get(attribute?.name) as FormArray;
    
    if (formArray && formArray.length > 0) {
      // Limpa itemsDisplayed antes de setar
      this.itemsDisplayed = [];
      
      formArray.controls.forEach(control => {
        // Verifica se já tem para não duplicar
        if (!this.itemsDisplayed.some(item => this.compareItems(item, control.value))) {
          this.itemsDisplayed.push(control.value);
        }
      });
      
      this.renderItems();
    }
  }

  /**
   * Configura observador de redimensionamento para reajustar layout
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined' && this.target?.element?.nativeElement) {
      const resizeObserver = new ResizeObserver(() => {
        this.refreshLayout();
      });
      
      const gridContainer = this.target.element.nativeElement.parentElement;
      if (gridContainer) {
        resizeObserver.observe(gridContainer);
      }
    }
  }

  /**
   * Permite configurar dinamicamente o número de colunas da grid
   * @param columns Número de colunas desejado
   */
  public setGridColumns(columns: number): void {
    this.gridColumns = columns;
    this.applyGridStyles();
  }

  /**
   * Retorna o número atual de colunas da grid
   */
  public getGridColumns(): number | null {
    return this.gridColumns;
  }

  private applyGridStyles(): void {
    if (!this.target?.element?.nativeElement) return;
    
    const gridContainer = this.target.element.nativeElement.parentElement;
    if (!gridContainer || !gridContainer.classList.contains('grid-container')) return;
    
    // Apply custom grid columns if specified
    if (this.gridColumns) {
      gridContainer.style.gridTemplateColumns = `repeat(${this.gridColumns}, 1fr)`;
    }
    
    // Add class for few items to center them
    const currentPageItems = this.getItemsForCurrentPage();
    if (currentPageItems.length <= 3) {
      gridContainer.classList.add('few-items');
    } else {
      gridContainer.classList.remove('few-items');
    }
  }

  getSubForm() {
  let nameClass = this.dataToCreatePage.attributes[this.index].className;
    nameClass = nameClass.charAt(0).toLowerCase() + nameClass.slice(1);

    let jsonPath = environment.jsonPath + nameClass + ".json";

    this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: any) => {
      
      this.subClassJSONDictionary = JSONDictionary;
      this.jsonConfig = JSONDictionary;
      this.buildSearcInputField();

    });
}

  
  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null); 
    this.ngUnsubscribe.complete();
  }

private initializeForm() {
  if (!this.form) {
    console.warn('Form não recebido via @Input(), criando novo...');
    this.form = this.fb.group({
      itensImportados: this.fb.array([])
    });
  } else if (!this.form.get('itensImportados')) {
    this.form.addControl('itensImportados', this.fb.array([]));
  }

  this.formGroup = this.form; // ✅ sempre sincroniza
}


  get itensImportados(): FormArray {
    const array = this.form.get('itensImportados');
    if (!array) {
      console.warn('itensImportados não está definido no form');
      return this.fb.array([]);
    }
    return array as FormArray;
  }

  private generateUniqueId(): string {
    return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

private renderItems() {
  if (!this.target) {
    setTimeout(() => this.renderItems(), 50);
    return;
  }

  if (!this.subClassJSONDictionary) {
    console.warn('JSON de configuração do subform não carregado');
    return;
  }

  const { itemDisplayedOnSubFormType, objectDisplayedValueOnSubForm, attributesOnSubForm } =
    this.getAttributesToSubForm(this.subClassJSONDictionary);

    this.createItemsOnList(
      this.getItemsForCurrentPage(),
      itemDisplayedOnSubFormType,
      objectDisplayedValueOnSubForm,
      attributesOnSubForm,
      true
    );
    
    // Aplica estilos da grid e força layout adequado após renderizar os itens
    setTimeout(() => {
      this.applyGridStyles();
      this.ensureCardsVisibility();
    }, 100);
}

public selectedItem: any; 

  private clearExistingComponents() {
    this.componentsCreatedList = [];
    this.target.clear();
    this.selectedItems = [];
  }

  checkItem(selectedItemsLimit: number, componentCreated: any, data: any) {
    const dataIsSelected: boolean = this.selectedItems.some(item =>
      this.compareItems(item, data)
    );

    if (this.selectedItems.length == this.itemsDisplayed.length - 1) {
      this.selectAllCheckBox = true;
    }

    if (!dataIsSelected) {
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
      this.selectedItems = this.selectedItems.filter(item => !this.compareItems(item, data));
      componentCreated.isSelected = false;
    }
  }

  private compareItems(item1: any, item2: any): boolean {
    if (item1._uniqueId && item2._uniqueId) {
      return item1._uniqueId === item2._uniqueId;
    }
    if (item1.id && item2.id) {
      return item1.id === item2.id;
    }
    return JSON.stringify(item1) === JSON.stringify(item2);
  }

  // Método para processar itens importados e renderizar lista atualizada
  private processImportedItems(selectedItems: any[], config: any) {
    this.itemsDisplayed = [...this.itemsDisplayed, ...selectedItems];
    this.subClassJSONDictionary = config;
    this.jsonConfig = config;

    const inputTratado = selectedItems.map(item => this.objectTratament({ ...item }));
    const currentValue = this.inputValue.value || [];
    this.inputValue.setValue([...currentValue, ...inputTratado]);

    // MODIFICADO: Reseta para a primeira página ao importar para ver o início dos novos dados
    this.currentPage = 1;
    this.renderItems();
  }
  
  private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  private getAttributesToSubForm(JSONDictionary: IPageStructure) {
    let itemDisplayedOnSubFormType: string[] = [];
    let objectDisplayedValueOnSubForm: string[] = [];
    let attributesOnSubForm: any[] = [];

    JSONDictionary.attributes.forEach((element) => {
      itemDisplayedOnSubFormType.push(element.type);
      objectDisplayedValueOnSubForm.push(element.fieldDisplayedInLabel);
      attributesOnSubForm.push(element);
    });

    return { itemDisplayedOnSubFormType, objectDisplayedValueOnSubForm, attributesOnSubForm };
  }

abrirDialogoImportar() {
  const attributeConfig = this.dataToCreatePage?.attributes?.[this.index];
  const subformClassName = attributeConfig?.className;

  if (!subformClassName) {
    this.matSnackBar.open('Classe da subform não definida.', 'Fechar', {
      duration: 3000,
    });
    return;
  }

  const jsonPath = `${environment.jsonPath}${this.lowerFirstLetter(subformClassName)}.json`;

  this.formGeneratorService.getJSONFromDicionario(jsonPath)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(value => {
        const config: IDefaultListComponentDialogConfig = {
          itemsDisplayed: [],
          columnsQuantity: 3,
          displayedfieldsName: value.attributes.map(attr => attr.name),
          fieldsType: value.attributes.map(attr => attr.type),
          fields: [],
          objectDisplayedValue: value.attributes.map(attr => attr.fieldDisplayedInLabel),
          userConfig: null,
          selectedItemsLimit: this.selectedItemsLimit,
          apiUrl: value.config.apiUrl,
          searchableFields: value.config.searchableFields || [],
          isSelectable: true,
          className: value.config.name,
          isAbleToCreate: false,
          isAbleToEdit: false,
          isAbleToDelete: true,
          dataToCreatePage: value,
          useFormOnDialog: true,
          isEnabledToGetDataFromAPI: true,

          //TODO arrumar isso
          hasCustomFunctionButton: false,
          customFunction: null,
          customFunctionButtonIconName: null,
      }

      const dialogRef = this.matDialog.open(DefaultListComponent, {
        // width: '100%',
        // height: '100%',
        maxWidth: '100vw',
        maxHeight: '80vh',
        panelClass: 'full-screen-dialog',
        data: config,
      });

      dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe((result) => {
          if (result) {
            let numberOfItems = result.length;
            let dupes: number = 0;
            let hasDupes: boolean = false;
            for (const item of result) {
              if ( this.itemsDisplayed.some(existing => item.id == existing.id || this.compareItems(existing, item))) {
                dupes++;
                hasDupes = true;
                console.warn('Item já existe na lista, não duplicando:', item);
                result.splice(result.indexOf(item), 1);
                this.matSnackBar.open('Item já existe na lista, não duplicando.', 'Fechar', {
                  duration: 3000,
                });
                continue; // Não duplica itens já existentes
              }
            }
            this.processImportedItems(result, value);
            this.handleImportFeedback(hasDupes, dupes, numberOfItems);
          } 
      });
    });
}

  private handleImportFeedback(hasDupes: boolean, dupes: number, totalItems: number) {
        if(hasDupes) {
      if(dupes == totalItems) {
        this.matSnackBar.open('Todos os itens já existem na lista, nenhum item foi adicionado.', 'Fechar', {
          duration: 3000,
        });
      } else {
        this.matSnackBar.open(`Itens importados com sucesso! ${dupes} itens já existiam na lista e não foram duplicados.`, 'Fechar', {
          duration: 3000,
        });
      }
    } else {
      this.matSnackBar.open('Itens importados com sucesso!', 'Fechar', {
        duration: 3000,
      });
    }
  }


  private importSubformItemsToFormArray(
    selectedItems: any[],
    form: FormGroup,
    jsonConfig: any,
    controlName: string
  ): void {
    if (!jsonConfig || !jsonConfig.attributes?.length) {
      console.warn('[importSubformItemsToFormArray] jsonConfig inválido!', jsonConfig);
      return;
    }

    let formArray = form.get(controlName) as FormArray;
    if (!formArray) {
      formArray = this.fb.array([]);
      form.addControl(controlName, formArray);
    }

    selectedItems.forEach(item => {
      try {
        const group = this.createFormGroupFromJson(item, jsonConfig);
        formArray.push(group);
      } catch (err) {
        console.error('Erro ao criar FormGroup:', err);
      }
    });
  }

  private createFormGroupFromJson(
    data: any,
    jsonConfig: { attributes: IPageStructureAttribute[] }
  ): FormGroup {
    const group = this.fb.group({});

    jsonConfig.attributes.forEach((attr) => {
      if (!attr?.name) return;

      const initialValue = data?.[attr.name] ?? attr.defaultValue ?? null;
      const validators = [];

      if (attr.isRequired) {
        validators.push(Validators.required);
      }

      if (typeof attr.limiteOfChars === 'number' && attr.limiteOfChars > 0) {
        validators.push(Validators.maxLength(attr.limiteOfChars));
      }

      group.addControl(attr.name, this.fb.control(initialValue, validators));
    });

    return group;
  }

  private lowerFirstLetter(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

private parentEntityId: number | null = null;
jsonConfig: IPageStructure | null = null;
subformJsonConfig: IPageStructure | null = null;

currentMapping: { [key: string]: string } = {};

  openFormOnDialog() {
    let nameClass = this.dataToCreatePage.attributes[this.index].className;
    nameClass = nameClass.charAt(0).toLowerCase() + nameClass.slice(1);

    let jsonPath = environment.jsonPath + nameClass + ".json";

    this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: any) => {

      this.subClassJSONDictionary = JSONDictionary;

      const dialogRef = this.matDialog.open(FormSpaceBuildComponent, {
        id: this.dataToCreatePage.attributes[this.index].name,
        maxHeight: '95vh', // Altura máxima de 90% da tela
        width: '80vw',      // Largura de 80% da tela
        data: {
          dataToCreatePage: JSONDictionary,
          currentFormAction: 'new',
          submitFormFunction: this.submitForm.bind(this),
          formBuilder: this.resourceForm,
          deleteFormFunction: (item: any) => {
            this.itemsDisplayed = this.itemsDisplayed.filter((element) => element.id != item.id);
            this.inputValue.setValue(this.itemsDisplayed);
          },
          returnFormFunction: () => {
            dialogRef.close();
          }
        }
      })      
    }); 
  }

    getParamsOtherClass(className: string, attributeName: string): string {
    // const classNameFirstLetterUpperCase = className.charAt(0).toUpperCase() + className.slice(1);    const classNameFirstLetterLowerCase = className.charAt(0).toLowerCase() + className.slice(1);
    const classValue = this.resourceForm.get(className).value;
    if(classValue[attributeName]) {
      return classValue[attributeName] || '';
    }

    if (typeof classValue === 'string' || typeof classValue === 'number') {
      let url = environment.backendUrl + `/${className}/` + classValue;
      this.http.get(url).subscribe((response: any) => {
        const attributeValue = response[attributeName];
        if (attributeValue) {
          return attributeValue;
        }
      });
    }

    return '';
  }

  getUrlParameters(urlString: string | null | undefined): ParsedUrl {
  const partesUrl = urlString.split('?');
  const caminho = partesUrl[0];
  const parametros: QueryParam[] = [];

  if (partesUrl.length > 1 && partesUrl[1]) {
    const queryString = partesUrl[1];
    const paresDeParametros = queryString.split('&');

    for (const par of paresDeParametros) {
      const [nomeVariavelUrl, placeholderComChaves] = par.split('=');

      if (nomeVariavelUrl && placeholderComChaves) {
        let placeholderSemChaves = '';
        if (placeholderComChaves.startsWith('{') && placeholderComChaves.endsWith('}')) {
          placeholderSemChaves = placeholderComChaves.slice(1, -1);
        } else {
          // Caso o placeholder não esteja entre chaves, tratar como está
          placeholderSemChaves = placeholderComChaves;
        }

        const partesPlaceholder = placeholderSemChaves.split('.');
        let classeOuObjeto: string | undefined = undefined;
        let atributo: string;

        if (partesPlaceholder.length > 1) {
          classeOuObjeto = partesPlaceholder[0];
          atributo = partesPlaceholder.slice(1).join('.'); // Caso haja mais de um ponto no atributo
        } else {
          atributo = partesPlaceholder[0];
        }

        parametros.push({
          attributeName: atributo,
          className: classeOuObjeto || '',
          variableName: nomeVariavelUrl
        });
      }
    }
  }
  this.pathToGo = caminho;
  return {
    path: caminho,
    parameters: parametros
  };
}

    parseUrlString(urlToParse: string): string {
    if (!urlToParse || urlToParse.trim() === '') {
      return '';
    }

    const parsedUrl = this.getUrlParameters(urlToParse);
    let url = parsedUrl.path;

    parsedUrl.parameters.forEach((param, index) => {
      let placeholder = '';
      try {
        if(param.className !== this.className) {
          placeholder = this.getParamsOtherClass(param.className, param.attributeName);
        } else {
          placeholder = this.resourceForm.get(param.attributeName)?.value || '';
        }

      } catch (error) {
        console.error(`Erro ao obter o valor do parâmetro ${param.variableName}:`, error);
        placeholder = ''; // Define um valor padrão ou vazio em caso de erro
      }
      
      url += (index === 0 ? '?' : '&') + `${param.variableName}=${placeholder}`;
    });

    return url;
  }

async importFromSameSubform(classImported: {nameClass: string, jsonPath: string, attributeClass: string, links: Link | null}) {
  let url = this.parseUrlString(classImported.links?.addressDestination || '');
  this.currentMapping = classImported.links?.mapping || {};

  // Validação da URL
  if (url.endsWith('=') || url.includes('=&')) {
    this.matSnackBar.open('URL de importação malformada: parâmetros incompletos.', 'Fechar', {
      duration: 3000,
    });
    return;
  }
  
  if (!url) {
    this.matSnackBar.open('URL de importação inválida.', 'Fechar', {
      duration: 3000,
    });
    return;
  }

  const componentType = this.consultaService.getComponentByPath(this.pathToGo);
  const queryFromUrl = '?' + url.split('?')[1]; // Extrai apenas a parte da query string
  const dialogRef = this.matDialog.open(componentType, {
      width: '80%',
      height: '80%',
      data: queryFromUrl,
      panelClass: 'custom-dialog-container',
      autoFocus: false
  });


  if (dialogRef) {
    dialogRef.afterClosed().subscribe(result => {
        if(!result) {
          return;
        } else {
          const filledResult = this.fillSubFormWithResult(result, this.currentMapping);
          if (filledResult) {
              const attributeConfig = this.dataToCreatePage?.attributes?.[this.index];
              const subformClassName = attributeConfig?.className;

              if (!subformClassName) {
                this.matSnackBar.open('Classe da subform não definida.', 'Fechar', {
                  duration: 3000,
                });
                return;
              }

              const jsonPath = `${environment.jsonPath}${this.lowerFirstLetter(subformClassName)}.json`;
              this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: IPageStructure) => {
                this.subClassJSONDictionary = JSONDictionary;
                this.processImportedItems(filledResult, JSONDictionary);
              });
          } else {
            this.matSnackBar.open('Erro ao preencher o subformulário com os resultados.', 'Fechar', {
              duration: 3000,
            });
          }
        }
    });
  }
}
fillSubFormWithResult(result: any[], mapping: { [key: string]: string }) {
  if (!result || !Array.isArray(result) || !mapping) {
    return [];
  }
  
  return result.map(item => {
    let newObject: any = {};
    
    for (const [formControlName, resultKey] of Object.entries(mapping)) {
      const value = this.getNestedProperty(item, resultKey);
      
      if (value !== undefined) {
        // Se o formControlName também tem ponto, criar estrutura aninhada
        this.setNestedProperty(newObject, formControlName, value);
      } else {
        console.warn(`Chave ${resultKey} não encontrada no resultado.`);
      }
    }
    
    return newObject;
  });
}

  /**
   * Obtém uma propriedade aninhada usando notação de ponto
   * @param obj Objeto fonte
   * @param path Caminho da propriedade (ex: 'veiculo.id')
   * @returns Valor da propriedade ou undefined se não encontrar
   */
  private getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) {
      return undefined;
    }
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Define uma propriedade aninhada usando notação de ponto
   * @param obj Objeto alvo
   * @param path Caminho da propriedade (ex: 'veiculo.id')
   * @param value Valor a ser definido
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    if (!lastKey) {
      return;
    }
    
    // Navega/cria a estrutura até o penúltimo nível
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    // Define o valor na propriedade final
    target[lastKey] = value;
  }

  importarCsv(){
    const dialogRef = this.matDialog.open(ImportCsvComponent, {
      data: {
        className: this.className,
        jsonConfig: this.subClassJSONDictionary,
        foreignKeyName: this.foreignKeyName,
      },
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe((result: ImportCsvResult) => {
      if(!result){
        return;
      } else {
        result.data = result.data.map(item => {
            const parentId = this.resourceForm.get('id')?.value;
            if (parentId) {
            item[this.foreignKeyName] = parentId;
            } else {
              delete item[this.foreignKeyName]
            }
          return item;
        });
        this.processImportedItems(result.data, this.subClassJSONDictionary);
      }
    });
  }

  getTotalPages(): number {
    if (!this.itemsDisplayed) return 1;
    return Math.ceil(this.itemsDisplayed.length / this.itemsPerPage);
  }

  getItemsForCurrentPage(): any[] {
    if (!this.itemsDisplayed) return [];
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.itemsDisplayed.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.renderItems();
    }
  }

  /**
   * Realiza o download de todos os dados da lista em CSV ou XLSX
   * @param format Formato do arquivo: 'csv' ou 'xlsx'
   */
  downloadData(format: 'csv' | 'xlsx') {
    this.isLoading = true;

    // Determina a URL baseada no formato
    const downloadUrl = `${this.apiUrl}/exportDocument/${format}`;

    const parentId = this.resourceForm.get('id')?.value;

    const searchParameters = {
      conditions: [],
      filterValues: [{
        variableInfo: {
          className: undefined,
          fieldDisplayedInLabel: undefined,
          fieldName: this.foreignKeyName,
          fieldType: 'string'
        },
        filterParameter: {
          parameter: 'equal',
          value: parentId
        }
      }]
    };

    // Faz a requisição POST para o endpoint de download
    this.http.post(environment.backendUrl + '/' + downloadUrl, searchParameters, { 
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
        this.matSnackBar.open('Erro ao fazer download dos dados.', 'Fechar', {
          duration: 3000,
        });
        this.isLoading = false;
      }
    });
  }

  buildSearcInputField(): void {
    this.searchableFields = this.subClassJSONDictionary?.config?.searchableFields || [];
    this.sortableFields = this.subClassJSONDictionary?.config?.sortableFields || [];
    this.filterParameters = this.buildFilterParameters(this.subClassJSONDictionary.attributes);
  }

  buildFilterParameters(fields: IPageStructureAttribute[]): FilterParameters[]{
    let filterParameters: FilterParameters[] = [];

    for (let index = 0; index < fields.length; index++) {
      if (fields && fields.length > 0) {
        filterParameters.push({ fieldName: fields[index].name, fieldType: fields[index].type, className: fields[index]?.className, fieldDisplayedInLabel: fields[index]?.fieldDisplayedInLabel })
      } else {
        filterParameters.push({ fieldName: fields[index].name, fieldType: fields[index].type });
      }

    }

    return filterParameters;
  }

  // Métodos para o search-input-field
  fetchWithCustomQuery(searchParameters: any, apiUrl: string, maxDisplayedItems: number, page: number): void {
    const parentId = this.resourceForm.get('id')?.value;
    
    // Initialize searchParameters if null or undefined
    if (!searchParameters) {
      searchParameters = {
        parameters: {
          filterValues: [],
          conditions: []
        }
      };
    }
    
    // Ensure parameters object exists
    if (!searchParameters.parameters) {
      searchParameters.parameters = {
        filterValues: [],
        conditions: []
      };
    }
    
    // Ensure filterValues array exists
    if (!searchParameters.parameters.filterValues) {
      searchParameters.parameters.filterValues = [];
    }
    
    // Ensure conditions array exists
    if (!searchParameters.parameters.conditions) {
      searchParameters.parameters.conditions = [];
    }
    
    const filterValuesLength = searchParameters.parameters.filterValues.length;

    searchParameters.parameters.filterValues.push({
        variableInfo: {
          className: undefined,
          fieldDisplayedInLabel: undefined,
          fieldName: this.foreignKeyName,
          fieldType: 'entity'
        },
        filterParameter: {
          parameter: 'in',
          value: [parentId]
        }
    });

    
    // Adiciona operadores "or" entre os filtros, exceto o primeiro que é "and"
    for (let i = 0; i < filterValuesLength -1; i++) {
      searchParameters.parameters.conditions.push("or");
    }
    searchParameters.parameters.conditions.push("and");
    
    this.http.post(environment.backendUrl + '/' + apiUrl + "/custom", searchParameters).pipe(take(1)).subscribe((itemsFromApi: any) => {
      if (itemsFromApi && itemsFromApi.items) {
        this.itemsDisplayed = itemsFromApi.items;
        this.renderItems();
      } else {
        console.warn('Nenhum item encontrado no API.');
      }
    });
  }

  fetchWithSortedQuery(sortOrders: SortOption[] | null, apiUrl: string, maxDisplayedItems: number, page: number): void {
    // TODO: Implementar busca com ordenação
    this.getDataFromEagerLoading().subscribe();
  }

  removeAllComponentsOnView(): void {
    // Limpa a visualização dos componentes
    this.itemsDisplayed = [];
    this.renderItems();
  }



  clearSearchInputEvent(): void {
    // Limpa o campo de busca e recarrega os dados originais
    this.getDataFromEagerLoading().subscribe();
  }

}
