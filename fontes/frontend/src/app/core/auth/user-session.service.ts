import { Injectable } from '@angular/core';
import { IUserSession } from './user.model';
import { LocalStorageService } from 'app/shared/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {

  usersLocalStorageKey: string = "userSessionList";
  currentUserSessionLocalStorageKey: string = "currentUserSession";

  constructor(
    private localStorageService: LocalStorageService
  ) { }

  setCurrentUserSessionOnLocalStorage(userSession: IUserSession): IUserSession{
    this.localStorageService.set(this.currentUserSessionLocalStorageKey, userSession);
    return userSession;
  }

  getCurrentUserSessionFromLocalStorage(): IUserSession {
    const currentUserSession = this.localStorageService.get(this.currentUserSessionLocalStorageKey);
    return currentUserSession;
  }

  getUserSessionsFromLocalstorage(): IUserSession[] | null {
    const localStorageData = this.localStorageService.get(this.usersLocalStorageKey);
    
    if( localStorageData == "" || 
      localStorageData == "[]"
    ){
      return null;
    }

    return localStorageData;
  }
  
  getUserSessionsFromLocalStorageByUID(userUID: string): IUserSession | null {
    const userSessions : IUserSession[] = this.getUserSessionsFromLocalstorage();
    return userSessions.find(userSession => userSession.user.UID === userUID) || null;
  }

  addUserSessionOnLocalStorage(userSession: IUserSession): void {
    
    var userSessions : IUserSession[] | null = this.getUserSessionsFromLocalstorage();

    if(userSessions != null){

      userSessions = userSessions.filter(_userSession => _userSession.user.UID !== userSession.user.UID);
      //Adiciona novamente (caso tenha algum dado alterado)
      userSessions.push(userSession);
      //Salva novamente
      this.localStorageService.set(this.usersLocalStorageKey, userSessions)
    } else {
      this.localStorageService.set(this.usersLocalStorageKey, [userSession]);
    }

  }

  getAnyUserSessionFromLocalStorage(): IUserSession | null {
    const userSessions: IUserSession[] = this.getUserSessionsFromLocalstorage();

    if(userSessions == null || userSessions.length == 0){
      return null;
    }

    return userSessions[0];
  }

  /**
   * Remove os dados da sessão do usuário da lista de usuários com sessão
   * @param userUID 
   * @returns Retorna o userUID do usuário removido
   */
  deleteUserSessionFromLocalStorage(userUID: string): string | null {

    let userSessions : IUserSession[] = this.getUserSessionsFromLocalstorage();

    if(userSessions != null){

      userSessions = userSessions.filter(_userSession => _userSession.user.UID !== userUID);

      this.localStorageService.set(this.usersLocalStorageKey, userSessions)

      return userUID;
    }

    return null;
  }

  deleteAllUserSessionsFromLocalStorage(){
    this.localStorageService.remove(this.usersLocalStorageKey);
  }

  deleteCurrentUserSessionFromLocalStorage(){
    this.localStorageService.remove(this.currentUserSessionLocalStorageKey);
  }
  
}
