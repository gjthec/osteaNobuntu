import { FormControl } from '@angular/forms';
import { FormField } from 'app/shared/models/form-field';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { EscalaLinearFieldComponent } from './escala-linear-field.component';


export class EscalaLinearField implements FormField {
	createFormField(createComponentData: ICreateComponentParams): FormControl {
		let createdComponent = createComponentData.target.createComponent(EscalaLinearFieldComponent);
        const component = createdComponent.instance;
        console.log(component)

        component.label = createComponentData.labelTittle;
        component.valuesOptionList = createComponentData.dataToCreatePage.attributes[createComponentData.index].valuesOptionList;
        component.ngAfterViewInit();
		return createdComponent.instance.inputValue;
	}
}