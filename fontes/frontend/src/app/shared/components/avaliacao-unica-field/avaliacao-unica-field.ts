import { FormControl } from '@angular/forms';
import { FormField } from 'app/shared/models/form-field';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { AvaliacaoUnicaFieldComponent } from './avaliacao-unica-field.component';

export class AvaliacaoUnicaField implements FormField {
    createFormField(createComponentData: ICreateComponentParams): FormControl {
        let createdComponent = createComponentData.target.createComponent(AvaliacaoUnicaFieldComponent);
        console.log(createdComponent.instance)
        createdComponent.instance.label = createComponentData.labelTittle;
        createdComponent.instance.isRequired = createComponentData.isRequired;
        createdComponent.instance.className = createComponentData.className;

        // Procurar o atributo com o nome igual ao labelTitle e pegar os ícones desse elemento
        const attribute = createComponentData.dataToCreatePage.attributes.find((attr: any) => attr.name === createComponentData.labelTittle);
        if (attribute) {
            createdComponent.instance.icones = attribute.icones;
            console.log(attribute.icones);
        }

        // novos campos na linha 16, 17
        createdComponent.instance.conditionalVisibility = createComponentData.conditionalVisibility
        createdComponent.instance.resourceForm = createComponentData.resourceForm;

        return createdComponent.instance.inputValue;
    }
}