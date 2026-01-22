import { FormControl } from '@angular/forms';
import { FormField } from 'app/shared/models/form-field';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { VideoFieldComponent } from './video-field.component';

export class VideoField implements FormField {
  createFormField(createComponentData: ICreateComponentParams): FormControl {

    let createdComponent = createComponentData.target.createComponent(VideoFieldComponent);
    createdComponent.instance.label = createComponentData.labelTittle;
    createdComponent.instance.isRequired = createComponentData.isRequired;
    createdComponent.instance.className = createComponentData.className;

    createdComponent.instance.conditionalVisibility = createComponentData.conditionalVisibility
    createdComponent.instance.resourceForm = createComponentData.resourceForm;
    return createdComponent.instance.inputValue;
  }
}