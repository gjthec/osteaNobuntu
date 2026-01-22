import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConsultaPageStructure } from '../models/consulta.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultaGeneratorService {

  constructor(private http: HttpClient) { }

  getJSONFromDicionario(JSONURL: string): Observable<IConsultaPageStructure> {
    return this.http.get<IConsultaPageStructure>(JSONURL);
  }
}
