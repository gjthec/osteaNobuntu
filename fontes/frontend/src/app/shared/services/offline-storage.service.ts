import { Injectable } from '@angular/core';

export interface OfflineOperation {
  apiPath: string;
  resource: any;
  subForms?: [{
    resources: any[];
    fieldName: string;
  }]
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {

  saveCreateOperation<T>(apiPath: string, resource: T): void {
    const key = `create-${apiPath}-${this.generateUUID()}`;

    let subForms = this.getSubFormValue(resource);

    if (subForms.length > 0) {
      let offlineOperation: OfflineOperation = { apiPath, resource, subForms };
      localStorage.setItem(key, JSON.stringify(offlineOperation));
      return;
    }

    let offlineOperation: OfflineOperation = { apiPath, resource };
    localStorage.setItem(key, JSON.stringify(offlineOperation));
  }

  saveUpdateOperation<T>(apiPath: string, id: string, resource: T): void {
    const key = `update-${apiPath}-${this.generateUUID()}`;
    localStorage.setItem(key, JSON.stringify({ apiPath, id, resource }));
  }

  saveDeleteOperation(apiPath: string, id: string): void {
    const key = `delete-${apiPath}-${this.generateUUID()}`;
    localStorage.setItem(key, JSON.stringify({ apiPath, id }));
  }

  getAllPendingOperations() {
    const createKeys = Object.keys(localStorage).filter(key => key.startsWith('create-'));
    const updateKeys = Object.keys(localStorage).filter(key => key.startsWith('update-'));
    const deleteKeys = Object.keys(localStorage).filter(key => key.startsWith('delete-'));

    const create = createKeys.map(key => ({ ...JSON.parse(localStorage.getItem(key)!), key }));
    const update = updateKeys.map(key => ({ ...JSON.parse(localStorage.getItem(key)!), key }));
    const deleteOps = deleteKeys.map(key => ({ ...JSON.parse(localStorage.getItem(key)!), key }));

    return { create, update, delete: deleteOps };
  }

  removeOperation(key: string): void {
    localStorage.removeItem(key);
  }

  getSubFormValue(resource: any): any {
    let subFormValue: { resources: any[], fieldName: string }[] = [];
    for (const key in resource) {
      if (resource.hasOwnProperty(key) && Array.isArray(resource[key]) && resource[key].every((item: any) => typeof item === 'object')) {
          subFormValue.push({ resources: resource[key], fieldName: key });
          resource[key] = [];
      }
    }
    return subFormValue;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
