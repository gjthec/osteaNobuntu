import { AfterViewInit, Component, Inject, Injectable, Injector, Input, Optional, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGeneratorService } from 'app/shared/services/form-generator.service';
import { GeneratedFormFactoryService } from 'app/shared/services/generated-form-factory.service';
import { LocalStorageFormService } from 'app/shared/services/local-storage-form.service';
import { DinamicBaseResourceService } from 'app/shared/services/shared.dinamicService';
import { SelectedItemsListComponent } from '../selected-items-list/selected-items-list.component';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from 'environments/environment';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface IDinamicBaseResourceFormComponent {
  dataToCreatePage: IPageStructure,
  className: string,
  itemId: string,
  currentAction: string,
  target?: ViewContainerRef
}

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'dinamic-base-resource-form',
  templateUrl: './dinamic-base-resource-form.component.html',
  styleUrls: ['./dinamic-base-resource-form.component.scss']
})
export class DinamicBaseResourceFormComponent implements AfterViewInit {
  /**
   * Ação atual que o formuário está. Sendo edição ou criação.
   * @example "edit" ou "new".
   */
  @Input() currentAction: string;
  /**
   * formuário que armazenará os dados.
   */
  resourceForm: FormGroup;
  /**
   * Título da pagina.
   * @example "Caixas"
   */
  pageTitle: string;
  serverErrorMessages: string[] | null = null;
  submittingForm: boolean = false;
  /**
   * O localStorage será usado para armazenar dados do formulário enquanto estiver sendo preenchido.
   * @example "true" ou "false"
   */
  localStorageIsEnabled: boolean = false;
  /**
   * Indica se os dados do formulário foram alterados
   * @example "true" ou "false"
   */
  formSaved: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;
  /**
   * Service que opera as funções de armazenamento de dados do formuário no local storage
   */
  protected localStorageFormService: LocalStorageFormService;
  private translocoService: TranslocoService;
  //Valores necessários

  /**
   * Nome da classe na qual esse formulário pertence.
   * Exemplo: "Products".
   */
  className: string;

  resourceService: DinamicBaseResourceService;
  public resource: any;

  private generatedFormFactoryService: GeneratedFormFactoryService;
  private formGeneratorService: FormGeneratorService;
  @Input() dataToCreatePage: IPageStructure;

  @ViewChild('placeToRender', { read: ViewContainerRef }) target!: ViewContainerRef;

  constructor(
    protected injector: Injector,
    private matSnackBar: MatSnackBar,
    // public resource: T,
    // protected resourceService: BaseResourceService<T>,
    // protected jsonDataToResourceFn: (jsonData) => T,

    //passar aqui o nome da classe e da variável, assim percorre o JSON e pega o necessário
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogInjectorData: IDinamicBaseResourceFormComponent,
    @Optional() private matDialogComponentRef: MatDialogRef<SelectedItemsListComponent>,
    @Optional() private dialogRef?: MatDialogRef<DinamicBaseResourceFormComponent>,
  ) {

    if (dialogInjectorData != null) {
      this.dataToCreatePage = dialogInjectorData.dataToCreatePage;
      this.className = this.dialogInjectorData.className;
    }

    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
    this.resourceService = this.injector.get(DinamicBaseResourceService);
    this.localStorageFormService = this.injector.get(LocalStorageFormService);
    this.generatedFormFactoryService = this.injector.get(GeneratedFormFactoryService);
    this.formGeneratorService = this.injector.get(FormGeneratorService);
    this.translocoService = this.injector.get(TranslocoService);

    this.buildResourceForm();
  }

  ngAfterViewInit(): void {

    setTimeout(() => {

      if(this.dialogInjectorData){
        this.createPageOnDialog();
        return
      }

      if (this.dataToCreatePage == null) {
        console.warn("dataToCreatePage don't exist");
        return;
      }
      //Verifica se é o componente foi aberto em um dialog ou não
      if (this.matDialogComponentRef != null) {

        if (this.dialogInjectorData.currentAction === "new" || this.dialogInjectorData.currentAction === "edit") {
          this.currentAction = this.dialogInjectorData.currentAction;
        } else {
          this.currentAction = "new";
        }

        console.log("DataToCreatePage : ",this.dataToCreatePage);

        //TODO deverá ser feito uma maneira mais segura de obter o apiUrl da classe chave estrangeira
        var apiUrl = this.dataToCreatePage["attributes"].find((attribute)=> attribute["name"] == this.className)["apiUrl"];
        this.resourceService.apiPath = environment.backendUrl+'/'+apiUrl;

        // this.generatedFormFactoryService.getDataToCreateFrom(, this.target, () => { this.loadForm() }, this.resourceForm, () => { this.submitForm() }, () => { this.deleteResource() }, this.currentAction, this.className);
        this.generatedFormFactoryService.createForm({target: this.dialogInjectorData.target, getDataFromAPIFunction: ()=>{this.loadResource()}, submitFormFunction: ()=>{this.submitForm()}, deleteFormFunction: ()=>{this.deleteResource()}, currentFormAction: this.currentAction, dataToCreatePage: this.dataToCreatePage, formOption: null, resourceForm: this.resourceForm, secondaryFormClassName: this.className })
  
      } else {

        // this.formGeneratorService.getJSONFromDicionario(this.JSONPath).subscribe((JSONDictionary: any) => {
        //   this.localStorageIsEnabled = JSONDictionary.config.localStorage;
        //   this.className = JSONDictionary.config.class;
        //   this.resourceService.apiPath = JSONDictionary.config.apiUrl;
        //   this.generatedFormFactoryService.getDataToCreateForm(this.JSONPath, JSONDictionary, this.target, () => { this.loadForm() }, this.resourceForm, () => { this.submitForm() }, () => { this.deleteResource() }, this.currentAction);
        // });

      }
    }, 0);
  }

