import { Injectable } from '@angular/core';
import { FilterParameters, FilterSearchParameters } from './base-resource-filter.component';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  searchParametersLocalStorageKey: string = "searchParameters";

  /**
  * Nome da classe/entidade na qual os campos pertencem. Exemplo: Classe "Car".
  */
  className?: string;

  filterParameters: FilterParameters[];

  JSONURL?: string;

  constructor(private httpClient: HttpClient) { }

  /**
   * Salva SearchParameters no sessionStorage
   * @param value - Valor a ser salvo (pode ser qualquer tipo)
  */
  saveSearchParametersOnLocalStorage(value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(this.searchParametersLocalStorageKey, serializedValue);
    } catch (error) {
      console.error('Erro ao salvar no sessionStorage:', error);
    }
  }

  /**
   * Recupera SearchParameters do sessionStorage
   * @returns O valor deserializado ou null se não existir
  */
  getSearchParametersFromLocalStorage(): FilterSearchParameters {
    try {
      const item = sessionStorage.getItem(this.searchParametersLocalStorageKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erro ao recuperar do sessionStorage:', error);
      return null;
    }
  }

  getPublicSearchFilterParameterList(className: string): Observable<FilterSearchParameters[]> {
    return this.httpClient.get<{ items: FilterSearchParameters[] }>(`${environment.backendUrl}/api/filter-search-parameters?className=${className}`)
    .pipe(
      map(response => response.items)
    );
  }

  private filtersSub = new BehaviorSubject<FilterSearchParameters[] | null>(null);
  filters$: Observable<FilterSearchParameters[] | null> = this.filtersSub.asObservable();

  fetchSearchFilterParameterList(className: string) {
    this.httpClient.get<{ items: FilterSearchParameters[] }>(
      `${environment.backendUrl}/api/filter-search-parameters?className=${className}`
    )
    .subscribe({
      next: res => this.filtersSub.next(res.items),
      error: err => console.error(err)
    });
  }
}
