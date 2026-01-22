import { Injectable, Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

/**
 * Classe que tem as funções básicas de CRUD, porém ele não usa Models.
 */
@Injectable({
  providedIn: 'root'
})
export abstract class DinamicBaseResourceService {

  protected http: HttpClient;
  public apiPath: string;

  constructor(
    protected injector: Injector,
  ) {
    this.http = injector.get(HttpClient);
  }

  getAll(): Observable<any> {
    return this.http.get(this.apiPath).pipe(
      map(this.jsonDataToResources.bind(this)),
      catchError(this.handleError)
    )
  }

  getById(id: string): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)
    )
  }

  create(resource: any): Observable<any> {

    return this.http.post(this.apiPath, resource).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)
    )
  }

  update(id, resource: any): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.http.patch(url, resource).pipe(
      map(() => resource),
      catchError(this.handleError)
    )
  }

  delete(id: string): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      map(() => null),
      catchError(this.handleError)
    )
  }

  deleteAll(): Observable<any> {
    return this.http.delete(this.apiPath).pipe(
      map(() => null),
      catchError(this.handleError)
    )
  }

  // PROTECTED METHODS

  protected jsonDataToResources(jsonData: any[]): any[] {
    const resources: any[] = [];
    jsonData.forEach(
      element => resources.push(this.jsonDataToResource(element))
    );
    return resources;
  }

  protected jsonDataToResource(jsonData: any): any {
    return jsonData;
  }

  protected handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}