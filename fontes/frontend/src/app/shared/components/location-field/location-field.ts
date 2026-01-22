import { FormControl } from '@angular/forms';
import { FormField } from '../../models/form-field';
import { ICreateComponentParams } from '../../services/form-generator.service';
import { LocationFieldComponent } from './location-field.component';

export class LocationField implements FormField {
  createFormField(createComponentData: ICreateComponentParams): FormControl {

    let createdComponent = createComponentData.target.createComponent(LocationFieldComponent);
    createdComponent.instance.label = createComponentData.labelTittle;
    createdComponent.instance.isRequired = createComponentData.isRequired;
    createdComponent.instance.className = createComponentData.className;
    createdComponent.instance.locationMarker = createComponentData.locationMarker;
    createdComponent.instance.conditionalVisibility = createComponentData.conditionalVisibility
    createdComponent.instance.resourceForm = createComponentData.resourceForm;
    return createdComponent.instance.inputValue;
  }
}