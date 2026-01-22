import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfflineOperation, OfflineStorageService } from './offline-storage.service';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {

  constructor(private offlineStorageService: OfflineStorageService,private http: HttpClient, private matSnackBar: MatSnackBar) {}

  syncPendingOperations() {
    const pendingOperations = this.offlineStorageService.getAllPendingOperations();

    pendingOperations.create.forEach(operation => {
      this.executeCreateOperation(operation);
    });

    pendingOperations.update.forEach(operation => {
      this.executeUpdateOperation(operation);
    });

    pendingOperations.delete.forEach(operation => {
      this.executeDeleteOperation(operation);
    });
  }

  private async executeCreateOperation(operation: any) {
    const { apiPath, resource, subForms } = operation;
    if (subForms) {
      await this.executeCreateOperationWithSubForms(apiPath, resource, subForms);
      this.offlineStorageService.removeOperation(operation.key);
      return;
    }

    this.http.post(apiPath, resource).subscribe(
      () => this.offlineStorageService.removeOperation(operation.key),
      error => this.matSnackBar.open('Falha ao sincronizar operação de criação', 'Fechar', { duration: 3000 } )
    );
  }

  private executeUpdateOperation(operation: any) {
    const { apiPath, id, resource, subForms } = operation;

    if(subForms) {
      this.executeUpdateOperationWithSubForms(apiPath, id, resource, subForms);
      this.offlineStorageService.removeOperation(operation.key);
      return;
    }

    const url = `${apiPath}/${id}`;
    this.http.patch(url, resource).subscribe(
      () => this.offlineStorageService.removeOperation(operation.key),
      error => this.matSnackBar.open('Falha ao sincronizar operação de atualização', 'Fechar', { duration: 3000 } )
    );
  }

  private executeDeleteOperation(operation: any) {
    const { apiPath, id } = operation;
    const url = `${apiPath}/${id}`;
    this.http.delete(url).subscribe(
      () => this.offlineStorageService.removeOperation(operation.key),
      error => this.matSnackBar.open('Falha ao sincronizar operação de exclusão', 'Fechar', { duration: 3000 } )

    );
  }

  private executeUpdateOperationWithSubForms(apiPath: string, id: number, resource: any, subForms: any[]) {
    subForms.forEach(subForm => {
      subForm.resources.forEach(subResource => {
        if(subResource.item.id) {
          const url = `${environment.backendUrl}/${subResource.apiUrl}/${subResource.item.id}`;
          this.http.patch(url, subResource.item).subscribe(
            () => {},
            error => this.matSnackBar.open('Falha ao sincronizar operação de atualização', 'Fechar', { duration: 3000 } )
          );
        } else {
          const url = `${environment.backendUrl}/${subResource.apiUrl}`;
          this.http.post(subResource.apiUrl, subResource.item).subscribe(
            (data: any) => {
              resource[subForm.fieldName].push(data.id);
            },
            error => this.matSnackBar.open('Falha ao sincronizar operação de criação', 'Fechar', { duration: 3000 } )
          );
        }
      });
    });

    const url = `${apiPath}/${id}`;
    this.http.patch(url, resource).subscribe(
      () => this.matSnackBar.open('Operação de atualização sincronizada com sucesso', 'Fechar', { duration: 3000 } ),
      error => this.matSnackBar.open('Falha ao sincronizar operação de atualização', 'Fechar', { duration: 3000 } )
    );
  }

  
  private async executeCreateOperationWithSubForms(apiPath: string, resource: any, subForms: any[]) {
    for (const subForm of subForms) {
      for (const subResource of subForm.resources) {
        console.log("subForm.apiPath => ", subResource.apiUrl);
        subResource.apiUrl = environment.backendUrl + '/' + subResource.apiUrl;
        await this.http.post(subResource.apiUrl, subResource.item).toPromise()
          .then((data: any) => {
            resource[subForm.fieldName].push(data.id);
          })
          .catch(error => this.matSnackBar.open('Falha ao sincronizar operação de criação', 'Fechar', { duration: 3000 } ));
      }
    }

    this.http.post(apiPath, resource).subscribe((data) => {
      this.matSnackBar.open('Operação de criação sincronizada com sucesso', 'Fechar', { duration: 3000 } );
    },
      error => this.matSnackBar.open('Falha ao sincronizar operação de criação', 'Fechar', { duration: 3000 } )
    );
  }
}
