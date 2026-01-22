import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Inject, Input, Optional, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultCardComponent } from '../default-card/default-card.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConsultaFormComponent } from './consulta-form/consulta-form.component';
import { environment } from 'environments/environment';
import { IPageStructureAttribute } from 'app/shared/models/pageStructure';
import { SelectableCardComponent } from '../selectable-card/selectable-card.component';
import { Subject, take, takeUntil } from 'rxjs';
import { LocalStorageService } from 'app/shared/services/local-storage.service';

@Component({
  selector: 'app-default-consulta',
  templateUrl: './default-consulta.component.html',
  styleUrls: ['./default-consulta.component.scss']
})
export class DefaultConsultaComponent {

  @ViewChild('placeToRender', { read: ViewContainerRef })
  target!: ViewContainerRef;

  /**
   * Nome da consulta
   */
  @Input() name: string;

  /**
   * Descrição da consulta
   */
  @Input() descricao: string;

  /**
   * URL da API
   */
  @Input() apiUrl: string;

  /**
   * Parametros da consulta
   */
  @Input() parameters: IPageStructureAttribute[];

  /**
   * Retorno da consulta
   */
  @Input() return: IPageStructureAttribute[];

  /**
   * Dados dos parâmetros para realizara busca na API
   */
  urlToExportDocument: string;
  /**
   * Query para filtrar os dados da consulta.
   * Exemplo: 'nome=Maria&idade=44'.
   * Se for passado, irá buscar os dados da API com essa query.
   */
  @Input() query: string | null;
  /** 
  * Nome da classe/entidade/tabela na qual essa consulta é relacionada
  */
  @Input() className!: string;
  /**
   * Array com os itens que serão apresentados. @example [{"name":"Marie", "age":22}, {"name":"Josef", "age":32}]
   */
  itemsDisplayed: any[] = []

  viewMode: string = 'card'; // Definindo o modo padrão como 'list'
  isLoading: boolean = true;
  componentsCreatedList: any[] = [];
  inputValue: FormControl<object[]> = new FormControl<object[]>([]);
  formGroup: FormGroup = new FormGroup({
    inputValue: this.inputValue
  });;
  resourceForm: FormGroup = new FormGroup({});
  isSelectable: boolean = false;
  selectedItemsLimit: number | null = null;
  selectedItems: any[] = [];
  selectAllCheckBox: boolean = false;
  private ngUnsubscribe = new Subject();
  consultaFormReference: MatDialogRef<ConsultaFormComponent> | null = null;
  totalItems: number = 25;
  maxDisplayedItems: number = 25; // Número máximo de itens a serem exibidos
  currentPageIndex: number = 1; // Índice da página atual
  showGetParametersButton: boolean = true;

  /**
   * Indica se é possível exportar dados buscados na API para um csv ou aquivo tipo planilha
   */
  @Input() isAbleToExportOnDocument: boolean = true;
  private exportLoadingEnabled: boolean = false;

  constructor(
    private http: HttpClient,
    private matSnackBar: MatSnackBar,
    private matDialog: MatDialog,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    @Optional() public dialogRef?: MatDialogRef<DefaultConsultaComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: string
    
    ) { }

  ngAfterViewInit(): void {
    this.getParameters();

    //this.loadLastSearchParametersInLocalStorage(this.name, this.resourceForm);
  }

  /**
  * Função que irá buscar os parametros da consulta.
  */
  getParameters() {
    if (window.location.search) {
      this.showGetParametersButton = false;
      this.getParametersFromUrl(window.location.search);
    } else if (this.data) {
      this.showGetParametersButton = false;
      this.isSelectable = true;
      this.getParametersFromUrl(this.data);
    } else {
      if (!window.location.search) {
        this.getParametersFromForm();
      }
    }
  }

  getParametersFromUrl(url: string) {
    let resourceForm = this.formBuilder.group({});

    const urlParams = new URLSearchParams(url);
    const parameters: any = {};
    let hasAllParameters = true;
    this.parameters.forEach((param) => {
      if (urlParams.has(param.name)) {
        parameters[param.name] = urlParams.get(param.name);
        resourceForm.addControl(param.name, new FormControl(urlParams.get(param.name)));
      }
      if (!urlParams.has(param.name)) {
        hasAllParameters = false;
      }
    });
    if (hasAllParameters) {
      this.getDataFromAPI(parameters, resourceForm);
    } else {
      this.getParametersFromForm();
    }
  }

