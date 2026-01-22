import { Injectable } from '@angular/core';
import { GeneratedSimpleFormComponent } from '../components/generated-simple-form/generated-simple-form.component';
import { ICreateSpace } from '../components/form-space-build/form-space-build.component';


@Injectable({
  providedIn: 'root'
})
export class FormSpaceBuildService {

  constructor() { }

  createComponent(
    createComponentData: ICreateSpace,
  ) {

    if (createComponentData.target == null) {
      console.error("Target vazia, não é possível criar a pagina");
      return null;
    }

    let simpleForm = createComponentData.target.createComponent(GeneratedSimpleFormComponent);
    simpleForm.instance.resourceForm = createComponentData.resourceForm;
    simpleForm.instance.className = createComponentData.className;
    simpleForm.instance.target = createComponentData.target;
    // simpleForm.instance.value = createComponentData.value;
    simpleForm.instance.dataToCreatePage = createComponentData.dataToCreatePage;
    //Aqui que ficaria ouvindo que o simpleForm teve seus campos criados, assim iria executar uma função para realizar a requisição na API para obter os dados
    simpleForm.instance.formIsReady.pipe().subscribe(() => { createComponentData.getDataFromAPIFunction() });
  }
}
