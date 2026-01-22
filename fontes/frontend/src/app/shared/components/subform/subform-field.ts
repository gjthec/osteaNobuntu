import { FormField } from 'app/shared/models/form-field';
import { FormControl } from '@angular/forms';
import { ICreateComponentParams } from 'app/shared/services/form-generator.service';
import { IPageStructure } from 'app/shared/models/pageStructure';
import { SubformComponent } from './subform.component';

export class SubFormField implements FormField {

  constructor(
    public dataToCreatePage: IPageStructure
  ) {
  }

  createFormField(createComponentData: ICreateComponentParams): FormControl {

      if (this.dataToCreatePage == null) console.warn("Dados de criação de pagina não obtidos");
      if (createComponentData.target == null) console.warn("Target não instanciada");
 
      let createdComponent = createComponentData.target.createComponent(SubformComponent).instance;
      createdComponent.apiUrl = this.dataToCreatePage.attributes[createComponentData.index].apiUrl;
      createdComponent.columnsQuantity = 2;
      createdComponent.resourceForm = createComponentData.resourceForm;
      createdComponent.index = createComponentData.index;
      createdComponent.displayedfieldsName = this.dataToCreatePage.attributes[createComponentData.index].properties.map(attribute => attribute.name);
      createdComponent.fieldsType = this.dataToCreatePage.attributes[createComponentData.index].properties.map(attribute => attribute.type);
      createdComponent.isSelectable = this.dataToCreatePage.config.edit;
      createdComponent.selectedItemsLimit = null;
      createdComponent.className = this.dataToCreatePage.attributes[createComponentData.index].className;
      createdComponent.dataToCreatePage = this.dataToCreatePage;
      createdComponent.objectDisplayedValue = this.dataToCreatePage.attributes.map(attribute => attribute.fieldDisplayedInLabel);
      createdComponent.route = this.dataToCreatePage.config.route;
      createdComponent.itemsDisplayed = [];
      createdComponent.classImported = this.dataToCreatePage.attributes[createComponentData.index].classImported;
      createdComponent.foreignKeyName = createComponentData.foreignKeyName;
      createdComponent.searchInputFieldVisible = this.dataToCreatePage.attributes[createComponentData.index].searchInputFieldVisible ?? false;
      return createdComponent.inputValue;
  }
}