  createPageOnDialog(){
    this.dataToCreatePage = this.dialogInjectorData.dataToCreatePage;

    if (this.matDialogComponentRef != null) {

      let jsonPath = this.dataToCreatePage.attributes[0].className;

      jsonPath = jsonPath.charAt(0).toLowerCase() + jsonPath.slice(1);

      this.formGeneratorService.getJSONFromDicionario(jsonPath).pipe().subscribe((JSONDictionary: any) => {
        this.dataToCreatePage = JSONDictionary;
        console.log("DataToCreatePage : ",this.dataToCreatePage);
        this.generatedFormFactoryService.createForm({target: this.target, getDataFromAPIFunction: ()=>{this.loadResource()}, submitFormFunction: ()=>{this.submitForm()}, deleteFormFunction: ()=>{this.deleteResource()}, currentFormAction: this.currentAction, dataToCreatePage: this.dataToCreatePage, formOption: null, resourceForm: this.resourceForm, secondaryFormClassName: this.className })
      }); 
     } 
  }

  loadForm() {

    if (this.matDialogComponentRef == null) {
      this.setCurrentAction();
    }

    if (this.localStorageIsEnabled) {
      this.loadResorceWithLocalStorage();
    } else {
      this.loadResource();
    }
  }

  protected setCurrentAction() {
    if (this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == "new"){
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  private loadResorceWithLocalStorage() {
    const resourceId = this.route.snapshot.params['id'];
    const className = this.className;

    const dataStoredInLocalStore = this.localStorageFormService.getDataFromLocalStorage(resourceId, className, this.currentAction);

    if (dataStoredInLocalStore != null) {
      this.resourceForm.patchValue(dataStoredInLocalStore);
    } else {
      this.loadResource();
    }
    this.localStorageFormService.saveInLocalStorageOnEachChange(resourceId, className, this.resourceForm, this.currentAction);
  }

  protected loadResource(): any {
    let id;

    if (this.currentAction != "edit") {
      return;
    }

    if (this.matDialogComponentRef != null) {
      id = this.dialogInjectorData.itemId;
    } else {
      this.route.paramMap.subscribe({
        next: (params) => { id = params.get("id") }
      }).unsubscribe();
    }

    this.resourceService.getById(this.dialogInjectorData.itemId).subscribe({
      next: (resource) => {
        this.resource = resource;
        //TODO usar transloco nessas mensagens
        if (this.resourceForm == null) { console.error("ResourceForm não foi instanciado") }
        this.resourceForm.patchValue(resource) // binds loaded resource data to resourceForm
        // console.log("Dados do resorceForm que serão enviados para a API: ", this.resourceForm.value);
      },
      error: (error) => this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.readErrorMessage"), 'OK', { duration: 3000 })
    });

  }


  protected setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = this.creationPageTitle();
    else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return "Novo"
  }

  protected editionPageTitle(): string {
    return "Edição"
  }

  protected createResource() {
    const resource = this.resourceForm.value;
    if (resource.updatedAt == null) resource.updatedAt = new Date();

    this.resourceService.create(resource).subscribe({
      next: (response) => {

        this.localStorageFormService.remove("new" + this.className);

        if (this.matDialogComponentRef == null) {
          this.actionsForSuccess(response);
        } else {
          this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.defaultSuccessMessage"), 'OK', { duration: 3000 });
          this.matDialogComponentRef.close(response);
        }
      },
      error: (error) => this.actionsForError(error)
    });
  }

  protected updateResource() {
    const resource = this.resourceForm.value;
    
    if (resource.updatedAt == null) resource.updatedAt = new Date();

    this.resourceService.update(resource.id, resource).subscribe({
      next: (response) => {
        if (this.dialogInjectorData == null) {
          this.actionsForSuccess(response);
        } else {
          this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.defaultSuccessMessage"), 'OK', { duration: 3000 });
          this.matDialogComponentRef.close(resource);
        }
      },
      error: (error) => this.actionsForError(error)
    });
  }

  protected deleteResource() {
    const resource = this.resourceForm.value;

    this.resourceService.delete(resource.id).subscribe({
      next: (response) => {
        if (this.dialogInjectorData == null) {
          this.actionsForSuccess(response);
        } else {
          this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.deleteSuccessMessage"), 'OK', { duration: 3000 });
          this.matDialogComponentRef.close({ data: resource, action: "removed" });
        }
      },
      error: (error) => this.actionsForError(error)
    });
  }

  protected actionsForSuccess(resource: any) {
    this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.defaultSuccessMessage"), 'OK', { duration: 3000 });
    //Verifica se o componente foi aberto por um dialog
    if (this.matDialogComponentRef != null) {
      this.matDialogComponentRef.close();
    } else {
      const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
      // redirect/reload component page
      this.router.navigateByUrl(baseComponentPath, { skipLocationChange: false }).then(
        () => this.router.navigate([baseComponentPath])
      )
    }
  }

  protected actionsForError(error) {

    this.submittingForm = false;
    this.matSnackBar.open(this.translocoService.translate("componentsBase.Alerts.defaultErrorMessage"), 'OK', { duration: 3000 });

    if (error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
  }

  // protected abstract buildResourceForm(): void;
  protected buildResourceForm(): void {
    this.resourceForm = this.formBuilder.group({
      id: [null],
      updatedAt: [null]
    });
  }

}
