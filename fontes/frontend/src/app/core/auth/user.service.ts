import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from 'app/shared/services/shared.service';
import { environment } from 'environments/environment';
import { IUser, User } from './user.model';
import { catchError, map, Observable } from 'rxjs';
import { LocalStorageService } from 'app/shared/services/local-storage.service';

interface InviteUserToApplicationDTO {
  invitingUserUID: string;
  invitingUserEmail: string;//Email do usuário que está convidando alguém
  invitedUserEmail: string;//Email do usuário que está sendo convidado
  invitedUserTenantIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseResourceService<User> {

  protected http: HttpClient;
  protected usersLocalStorageKey: string = "usersList";
  protected currentUserLocalStorageKey: string = "currentUser";

  constructor(
    protected override injector: Injector,
    private localStorageService: LocalStorageService
  ) {
    var url = environment.backendUrl + "/api/user";
    super(url, injector, User.fromJson)
  }

  getByUID(UID: string): Observable<User> {
    const url = `${this.apiPath}/uid/${UID}`;

    return this.http.get(url).pipe(
      map(this.jsonDataToResource.bind(this)),
      catchError(this.handleError)
    )
  }

  getUsersFromLocalstorage(): IUser[] | null {
    const localStorageData = this.localStorageService.get(this.usersLocalStorageKey);

    if (localStorageData == "" ||
      localStorageData == "[]"
    ) {
      return null;
    }

    return localStorageData;
  }

  getAnyUserFromLocalStorage(): IUser | null {
    const users: IUser[] = this.getUsersFromLocalstorage();

    if (users == null || users.length == 0) {
      return null;
    }

    //Pega o primeiro
    return users[0];
  }

  addUserOnLocalStorage(user: IUser): void {

    let users: IUser[] | null = this.getUsersFromLocalstorage();

    if (users != null) {

      const index = users.findIndex(_user => _user.UID === user.UID);

      if (index !== -1) {
        // Substitui o usuário mantendo a posição original
        users[index] = user;
      } else {
        // Caso o usuário não exista, adiciona ao final
        users.push(user);
      }

      // Salva novamente
      this.localStorageService.set(this.usersLocalStorageKey, users)
    } else {
      this.localStorageService.set(this.usersLocalStorageKey, [user]);
    }

  }

  setCurrentUserOnLocalStorage(user: IUser): IUser {

    this.localStorageService.set(this.currentUserLocalStorageKey, user);
    return user;
    
  }

  getCurrentUserFromLocalStorage(): IUser | null {
    // Recuperar os dados do localStorage
    const data = localStorage.getItem(this.currentUserLocalStorageKey);
    if (!data) {
      console.error("Not found user on localstorage:", this.currentUserLocalStorageKey);
      return null;
    }

    // Converter os dados em um array
    let user: IUser;
    try {
      user = JSON.parse(data);
    } catch (error) {
      console.error("Error to parse localStorage data:", error);
      return null;
    }

    return user;
  }

  /**
   * Remove os dados da sessão do usuário da lista de usuários com sessão
   * @param userUID 
   * @returns Retorna o userUID do usuário removido
   */
  deleteUserFromLocalStorage(userUID: string): string | null {

    let user: IUser[] = this.getUsersFromLocalstorage();

    if (user != null) {

      user = user.filter(_user => _user.UID !== userUID);

      this.localStorageService.set(this.usersLocalStorageKey, user)

      return userUID;
    }

    return null;
  }

  deleteAllUserFromLocalStorage() {
    this.localStorageService.remove(this.usersLocalStorageKey);
  }

  deleteCurrentUserFromLocalStorage() {
    this.localStorageService.remove(this.currentUserLocalStorageKey);
  }

  sendChangePasswordLink(email: string) {
    return this.http.post<IUser>(`${this.apiPath}/send-change-password-link`, { email });
  }

  checkEmailIsUsed(email: string) {
    return this.http.post(`${this.apiPath}/check-email-is-used`, { email });
  }

  inviteUser(input: InviteUserToApplicationDTO) {
    return this.http.post(`${this.apiPath}/invite-user`, input);
  }

  getUserProfilePhoto(userUID: string): Observable<string> {
    return this.http.get<string>(`${this.apiPath}/get-user-profile-photo/${userUID}`);
  }

  moveUserToFirstPositionOnLocalStorage(userUID: string) {

    // Recuperar os dados do localStorage
    const data = localStorage.getItem(this.usersLocalStorageKey);
    if (!data) {
      console.error("Not found user on localstorage:", this.usersLocalStorageKey);
      return;
    }

    // Converter os dados em um array
    let usersArray;
    try {
      usersArray = JSON.parse(data);
    } catch (error) {
      console.error("Error to parse localStorage data:", error);
      return;
    }

    if (!Array.isArray(usersArray)) {
      console.error("UserList on localStorage aren't array.");
      return;
    }

    // Encontrar o índice do usuário
    const userIndex = usersArray.findIndex(user => user.UID === userUID);
    if (userIndex === -1) {
      console.warn("User with ID", userUID, "not found on array.");
      return;
    }

    // Remover o usuário do array e movê-lo para a primeira posição
    const [user] = usersArray.splice(userIndex, 1);
    usersArray.unshift(user);

    // Atualizar o localStorage
    localStorage.setItem(this.usersLocalStorageKey, JSON.stringify(usersArray));

  }

}