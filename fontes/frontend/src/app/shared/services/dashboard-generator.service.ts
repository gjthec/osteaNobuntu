import { Injectable, Injector, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormField } from '../models/form-field';
import { IPageStructure } from '../models/pageStructure';

export interface ICard {
  name: string;
  data: any;
}

export interface ICharType {
  type: string;
  tittle: string;
  typeOfData: string;
  apiUrl: string;
  colorSchema: string;
  legendTitle: string;
  legendPosition: string;
  hideZeroValues: boolean;
  dataLabels: boolean;
  gridLines: boolean;
}

/**
 * 
  */
export interface ICreateDashboardParams {
  cards: ICard[];
  target: ViewContainerRef,
  char: ICharType;
}

/**
 * Classe responsável pela geração dos dashbords.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardGeneratorService {

  protected httpClient: HttpClient;
  protected formBuilder: FormBuilder;
  protected matDialog: MatDialog;

  constructor(protected injector: Injector) {
    this.httpClient = injector.get(HttpClient);    
  }

  buildResourceForm(formBuilder: FormBuilder): FormGroup {
    return formBuilder.group({
      id: [null],
    });
  }

  getJSONFromDicionario(JSONToGenerateScreenPath: any): Observable<IPageStructure> {
    return this.httpClient.get<IPageStructure>(JSONToGenerateScreenPath);//TODO aqui será a rota do backend que pegará o JSON do usuário
  }
}