  getParametersFromForm() {
    let resourceForm: FormGroup = new FormGroup({})
    const dialogRef = this.matDialog.open(ConsultaFormComponent, {
      panelClass: 'consulta-form',
      data: {
        submitFormFunction: this.getDataFromAPI.bind(this),
        parameters: this.parameters.map((param, index) => {
          return {
            ...param,
            mask: null,
            target: null,
            resourceForm: resourceForm,
            fieldName: param.name,
            fieldType: param.type,
            className: param.className,
            isRequired: false,
            labelTittle: param.name,
            dataToCreatePage: null,
            fieldDisplayedInLabel: param.fieldDisplayedInLabel,
            index: index,
            optionList: param.optionList,
            selectItemsLimit: param.selectItemsLimit,
          }
        }),
        resourceForm: resourceForm,
        returnFormFunction: () => {
          // Captura os valores atuais do formulário no momento do fechamento
          const currentFormValues = resourceForm.value;
          dialogRef.close(currentFormValues);
        }
      }
    });

    if (this.consultaFormReference) {
      this.consultaFormReference.close();
    }
    this.consultaFormReference = dialogRef;
  }

  getDataFromAPI(parameters: any, resourceForm: FormGroup) {
    if (!resourceForm.valid) {
      resourceForm.markAllAsTouched();
      this.matSnackBar.open('Preencha todos os campos obrigatórios', 'Fechar', {
        duration: 5000
      });
      return;
    }

    this.resourceForm = resourceForm;

    if (this.consultaFormReference) {
      this.consultaFormReference.close();
    }

    resourceForm = this.convertFormGroupDatesToISO(resourceForm);

    const url = this.getUrlWithParameters(parameters);
    this.urlToExportDocument = this.getUrlWithParametersToDownloadDocument(parameters);
    this.http.get(url).pipe(take(1)).subscribe({
      next: (data: { count: number, data: any[] }) => {
        this.itemsDisplayed = data.data;
        this.totalItems = data.count;
        this.createItemsOnList(this.itemsDisplayed);
        this.isLoading = false;
        this.totalItems = data.count;

        this.saveLastSearchParametersInLocalStorage(this.name, resourceForm);
      },
      error: (error: any) => {
        this.matSnackBar.open('Erro ao buscar dados da API', 'Fechar', {
          duration: 5000
        });
      },
    });
  }

  saveLastSearchParametersInLocalStorage(key: string, formGroup: FormGroup) {
    this.localStorageService.set("lastSearch-" + key, formGroup.value);
  }

  //TODO esses dados de formGroup devem ser passados para dentro do componente de formulário. Os formulários devem aceitar valores de preenchimento após a construção dos campos
  loadLastSearchParametersInLocalStorage(key: string, formGroup: FormGroup): FormGroup {
    const loadedData = this.localStorageService.get("lastSearch-" + key);
    if (!loadedData) {
      console.error("Error to load last search parametes in memory.");
      return null;
    }

    formGroup.setValue(loadedData);

    return formGroup;
  }

  /**
   * Altera o formato das datas que serão enviadas em JSON para API para ISO 8601 (pradrão entre APIs)
   * @param resourceForm 
   */
  convertFormGroupDatesToISO(resourceForm: FormGroup): FormGroup {
    Object.keys(resourceForm.value).forEach(key => {
      if (resourceForm.value[key] instanceof Date) {
        resourceForm.value[key] = resourceForm.value[key].toISOString();
      }
    });

    return resourceForm;
  }

  getUrlWithParameters(parameters: any) {
    let url = environment.backendUrl + '/api/consulta/' + this.apiUrl + '?' + 'pageSize=' + this.maxDisplayedItems + '&page=' + this.currentPageIndex + '&includeCount=true&includeAll=false&';
    for (let field in parameters) {
      url += field + '=' + parameters[field] + '&';
    }

    return url;
  }

