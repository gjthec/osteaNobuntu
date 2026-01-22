import { AfterViewInit, Component, ChangeDetectorRef, EventEmitter, Input, Output, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormGeneratorService, ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { MaskService } from 'app/shared/services/mask.service';

/**
 * Componente que fará a geração do formulário. Sendo esse formulário o com estrutura simples.
 */
@Component({
  selector: 'generated-simple-form',
  templateUrl: './generated-simple-form.component.html',
  styleUrls: ['./generated-simple-form.component.scss']
})
export class GeneratedSimpleFormComponent implements AfterViewInit {
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
   * Dados contidos no JSON que orienta a criação da página
   */
  @Input() dataToCreatePage: IPageStructure;

  /**
   * Nome da classe na qual o formulário pertence.
   * @example "Produtos"
   */
  @Input() className: string;


  @ViewChild('placeToRender', { read: ViewContainerRef }) target!: ViewContainerRef;

  constructor(
    public formGenerator: FormGeneratorService,
    private maskService: MaskService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.generateSimpleFormList();
  }

  /**
   * Função que irá criar cada campo de preenchimento de acordo com as variáveis da classe do formulário.
   */
  generateSimpleFormList() {
    setTimeout(() => {
      this.dataToCreatePage.attributes.forEach((attribute, index) => {

        const createComponentData : ICreateComponentParams = {
          target:this.target,
          resourceForm: this.resourceForm,
          className: this.className,
          fieldName: attribute.name,
          fieldType: attribute.type,
          fieldEntityName: attribute.className,
          limiteOfChars: attribute.limiteOfChars, //criado novo
          conditionalVisibility: attribute.conditionalVisibility, //criado novo
          locationMarker: attribute.locationMarker, //criado novo
          numberOfIcons: attribute.numberOfIcons,  //criado novo
          isRequired: attribute.isRequired ? attribute.isRequired : false,
          value: {propertiesAttributes: attribute.properties, apiUrl: attribute.apiUrl},
          labelTittle: attribute.name,
          defaultValue: attribute.defaultValue,
          dataToCreatePage: this.dataToCreatePage,
          fieldDisplayedInLabel: attribute.fieldDisplayedInLabel,
          valuesList: null,
          index: index,
          optionList: attribute.optionList,
          selectItemsLimit: attribute.selectItemsLimit,
          allowedExtensions: attribute.allowedExtensions,
          mask: this.maskService.getMaskPattern(attribute.mask),
          maxFileSize: attribute.maxFileSize,
          maskType: attribute.mask, //criado novo
          needMaskValue: attribute.needMaskValue, //criado novo
          numberOfDecimals: attribute.numberOfDecimals, //criado novo
          decimalSeparator: attribute.decimalSeparator, //criado novo
          links: attribute.links,
          foreignKeyName: attribute.foreignKeyName, //criado novo
        }

        this.formGenerator.createComponent(createComponentData)

      });
      this.formIsReady.emit(true);
      this.cdr.detectChanges();
    }, 0);
  }
}
