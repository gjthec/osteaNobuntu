import { Injectable, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LocalStorageService } from './local-storage.service';

/**
 * Serviço responsável por realizar as funções relacionadas ao localStorage de cada formulário.
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageFormService extends LocalStorageService{

  /**
   * A cada mudancá de dados do formuário, será salvo no localStorage
   * @param resourceId Id do item que está sendo alterado
   * @param className Nome da classe na qual o item pertence
   * @param resourceForm FormGroup, que armazena dados do formulário que está sendo alterado
   * @param currentAction Ação atual do formuário, sendo criação ou edição
   * @example "edit" ou "new"
   */
  saveInLocalStorageOnEachChange(resourceId, className: string, resourceForm: FormGroup, currentAction: string) {
    resourceForm.valueChanges.subscribe((newValues) => {
      if (currentAction == "edit") {
        this.set(resourceId, newValues);
      } else if (currentAction == "new") {
        this.set("new" + className, newValues);
      }
    });
  }

  /**
   * Obtem dados armazenados no localStorage
   * @param resourceId Id do item que está sendo alterado
   * @param className Nome da classe na qual o item pertence
   * @param currentAction Ação atual do formuário, sendo criação ou edição
   * @example "edit" ou "new"
   * @returns retorna os dados armazenados no LocalStorage
   */
  getDataFromLocalStorage(resourceId, className: string, currentAction: string): any {
    let key;

    if (currentAction == "edit") {
      key = resourceId;
    } else if (currentAction == "new") {
      key = "new" + className;
    }
    if (key == null) return;

    const storedData = this.get(key);
    
    if (storedData != null) {
      return storedData;
    } else {
      return null;;
    }
  }
}