  getUrlWithParametersToDownloadDocument(parameters: any) {
    let url = environment.backendUrl + '/api/exportDocument/' + this.apiUrl + '?';
    for (let field in parameters) {
      url += field + '=' + parameters[field] + '&';
    }
    return url;
  }

  /**
 * Função que irá instanciar os components Card na tela, com os dados dos itens.
 * @param itemsDisplayed Array com os itens que serão apresentados. @example [{"name":"Marie", "age":22}, {"name":"Josef", "age":32}]
 */
  createItemsOnList(itemsDisplayed: any[]) {
    this.componentsCreatedList = [];
    this.removeAllComponentsOnView();
    for (let index = (this.currentPageIndex-1)*this.maxDisplayedItems; index < this.maxDisplayedItems*this.currentPageIndex; index++) {
      if(index > this.totalItems - 1) return;
      let componentCreated: any;
      if (this.isSelectable) {
        componentCreated = this.target.createComponent(SelectableCardComponent).instance;
      }
      else {
        componentCreated = this.target.createComponent(DefaultCardComponent).instance;
      }

      this.componentsCreatedList.push(componentCreated);

      componentCreated.columnsQuantity = 3;
      componentCreated.objectDisplayedValue = this.return.map((field) => field.fieldDisplayedInLabel).join(', ');
      componentCreated.userConfig = null;
      componentCreated.itemDisplayed = itemsDisplayed[index];
      componentCreated.displayedfieldsName = this.return.map((field) => field.name);
      componentCreated.className = this.className;

      componentCreated.fieldsType = this.return.map((field) => field.type);
      componentCreated.isEditable = false;
      if (this.isSelectable == true) {
        this.selectableFieldController(componentCreated);
        componentCreated.eventClickToEdit
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data) => {
          });
      }
    }
  }

  selectableFieldController(componentCreated: SelectableCardComponent) {
    if (this.selectedItemsLimit == null) {
      this.selectedItemsLimit = this.itemsDisplayed.length;
    }

    componentCreated.eventOnSelect
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        this.checkItem(this.selectedItemsLimit, componentCreated, data);
      });
  }

  checkItem(
    selectedItemsLimit: number,
    componentCreated: SelectableCardComponent,
    data
  ) {
    const dataIsSelected: boolean = this.selectedItems.some(
      (item) => item === data
    );

    if (this.selectedItems.length == this.itemsDisplayed.length - 1) {
      this.selectAllCheckBox = true;
    }

    //Se o componente não foi selencionado
    if (dataIsSelected == false) {
      if (selectedItemsLimit != null) {
        //Se o limite de itens selecionados não foi ultrapassado
        if (this.selectedItems.length < selectedItemsLimit) {
          this.selectedItems.push(data); //Seleciona o item
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
      this.selectedItems = this.selectedItems.filter((item) => item !== data);
      componentCreated.isSelected = false;
    }
  }

  private removeAllComponentsOnView() {
    this.target.clear();
  }

  sendDataToForm(data: any[]) {
    if (data.length === 0) {
      this.matSnackBar.open('Nenhum dado selecionado', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    // Cria um FormGroup para armazenar os dados selecionados
    const formData = new FormGroup({});
    data.forEach((item, index) => {
      Object.keys(item).forEach((key) => {
        if (!formData.contains(key)) {
          formData.addControl(key, new FormControl(item[key]));
        }
      });
    });

    // Atualiza o inputValue com os dados selecionados
    this.inputValue.setValue(data);
    this.formGroup.setControl('inputValue', this.inputValue);

    // Aqui você pode fazer o que quiser com o formData, como enviar para outro componente ou serviço
    this.dialogRef?.close(this.inputValue.value[0]);
    this.matSnackBar.open('Dados enviados com sucesso', 'Fechar', {
      duration: 3000,
    });
  }

  async dowloadDocument() {

    if (!this.urlToExportDocument) {
      this.matSnackBar.open('Erro ao buscar dados da API', 'Fechar', {
        duration: 5000
      });
      return;
    }

    this.exportLoadingEnabled = true;

    let progress = 0;

    this.http.get(this.urlToExportDocument, {
      responseType: 'blob',
      observe: 'events',
      reportProgress: true
    }).subscribe({
      next: (eventResponse) => {
        if (eventResponse.type === HttpEventType.DownloadProgress && eventResponse.total) {
          // Atualiza progresso
          progress = Math.round((eventResponse.loaded / eventResponse.total) * 100);
        }

        if (eventResponse.type === HttpEventType.Response) {

          //Obtem o nome do arquivo que foi definido pela API no cabeçário
          const contentDisposition = eventResponse.headers.get('Content-Disposition');
          let filename = 'arquivo.csv';

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match?.[1]) {
              filename = match[1];
            }
          }

          //Obtem os dados da resposta e armazena me memória
          const blob = new Blob([eventResponse.body!], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
          progress = -1; // Reset

          this.exportLoadingEnabled = false;
        }

      },
      error: (error) => {
        this.exportLoadingEnabled = false;
      },
    });
  }

  //TODO temporário, deve ser colocado em um service e os valores pego da variáveis ambiente
  abrirPaginaSeguro() {

    // Salva os dados no localStorage com chave dinâmica
    const key = this.name;
    try {
      localStorage.setItem(key, JSON.stringify(this.itemsDisplayed));

      // 🔥 ENVIA DADOS PARA EXTENSÃO
      window.postMessage({
        tipo: 'salvarConsulta',
        chave: key,
        dados: this.itemsDisplayed
      }, '*');

    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }


    // Mapa de nomes para URLs
    //TODO pegar das variáveis ambiente
    const urlMap: Record<string, string> = {
      'PreenchimentoBradesco': 'https://login.bradescoseguros.com.br/nidp/idff/sso?id=secure_name_pasword_form_pneg&sid=0&option=credential&sid=0&target=https%3A%2F%2Fwwwn.bradescoseguros.com.br%2Fpnegocios%2Fwps%2Fmyportal%2Fportalnegocios%2Farealogada%2Fauto%2Fcotacoes%2Fcotacao-frota%2F%21ut%2Fp%2Fz1%2FjZDBCsIwEEQ_KdNtG5NjEFoqqVZrbc1FepKAVg_i9xuKeHObuS28xwwrnBiEm8a3v44v_5jGW7jPTl6kzilRGZC0hca-2VAhU6QgiH4GbGkraEVb6BoBqBvo8pQCEC7Gx5-YSP_Xr9YFIM3hiFVGtOsozmcAx8_jfZvPPjOvF46d2OILcC9eGslX2GQBCF943ruQAb7y5gP6usty%2Fdz%2Fd5%2FL2dJQSEvUUt3QS80TmxFL1o2X0xHTEkwOTgyTjg5QkQwNkcyNkpESzQwMDgx%2F',
      'PreenchimentoAllianz': 'https://www.allianznet.com.br/ngx-epac/public/home',
      'PreenchimentoPortoSeguro': 'https://corretor.portoseguro.com.br/corretoronline',
      'PreenchimentoYelum': 'https://novomeuespacocorretor.yelumseguros.com.br/home',
      'PreenchimentoHdi': 'https://www.hdi.com.br/hdidigital/',
    };

    // Abrir URL se existir no mapa
    const url = urlMap[this.name];
    if (url) {
      window.open(url, '_blank');
    } else {
      console.warn(`🚨 Nenhuma URL configurada para "${this.name}"`);
    }
  }

  //TODO temporário, deve ser colocado em um service
  isConsultaDeSeguro(): boolean {
    const tiposPermitidos = ['PreenchimentoBradesco', 'PreenchimentoAllianz', 'PreenchimentoPortoSeguro', 'PreenchimentoYelum', 'PreenchimentoHdi'];
    return tiposPermitidos.includes(this.name);
  }

  handlePageEvent($event) {
    if ($event == null) return;

    this.currentPageIndex = $event.pageIndex + 1; // O pageIndex começa em 0, então adicionamos 1 para corresponder à nossa lógica de paginação
    this.maxDisplayedItems = $event.pageSize; // Atualiza o número de itens exibidos por página

      this.createItemsOnList(this.itemsDisplayed);
  }

}
