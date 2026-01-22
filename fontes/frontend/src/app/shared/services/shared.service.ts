import { Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { BaseResourceModel } from "../models/base-resource.model";
import { OnlineOfflineService } from "./online-offline.service";
import { OfflineStorageService } from "./offline-storage.service";


export abstract class BaseResourceService<T extends BaseResourceModel> {

  protected http: HttpClient;
  private isOnline: boolean;
  private onlineOfflineService: OnlineOfflineService;
  private offlineStorageService: OfflineStorageService;

  constructor(
    protected apiPath: string,
    protected injector: Injector,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
    this.http = injector.get(HttpClient);
    this.onlineOfflineService = injector.get(OnlineOfflineService);
    this.offlineStorageService = injector.get(OfflineStorageService);
    this.isOnline = this.onlineOfflineService.isOnline;
  }

  getAll(): Observable<T[]> {
    return this.http.get(this.apiPath).pipe(
      map(this.jsonDataToResources.bind(this)),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<T> {
    console.log("getById => ", id);
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)
    );
  }

  getByIdWithEagerLoading(id: string): Observable<T> {
    const url = `${this.apiPath}/eagerloading/${id}`;

    return this.http.get(url).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)
    );
  }

  create(resource: T): Observable<T> {
    console.log("create => ", resource);
    if (!this.isOnline) {
      this.offlineStorageService.saveCreateOperation(this.apiPath, resource);
      return new Observable(observer => {
        observer.next(resource);
        observer.complete();
      });
    }

    return this.http.post(this.apiPath, resource).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)
    );
  }

  update(id: string, resource: T): Observable<T> {
    if (!this.isOnline) {
      this.offlineStorageService.saveUpdateOperation(this.apiPath, id, resource);
      return new Observable(observer => {
        observer.next(resource);
        observer.complete();
      });
    }

    const url = `${this.apiPath}/${id}`;

    return this.http.put(url, resource).pipe(
      map(() => resource),
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<any> {
    if (!this.isOnline) {
      this.offlineStorageService.saveDeleteOperation(this.apiPath, id);
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      map(() => null),
      catchError(this.handleError)
    );
  }

  // PROTECTED METHODS
  /**
   * Cria várias instancias da classe T com base nos valores do JSON
   * @param jsonData Array de dados do JSON
   * @returns retorna várias instância da classe T
   */
  protected jsonDataToResources(jsonData: any[]): T[] {
    // console.log("jsonDataToResources => ", jsonData);
    const resources: T[] = [];
    jsonData.forEach(
      element => resources.push(this.jsonDataToResourceFn(element))
    );
    return resources;
  }

  /**
   * Instancia a classe T com base nos valores do JSON
   * @param jsonData Dados do JSON
   * @returns retorna uma instância da classe T
   */
  protected jsonDataToResource(jsonData: any): T {
    return this.jsonDataToResourceFn(jsonData);
  }

  protected handleError(error: any): Observable<any> {
    console.error("ERRO NA REQUISIÇÃO => ", error);
    // Aqui, você pode implementar notificações de erro ou estratégias de nova tentativa
    return throwError(error);
  }
}
