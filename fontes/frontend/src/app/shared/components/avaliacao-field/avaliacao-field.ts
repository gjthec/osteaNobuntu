import { FormControl } from '@angular/forms';
import { FormField } from 'app/shared/models/form-field';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { AvaliacaoFieldComponent } from './avaliacao-field.component';

export class AvaliacaoField implements FormField {
  createFormField(createComponentData: ICreateComponentParams): FormControl {

    let createdComponent = createComponentData.target.createComponent(AvaliacaoFieldComponent);
    console.log(createdComponent.instance)
    createdComponent.instance.label = createComponentData.labelTittle;
    createdComponent.instance.isRequired = createComponentData.isRequired;
    createdComponent.instance.className = createComponentData.className;
    createdComponent.instance.numberOfIcons = createComponentData.numberOfIcons;
     const attribute = createComponentData.dataToCreatePage.attributes.find((attr: any) => attr.name === createComponentData.labelTittle);
     if (attribute) {
         createdComponent.instance.icones = attribute.icones;
         console.log(attribute.icones);
     }

    createdComponent.instance.conditionalVisibility = createComponentData.conditionalVisibility
    createdComponent.instance.resourceForm = createComponentData.resourceForm;
    return createdComponent.instance.inputValue;
  }
}