import { AfterViewInit, Component, Inject, Optional, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DynamicFormFieldFactory } from 'app/shared/models/dinamic-form-factory';
import { FormField } from 'app/shared/models/form-field';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';

@Component({
  selector: 'app-consulta-form',
  templateUrl: './consulta-form.component.html',
  styleUrls: ['./consulta-form.component.scss']
})
export class ConsultaFormComponent implements AfterViewInit {

  constructor(private dialogRef: MatDialogRef<ConsultaFormComponent>, private formFieldFactory: DynamicFormFieldFactory, @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) { }

  @ViewChild('placeToRender', { read: ViewContainerRef }) target!: ViewContainerRef;
  parameters: ICreateComponentParams[] = this.data.parameters;
  resourceForm: FormGroup = this.data.resourceForm;
  submit: Function = this.data.submitFormFunction;

  ngAfterViewInit(): void {
    this.createForm();
  }

  createForm() {

    this.parameters.forEach((param) => {
      param.target = this.target;

      const createComponentData: ICreateComponentParams = {
        target: this.target,
        resourceForm: this.resourceForm,
        className: param.className,
        fieldName: param.fieldName,
        fieldType: param.fieldType,
        fieldEntityName: param.className,
        limiteOfChars: param.limiteOfChars, //criado novo
        conditionalVisibility: param.conditionalVisibility, //criado novo
        locationMarker: param.locationMarker, //criado novo
        numberOfIcons: param.numberOfIcons,  //criado novo
        isRequired: param.isRequired ? param.isRequired : false,
        value: { propertiesAttributes: param.properties, apiUrl: param.apiUrl },
        labelTittle: param.labelTittle,
        defaultValue: param.defaultValue,
        dataToCreatePage: this.data.dataToCreatePage,
        fieldDisplayedInLabel: param.fieldDisplayedInLabel,
        valuesList: param.valuesList,
        index: param.index,
        optionList: param.optionList,
        selectItemsLimit: param.selectItemsLimit,
        allowedExtensions: param.allowedExtensions,
        mask: param.mask,
        maxFileSize: param.maxFileSize,
        maskType: param.maskType, //criado novo
        needMaskValue: param.needMaskValue, //criado novo
        numberOfDecimals: param.numberOfDecimals, //criado novo
        decimalSeparator: param.decimalSeparator, //criado novo
        links: param.links
      }
      this.createComponent(createComponentData);
    });
  }

  createComponent(
    createComponentData: ICreateComponentParams
  ) {

    if (createComponentData.target == null) {
      console.error("Target vazia, não é possível criar a pagina");
      return null;
    }

    const formField: FormField = this.formFieldFactory.createFormFieldConsulta(createComponentData);
    this.resourceForm.addControl(createComponentData.fieldName, formField.createFormField(createComponentData));

    if (createComponentData.isRequired) {
      createComponentData.resourceForm.controls[createComponentData.fieldName].setValidators(Validators.required);
    }
  }

  search() {
    this.data.submitFormFunction(this.objectTratament(this.resourceForm.value), this.resourceForm);
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

  cancel() {
    this.dialogRef.close();
  }

}
