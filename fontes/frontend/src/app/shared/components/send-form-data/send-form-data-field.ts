import { FormControl } from '@angular/forms';
import { FormField } from 'app/shared/models/form-field';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { SendFormDataComponent } from './send-form-data.component';

export class SendFormDataField implements FormField {
  createFormField(createComponentData: ICreateComponentParams): FormControl {

    let createdComponent = createComponentData.target.createComponent(SendFormDataComponent).instance;
    createdComponent.label = createComponentData.labelTittle;
    createdComponent.className = createComponentData.className;
    createdComponent.links = createComponentData.links;
    createdComponent.externalAddress = createComponentData.externalAddress;
    createdComponent.resourceForm = createComponentData.resourceForm;

    return createdComponent.inputValue;
  }
}