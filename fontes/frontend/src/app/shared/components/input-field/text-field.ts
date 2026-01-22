import { FormControl } from '@angular/forms';
import { FormField } from '../../models/form-field';
import { ICreateComponentParams } from '../../services/form-generator.service';
import { InputFieldComponent } from './input-field.component';

export class TextField implements FormField {
  createFormField(createComponentData: ICreateComponentParams): FormControl {
    let createdComponent = createComponentData.target.createComponent(InputFieldComponent);
    createdComponent.instance.label = createComponentData.labelTittle;
    createdComponent.instance.isRequired = createComponentData.isRequired;
    createdComponent.instance.isRequired = createComponentData.isRequired;
    createdComponent.instance.className = createComponentData.className;
    createdComponent.instance.defaultValue = createComponentData.defaultValue;
    createdComponent.instance.mask = createComponentData.mask;
    createdComponent.instance.maskType = createComponentData.maskType; //criado novo
    createdComponent.instance.needMaskValue = true; //criado novo
    createdComponent.instance.limiteOfChars = createComponentData.limiteOfChars; //criado novo
    createdComponent.instance.conditionalVisibility = createComponentData.conditionalVisibility
    createdComponent.instance.resourceForm = createComponentData.resourceForm;
    return createdComponent.instance.inputValue;
  }
}