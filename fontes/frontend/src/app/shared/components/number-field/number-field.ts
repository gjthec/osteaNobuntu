import { FormField } from 'app/shared/models/form-field';
import { FormControl } from '@angular/forms';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { NumberFieldComponent } from './number-field.component';
import { Injector } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

export class NumberField implements FormField {
   resourceFor: string = 'default'; // adiciona a propriedade que é usada no factory


  constructor(
    private injector: Injector
  ) { }

  createFormField(createComponentData: ICreateComponentParams): FormControl {
    const createdComponent = createComponentData.target.createComponent(NumberFieldComponent).instance;

    createdComponent.label = createComponentData.labelTittle;
    createdComponent.isRequired = createComponentData.isRequired;
    createdComponent.defaultValue = createComponentData.defaultValue;
    createdComponent.className = createComponentData.className;
    const translocoService = this.injector.get(TranslocoService);
    const currentLang = translocoService.getActiveLang();
    createdComponent.mask = createComponentData.mask; 
    createdComponent.maskType = createComponentData.maskType;

    createdComponent.charactersLimit = createComponentData.charactersLimit;
    createdComponent.limiteOfChars = createComponentData.limiteOfChars; //criado novo
    createdComponent.numberOfDecimals = createComponentData.numberOfDecimals;
    createdComponent.decimalSeparator = createComponentData.decimalSeparator;
    createdComponent.conditionalVisibility = createComponentData.conditionalVisibility
    createdComponent.resourceForm = createComponentData.resourceForm;
    // O ícone da calculadora e o click já estão hardcoded no componente 
    // (mas poderia receber por aqui se quiser customizar no futuro)
    return createdComponent.inputValue;
  }
}
