import { Injectable, Injector, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormField } from '../models/form-field';
import { DynamicFormFieldFactory } from '../models/dinamic-form-factory';
import { IPageStructure, PageStructure } from '../models/pageStructure';

interface IconOption {
  nome: string;
  valor: number;
}


/**
  * Dados que irão criar um campo que irá compor o formulário
  * @param target referência da view para onde será criado e renderizado os componentes
  * @param resourceForm formGroup do formulário que contém todos os campos do formulário
  * @param className Nome da classe no qual pertence esse formuário
  * @param fieldName Nome da variável na qual o campo é. @example "phone"
  * @param fieldType Tipo da variável do campo. @examples "number", "foreignKey"
  * @param fieldEntityName Caso esse campo seja uma entidade, esse é o campo que armazena o nome dessa entidade
  * @param value Contém vários valores dentro @example "apiUrl"; "fieldName" e "fieldsType" caso tem chave estrangeira;
  * @param labelTittle Título que aparecerá no topo do campo @example "Telefone"
  * @param dataToCreatePage Dados sobre como deve ser a criação das telas
  * @param fieldDisplayedInLabel Campo que será apresentado na label (titulo) do componente
  * @param valuesList
  */
export interface ICreateComponentParams {
  target: ViewContainerRef,
  resourceForm: FormGroup,
  className: string,
  fieldName: string,
  fieldType: string,
  fieldEntityName?: string,
  limiteOfChars: number, 
  isRequired: boolean,
  value,
  labelTittle: string,
  dataToCreatePage: PageStructure,
  fieldDisplayedInLabel: string,
  valuesList: any[],
  index: number,
  defaultValue: any,
  allowedExtensions?: string[];
  optionList?: any[],
  selectItemsLimit?: number,
  dataType?: string,
  language?: string,
  icones?: IconOption[]
  mask?: string;
  maxFileSize?: number;
  maskType?: string; // criado novo
  charactersLimit?: number; 
  numberOfIcons?: number[],  
  conditionalVisibility?: { field: string, values: string[] };  
  locationMarker?: { lat: number, lng: number, quadrant?: string }; 
  needMaskValue?: boolean;
  numberOfDecimals?: number; 
  decimalSeparator?: string; 
  classImported?: {
    nameClass: string;
    jsonPath: string;
    attributeClass: string;
    links: {
      addressDestination: string;
      mapping: { [key: string]: string };
    };
  }[];
   externalAddress?: string; 
  links?: {addressDestination: string, title: any, destinationFormat: string }[]; 
  properties?: any[]; 
  apiUrl?: string; 
  foreignKeyName?: string; 
}

/**
 * Classe responsável pela geração dos componentes presentes nos formulários.
 */
@Injectable({
  providedIn: 'root'
})
export class FormGeneratorService {

  protected httpClient: HttpClient;
  protected formBuilder: FormBuilder;
  protected matDialog: MatDialog;

  constructor(protected injector: Injector, private formFieldFactory: DynamicFormFieldFactory) {
    this.httpClient = injector.get(HttpClient);
    this.formBuilder = injector.get(FormBuilder);
    this.matDialog = injector.get(MatDialog);
  }

  buildResourceForm(formBuilder: FormBuilder): FormGroup {
    return formBuilder.group({
      id: [null],
    });
  }

  createComponent(
    createComponentData: ICreateComponentParams
  ) {

    if (createComponentData.target == null) {
      console.error("Target vazia, não é possível criar a pagina");
      return null;
    }

    const formField: FormField = this.formFieldFactory.createFormField(createComponentData, createComponentData.dataToCreatePage);

    if (formField == null) {
      return null;
    }

    createComponentData.resourceForm.addControl(
      createComponentData.fieldName, 
      formField.createFormField(createComponentData)
    );

    if (createComponentData.isRequired) {
      createComponentData.resourceForm.controls[createComponentData.fieldName].setValidators(Validators.required);
    }
  }

  getJSONFromDicionario(JSONToGenerateScreenPath: any): Observable<IPageStructure> {
    return this.httpClient.get<IPageStructure>(JSONToGenerateScreenPath);//TODO aqui será a rota do backend que pegará o JSON do usuário
  }
}
