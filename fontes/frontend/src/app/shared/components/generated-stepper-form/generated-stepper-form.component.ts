import { AfterViewInit, Component, EventEmitter, Input, Optional, Output, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGeneratorService, ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IPageStructure } from 'app/shared/models/pageStructure';

/**
 * Componente que fará a geração do formulário. Sendo esse formulário com estrutura separada por passos.
 */
@Component({
  selector: 'generated-stepper-form',
  templateUrl: './generated-stepper-form.component.html',
  styleUrls: ['./generated-stepper-form.component.scss']
})
export class GeneratedStepperFormComponent implements AfterViewInit{

  /**
   * FormGroup que armazena os dados do formuário. Todas os dados vão diretamente para ele, para assim ir para as APIs.
   */
  @Input() resourceForm: FormGroup;
  /**
   * Output que indica quando o formulário terminou de ser criado.
   * Exemplo: false.
   */
  @Output() formIsReady = new EventEmitter<boolean>();
  /**
   * Formulário usará o localStorage para armazenar valores que estão sendo preenchidos.
   * @example true
   */
  @Input() localStorageIsEnabled: boolean = true;
  /**
   * Data que oreinta na criação do JSON
   */
  @Input() dataToCreatePage: IPageStructure;
  /**
   * Função que informa e envia para API os dados para criação ou edição do item.
   */
  @Input() submitFormFunction: ()=>void;
  /**
   * Função que informa para API remover o item está sendo editando. 
   */
  @Input() deleteFormFunction: ()=>void;
  /**
   * Função responsável para retornar a pagina anterior
   */
  @Input() returnFormFunction: () => void;
  /**
   * Situação atual do formuário, sendo ele estando no modo de edita ou criar um novo item.
   * @example "edit" ou "new"
   */
  @Input() currentFormAction: string;
  /**
   * Informa quais são os passos e nome de cada passo do formulário.
   * @example "['endereco', 'valores', 'forma de pagamento']"
   */
  @Input() formStepperStructure : string[];
  /**
   * No JSON que orienta a criação de paginas, cada um JSON é uma classe, nessa classe se tem cada variável com suas informações.
   */
  // @Input() attributes: IAttributesToCreateScreens[];
  /**
   * Nome da classe na qual o formulário pertence.
   * @example "Produtos"
   */
  @Input() className : string;
  /**
   * Configurações adicionais (ainda não é usado)
   */
  @Input() config;
  /**
   * Para realizar as operações de salvamento/alteração é preciso preecher todas os passos do formuário antes?
   * @example true
   */
  @Input() isLinear: boolean = true;

  @ViewChildren('placeToRender', { read: ViewContainerRef }) targets!: QueryList<ViewContainerRef>;

  constructor(
    public formGenerator: FormGeneratorService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Optional() private matDialogComponentRef: MatDialogRef<GeneratedStepperFormComponent>
  ) {}

  ngAfterViewInit(): void {
    this.generateStepperFormList()
  }

  /**
   * Função que irá percorrer cada passo que compõem o formulário por passos e irá criando cada campo de preenchimento de acordo com as variáveis da classe do formulário.
   */
  generateStepperFormList(){
    setTimeout(() => {

      this.formStepperStructure.forEach((stepName, index) => {
        this.dataToCreatePage.attributes.forEach((attribute) => {
          
          const createComponentData : ICreateComponentParams = {
            target:this.targets.toArray()[index],
            resourceForm: this.resourceForm,
            className: this.className,
            fieldName: attribute.name,
            fieldType: attribute.type,
            isRequired: attribute.isRequired ? attribute.isRequired : false,
            value: {propertiesAttributes: attribute.properties, apiUrl: attribute.apiUrl},
            defaultValue: attribute.defaultValue,
            index: 1,
            labelTittle: attribute.name,
            dataToCreatePage: this.dataToCreatePage,
            fieldDisplayedInLabel: attribute.fieldDisplayedInLabel,
            valuesList: null,
            limiteOfChars: attribute.limiteOfChars, //criado novo
          }
          if (attribute.formTab == stepName) {
            this.formGenerator.createComponent(createComponentData);
          }
        });
      });
      
      this.formIsReady.emit(true);
      
    }, 0);
  }

  SeeFormData() {
    console.log(this.resourceForm.value)
  }

  /**
   * Caso esse formuário for aberto como dialog, ele fechará. Se não ele irá para pagina anterior.
   */
  return() {
    if (this.matDialogComponentRef) {
      
      this.matDialogComponentRef.close();

    } else {
      if(this.currentFormAction === "edit"){
        this.router.navigate(['../../'], {relativeTo: this.activatedRoute});
      } else if(this.currentFormAction === "new"){
        this.router.navigate(['../'], {relativeTo: this.activatedRoute});
      }
    }
  }

}
