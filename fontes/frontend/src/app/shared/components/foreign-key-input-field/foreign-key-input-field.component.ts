import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DefaultListComponent, IDefaultListComponentDialogConfig } from '../default-list/default-list.component';
import { Subject, take, takeUntil } from 'rxjs';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { environment } from 'environments/environment';
import { FormGeneratorService } from 'app/shared/services/form-generator.service';
import { FormSpaceBuildComponent } from '../form-space-build/form-space-build.component';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';

enum ISelectionOption {
  add,
  set
}

@Component({
  selector: 'app-foreign-key-input-field',
  templateUrl: './foreign-key-input-field.component.html',
  styleUrls: ['./foreign-key-input-field.component.scss']
})

export class ForeignKeyInputFieldComponent implements OnDestroy, AfterViewInit, OnInit {
  /**
   * Titulo apresentado em cima do campo de inserção de dados
   */
  @Input() label: string;
  /**
   * Quantidade máxima de letras.\
   * Exemplo: 255.
   */
  @Input() charactersLimit: number;
  /**
   * Texto que é apresentado caso o campo esteja vazio.\
   * Exemplo: "Insira o valor aqui".
   */
  @Input() placeholder: string = "";
  /**
   * Ícone svg para ser apresentado no campo.
   */
  @Input() svgIcon: string | null;
  /**
   * É preciso preencher o campo.\
   * Exemplo: true.
   */
  @Input() isRequired: boolean = false;
  /**
   * Define qual variável será usada para ser apresentado no campo de inserção.
   * @example "name"
   */
  @Input() fieldDisplayedInLabel: string;
  /**
   * Nome da classe na qual a variável desse componente pertence.
   * @example "Produtos"
   */
  @Input() className: string | null;
  /**
   * Nome da variável desse componente no formulário
   * @example "detalhes"
   */
  @Input() fieldName: string | null;
  /**
   * Esse é nome dessa entidade/classe
   */
  @Input() fieldEntityName: string | null;
  /**
   * Dados que orientam a criação da pagina
   */
  @Input() dataToCreatePage: IPageStructure | null;
  @Input() value: any;
  /**
   * Lista de itens que foram selecionados.
   */
  @Input() index: number;
  /**
  * Condicao de visibilidade do campo.
  */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;
  /**
   * Campo no formulário que receberá os dados dos valores selecionados.
   */
  public inputValue: FormControl<object | object[]> = new FormControl<object | object[]>(null);
  /**
   * Valor que será apresentado no campo de preenchimento.
   * Como é uma chave estrangeira, apresentar o ID do item não é algo apresentável para o usuário.
   * @var fieldDisplayedInLabel Variável que definirá qual atributo da classe será apresentado.
   */
  displayedValue: string[] = [""];
  /**
   * Quantitade máxima de valores que podem ser selecionados.
   * @example "1"
   * Por padrão é 1
   */
  private _selectedItemsLimit = 1;

  @Input()
  set selectedItemsLimit(value: number | undefined) {
    this._selectedItemsLimit = value === undefined ? 1 : value;
  }
  get selectedItemsLimit(): number {
    return this._selectedItemsLimit;
  }
  /**
   * Define se os itens serão armazenados em array ou é um objeto.
   */
  isObjectStoredInArray: boolean = false;
  /**
   * É obrigatório preencher esse campo.
   * @example "true" ou "false"
   */
  fieldIsRequired: boolean = false;
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();
  /**
   * Se permite editar os campos
   */
  enableToEdit: boolean = false;

