import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, from, Observable, of, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { IUser, SignupDTO } from './user.model';
import { TenantService } from '../tenant/tenant.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private url;

  /**
   * Constructor
   */
  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {

    this.url = environment.backendUrl + "/api/role";

  }

  async getRolesUserByIdInLocalStorage(userId: string) {
    const url = `${this.url}/user?userId=${userId}`;

    const roles = await this.httpClient.get<any[]>(url).pipe(
        catchError((error) => {
            console.error('Erro ao obter as roles do usuário:', error);
            return of([]); // Retorna um array vazio em caso de erro
        })
        ).toPromise() as unknown as Promise<string[]>;

    localStorage.setItem('userRoles', JSON.stringify(roles));
  }
    

  async getRolesCurrentUserInLocalStorage() {
    const currentUser = this.userService.getCurrentUserFromLocalStorage();

    if (currentUser == null) {
        throw new Error("Usuário não encontrado no localStorage para obter as roles.");
    }

    const userId = currentUser.id;

    const url = `${this.url}/user?userId=${userId}`;

    const roles = await this.httpClient.get<any[]>(url).pipe(
        catchError((error) => {
            console.error('Erro ao obter as roles do usuário:', error);
            return of([]); // Retorna um array vazio em caso de erro
        })
        ).toPromise() as unknown as Promise<string[]>;

    localStorage.setItem('userRoles', JSON.stringify(roles));
  }

  deleteAllRolesFromLocalStorage(): void {
    localStorage.removeItem('userRoles');
  }
}