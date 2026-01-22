import { FormControl } from '@angular/forms';
import { FormField } from '../../models/form-field';
import { ICreateComponentParams } from '../../services/form-generator.service';
import { CaptureLocationFieldComponent } from './capture-location-field.component';

export class CaptureLocationField implements FormField {
  createFormField(createComponentData: ICreateComponentParams): FormControl {

    let createdComponent = createComponentData.target.createComponent(CaptureLocationFieldComponent);
    createdComponent.instance.label = createComponentData.labelTittle;
    createdComponent.instance.isRequired = createComponentData.isRequired;
    createdComponent.instance.className = createComponentData.className;
    createdComponent.instance.conditionalVisibility = createComponentData.conditionalVisibility
    createdComponent.instance.resourceForm = createComponentData.resourceForm;
    return createdComponent.instance.inputValue;
  }
}