  constructor(
    private matDialog: MatDialog,
    private formGeneratorService: FormGeneratorService,
    private http: HttpClient,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.dataToCreatePage == null) {
      this.getDataToCreatePage();
    }
    this.checkConditional();
  }

  checkConditional() {
    if (this.conditionalVisibility) {
      // Verifica o valor inicial
      let initialFieldValue = this.resourceForm.get(this.conditionalVisibility.field)?.value;

      if (initialFieldValue && typeof initialFieldValue === 'object' && initialFieldValue.id) {
        initialFieldValue = initialFieldValue.id;
      }
      if (initialFieldValue !== null && typeof initialFieldValue !== 'string') {
        initialFieldValue = initialFieldValue.toString();
      }
      if (this.conditionalVisibility.values.includes(initialFieldValue)) {
        if (this.inputValue.disabled) {
          this.inputValue.enable();
        }
      } else {
        if (!this.inputValue.disabled) {
          this.inputValue.disable();
        }
      }

      // Observa mudanças no valor do resourceForm
      this.resourceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(formValues => {
        // Verifica todas as alterações dos campos de input 
        let fieldValue = formValues[this.conditionalVisibility.field];
        // Verifica se o valor é um objeto e pega o id
        if (fieldValue && typeof fieldValue === 'object' && fieldValue.id) {
          fieldValue = fieldValue.id;
        }
        // Transforma em string caso nao seja
        const fieldValueStr = fieldValue?.toString();
        if (this.conditionalVisibility.values.includes(fieldValueStr)) {
          // Caso o valor do fieldValue seja igual a algum de dentro do values ai é habilitado
          if (this.inputValue.disabled) {
            this.inputValue.enable();
          }
        } else {
          if (!this.inputValue.disabled) {
            this.inputValue.disable();
          }
        }
      });
    }
  }

  ngAfterViewInit(): void {
    const formControl = this.resourceForm.controls[this.fieldName] as FormControl;

    if (!formControl) {
      console.error("Erro ao preencher dados no formControll");
      return;
    }

    this.setDisplayedValue(formControl, this.fieldDisplayedInLabel);
    /*
    if (this.inputValue.value != null) {
      this.setDisplayedValue(this.inputValue, this.fieldDisplayedInLabel);
    }
    this.inputValue.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        this.setDisplayedValue(this.inputValue, this.fieldDisplayedInLabel);
      }
    });
    */

    // Verifica a condição de visibilidade após a inicialização da visualização
    this.checkConditional();
  }

  /**
   * Função responsável por definir as informações que serão apresentadas no campo de inserção do componente atual
   * @param inputValue FormControl que armazena os valores do formulário
   * @param valueDisplayed Valores que são apresentados no campo de inserção do componente atual
   */
  setDisplayedValue(inputValue: FormControl, valueDisplayed: string) {
    var searchableProperty: string;
    var hasProperty: boolean;

    //Se não tiver nada ele só define vazio no campo apresentável
    if (inputValue.value == null || inputValue.value.length == 0) {
      this.displayedValue = [""];
      this.enableToEdit = false;
      return;
    };
    this.enableToEdit = true;

    //Verifica se o item contido na FormControl é um array
    if (inputValue.value instanceof Array) {
      hasProperty = inputValue.value.some(obj => obj.hasOwnProperty(valueDisplayed) == true);
    } else {
      hasProperty = inputValue.value.hasOwnProperty(valueDisplayed)
    }

    if (hasProperty == true) {
      searchableProperty = this.fieldDisplayedInLabel;
    } else {
      if (inputValue.value instanceof Array) {
        searchableProperty = this.getFirstNonIdKey(inputValue.value[0]);
      } else {
        searchableProperty = this.getFirstNonIdKey(inputValue.value);
      }
    }

    //Verifica se o item contido na FormControl é um array
    if (inputValue.value instanceof Array) {

      let _displayedValues: any[] = [];

      for (let inputValueListIndex = 0; inputValueListIndex < inputValue.value.length; inputValueListIndex++) {
        if (inputValueListIndex == 0) {
          _displayedValues.push(inputValue.value[inputValueListIndex][searchableProperty] as string);
        } else {
          _displayedValues.push(" " + inputValue.value[inputValueListIndex][searchableProperty] as string);
        }
      }

      this.displayedValue = _displayedValues;

    } else {
      this.displayedValue = inputValue.value[searchableProperty];
    }
  }

  openDefaultListToSelectItems() {

    const defaultJSONPath: string = environment.defaultJSONPath;

    //No caso de entrar pela lista ele vai pegar o fieldName para abrir
    const classJSONPath: string = defaultJSONPath + this.fieldEntityName.charAt(0).toLowerCase() + this.fieldEntityName.slice(1) + '.json';

    // const classJSONPath: string = defaultJSONPath + this.className.charAt(0).toLowerCase() + this.className.slice(1) + '.json';


    const loadingDialogRef = this.matDialog.open(LoadingDialogComponent, {
      maxHeight: "95vh", // Altura máxima de 90% da tela
      minHeight: "80vh",
      maxWidth: "95vw",
      minWidth: "80vw",
    });

    this.http.get<IPageStructure>(classJSONPath).pipe(take(1)).subscribe({
      next: (pageStructure: IPageStructure) => {

        let attributeList = [];

        pageStructure.attributes.forEach((attribute) => {
          let childAttributes = [];
          attributeList.push({ name: attribute.name, type: attribute.type, fieldList: childAttributes, className: attribute.className, fieldDisplayedInLabel: attribute.fieldDisplayedInLabel });

        });

        const config: IDefaultListComponentDialogConfig = {
          itemsDisplayed: [],
          columnsQuantity: 3,
          //TODO remover esses dois
          displayedfieldsName: pageStructure.attributes.map(attribute => attribute.name),
          fieldsType: pageStructure.attributes.map(attribute => attribute.type),

          fields: attributeList,
          objectDisplayedValue: pageStructure.attributes.map(attribute => attribute.fieldDisplayedInLabel),
          userConfig: null,
          selectedItemsLimit: this.selectedItemsLimit,
          apiUrl: pageStructure.config.apiUrl,
          searchableFields: pageStructure.config.searchableFields,
          isSelectable: true,
          className: this.className,
          isAbleToCreate: false,
          isAbleToEdit: false,
          isAbleToDelete: false,
          dataToCreatePage: this.dataToCreatePage,
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

        dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
          const newSelectedItemList = this.selectItems(this.inputValue, result, ISelectionOption.set);
          this.setNewValueToInput(newSelectedItemList);
        });

        dialogRef.disableClose = true;

      },
      error(error: any) {

      },
    });

  }


  openSelectableItemsListDialogToEditItems() {

    var items: Object[] | object;
    if (this.inputValue.value instanceof Array == false) {
      items = [this.inputValue.value];
    } else {
      items = this.inputValue.value;
    }

    let attributeList = [];

    this.value.propertiesAttributes.forEach((attribute) => {
      let childAttributes = [];

      if (attribute.properties) {
        attribute.properties.forEach((attribute) => {
          childAttributes.push({ name: attribute.name, type: attribute.type });
        });
      }

      attributeList.push({ name: attribute.name, type: attribute.type, fieldList: childAttributes });

    });

    const config: IDefaultListComponentDialogConfig = {
      itemsDisplayed: items,
      columnsQuantity: 2,
      displayedfieldsName: this.value.propertiesAttributes.map(attribute => attribute.name),
      fieldsType: this.value.propertiesAttributes.map(attribute => attribute.type),

      fields: attributeList,

      objectDisplayedValue: this.value.propertiesAttributes.map(attribute => attribute.displayedfieldsName),//TODO ver se funciona
      userConfig: null,
      selectedItemsLimit: this.selectedItemsLimit,
      apiUrl: this.value.apiUrl,
      searchableFields: null,
      isSelectable: true,
      className: this.fieldName,
      isAbleToCreate: false,
      isAbleToEdit: true,
      isAbleToDelete: false,
      dataToCreatePage: this.dataToCreatePage,
      useFormOnDialog: true,
      isEnabledToGetDataFromAPI: false,

      //TODO arrumar isso
      hasCustomFunctionButton: false,
      customFunction: null,
      customFunctionButtonIconName: null
    }

    const dialogRef = this.matDialog.open(DefaultListComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: config
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result == null) return;
      const newSelectedItemList = this.selectItems(this.inputValue, result, ISelectionOption.set);
      this.setNewValueToInput(newSelectedItemList);
    });
  }

  /**
   * Função que irá remover os itens que foram selecionados.
   */
  removeItensOnInputField() {
    this.inputValue.setValue(null);
    this.displayedValue = [null];
  }

  /**
   * Abre o formulário em popUp/dialog tanto para criação.
   */
  openFormDialogToCreateItem() {
    let nameClass = this.dataToCreatePage.attributes[this.index].className;
    nameClass = nameClass.charAt(0).toLowerCase() + nameClass.slice(1);

    let jsonPath = environment.jsonPath + nameClass + ".json";

    this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: any) => {

      const dialogRef = this.matDialog.open(FormSpaceBuildComponent, {
        id: this.dataToCreatePage.attributes[this.index].className + '-form-dialog',
        maxHeight: '95vh', // Altura máxima de 90% da tela
        width: '80vw',      // Largura de 80% da tela
        data: {
          dataToCreatePage: JSONDictionary,
          currentFormAction: 'new',
          submitFormFunction: this.submitForm.bind(this),
          formBuilder: this.resourceForm,
          returnFormFunction: () => {
            dialogRef.close();
          }
        }
      })
    });
  }

  submitForm(JSONDictionary: IPageStructure, item: FormGroup) {
    if (item == null) return;

    if (item.invalid) {
      item.markAllAsTouched();
      this.matSnackBar.open("Preencha todos os campos obrigatórios", "Fechar", {
        duration: 5000
      });
      return;
    }

    item = item.value;
    item = this.objectTratament(item);
    this.inputValue.setValue(item);
    this.matDialog.getDialogById(this.dataToCreatePage.attributes[this.index].className + '-form-dialog')?.close();
    this.displayedValue = [item[this.fieldDisplayedInLabel]];
  }

  /**
 * Realizar uma alteração nos dados do formulário, removendo objetos e substituindo somente pelos IDs
 * @param item Formulário
 */
  objectTratament(item) {
    for (let field in item) {
      if (item[field] instanceof Object) {
        if (item[field] instanceof Array) {
          item[field] = item[field].map((value) => value.id == undefined || value.id == null ? value : value.id);
        } else {
          if (item[field].id == undefined || item[field].id == null) {
            continue;
          }
          item[field] = item[field].id;
        }
      }
    }
    return item;
  }

  /**
   * Função que faz o controle da seleção de itens, controlando quantos itens poderão ser selecionados.
   * @param formControl Controlador de formulário que fica armazenando os valores selecionados
   * @param selectedItemList Array com itens que serão selecionados.
   * @param selectionOption Se ele irá adicionar mais itens ou irá substituir os itens.
   * @example "ISelectionOption.add" irá adicionar mais itens na seleção o "ISelectionOption.set" irá substituir os itens da seleção
   */
  selectItems(formControl: FormControl, selectedItemList: object[], selectionOption: ISelectionOption): any[] | null {
    if (selectedItemList == null) {
      //TODO fazer mensagem de erro indicando que nada foi selecionado
      return [];
    };

    let currentSelectedItensQuantity: number = 0;

    if (formControl.value == null) {
      currentSelectedItensQuantity = 0;
    } else {
      currentSelectedItensQuantity = Array.isArray(formControl.value) ? formControl.value.length : 0;
    }

    if (selectionOption == ISelectionOption.add) {

      //Se a quantidade de itens anteriormente selecionados mais os novos adicionados ultrapassar, não adiciona nada
      if (currentSelectedItensQuantity + selectedItemList.length > this.selectedItemsLimit) {
        return [];
      };

      //Se já tiver item selecionado ele 
      if (currentSelectedItensQuantity > 0) {
        //Remove os itens duplicados
        let remainingItems = selectedItemList.filter(item => !Array.isArray(formControl.value) || !formControl.value.includes(item));
        selectedItemList.push(...remainingItems);
      }

    } else if (selectionOption == ISelectionOption.set) {
      // Se a quantidade de itens selecionados for maior que o limite vai adicionar nenhum item
      if (selectedItemList.length > this.selectedItemsLimit) {
        //TODO mandar mensagem de erro
        return [];
      };
    }

    // this.inputValue.setValue(newItems);
    // this.setNewValueToInput(selectedItemList);
    return selectedItemList;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }


  setNewValueToInput(newItems: object[],) {
    let displayedValues: string[] = []; //Valores apresentáveis dos objetos
    let searchableProperty: string;

    const hasProperty = newItems.some(obj => obj.hasOwnProperty(this.fieldDisplayedInLabel) == true);

    if (hasProperty == true) {
      searchableProperty = this.fieldDisplayedInLabel;
    } else {
      searchableProperty = this.getFirstNonIdKey(newItems[0]);
    }

    if (newItems.length == 1) {
      this.inputValue.setValue(newItems[0]);
      this.displayedValue = [newItems[0][searchableProperty]];
      return;
    }

    for (let newItemsListIndex = 0; newItemsListIndex < newItems.length; newItemsListIndex++) {
      if (newItemsListIndex == 0) {
        displayedValues.push(newItems[newItemsListIndex][searchableProperty] as string);
      } else {
        displayedValues.push(" " + newItems[newItemsListIndex][searchableProperty] as string);
      }
    }

    this.inputValue.setValue(newItems);
    this.displayedValue = displayedValues;
  }

  getFirstNonIdKey(obj: Object): string | null {
    const keys = Object.keys(obj);
    for (let key of keys) {
      if (key !== 'id' && key !== '_id') {
        return key;
      }
    }
    return null; // Se não houver nenhuma chave além de 'id'
  }

  /**
   * Obtem os dados para criação de paginas para poder abrir listas e formulários
   */
  getDataToCreatePage() {
    let nameClass = this.className[0].toLowerCase() + this.className.slice(1);
    let jsonPath = environment.frontendUrl + "/assets/dicionario/" + nameClass + ".json";
    this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: IPageStructure) => {
      this.dataToCreatePage = JSONDictionary;
    });
  }
}