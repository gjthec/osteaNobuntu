import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { INavList } from '../components/side-nav/side-nav.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }

  private apiUrl = environment.backendUrl + '/api/menu';
  private frontUrl = environment.frontendUrl;


  getMenuByRole(): Observable<INavList[] | INavList> {
    const rolesId = this.getRolesId();
    if(!rolesId || rolesId.length === 0) {
      return this.getDefaultMenu();
    }

    const url = `${this.apiUrl}/menu-by-role?roleId=${rolesId}`;
    return this.http.get<INavList[]>(url);
  }

  getMenuById(id: string): Observable<INavList[]> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<INavList[]>(url);
  }

  getDefaultMenu(): Observable<INavList[] | INavList> {
    const url = `${this.apiUrl}/default-menu`;
    return this.http.get<INavList>(url);
  }

  getMenuByFileName(fileName: string): Observable<INavList> {
    const url = `${this.frontUrl}/assets/dicionario/menu/${fileName}`;
    return this.http.get<INavList>(url);
  }

  private getRolesId(): string | string[]{
    const userRole: {id: string, name: string}[] = JSON.parse(localStorage.getItem('userRoles') || '[]');
    const rolesId: string[] = userRole.map((role) => role.id);
    return rolesId.length > 1 ? rolesId : rolesId[0];
  }
}
