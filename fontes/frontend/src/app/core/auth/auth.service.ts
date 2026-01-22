import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, from, Observable, of, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { IUser, SignupDTO } from './user.model';
import { TenantService } from '../tenant/tenant.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { UserService } from './user.service';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // private _currentUserSession: IUserSession | null = null;
  private _currentUser: IUser | null = null;

  private url;

  /**
   * Constructor
   */
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    // private userSessionService: UserSessionService,
    private tenantService: TenantService,
    private userService: UserService,
    private roleService: RoleService,
  ) {

    this.url = environment.backendUrl + "/api/authentication";

  }

  get currentUser(): IUser | null {

    //Se não tiver sessão de usuário atual ele irá obter dados os localStorage
    if (this._currentUser == null) {

      //Irá obter o usuário atual usado do localstorage
      let userFromLocalStorage = this.userService.getCurrentUserFromLocalStorage();

      if (userFromLocalStorage == null) {
        //Obtem algum usuário da lista de usuários
        userFromLocalStorage = this.userService.getAnyUserFromLocalStorage();
        this.userService.setCurrentUserOnLocalStorage(userFromLocalStorage);
      }

      this._currentUser = userFromLocalStorage;
    }

    return this._currentUser;
  }

  set currentUser(user: IUser | null) {
    this._currentUser = user;
  }

  getUsers(): IUser[] | null {
    return this.userService.getUsersFromLocalstorage();
  }

  getInactiveUsers(): IUser[] | null {
    const currentUser = this.currentUser;
    const users = this.getUsers();

    if (users == null || currentUser == null) {
      return null;
    }

    return users.filter(_user => _user.UID != currentUser.UID);
  }

  /**
   * Realiza a troca de sessão de usuário ativa no momento
   * @param userUID UID do usuário que sua sessão está ativa
   */
  switchUser(userUID: string): IUser {

    const users: IUser[] = this.userService.getUsersFromLocalstorage();
    //Percorre as sessões de usuários salvas no local Storage.
    const _user: IUser = users.find(_userSession => _userSession.UID === userUID) || null;

    if (_user != null) {
      //Caso for encontrado a sessão de usuário que se tem interesse em fazer uso, faz a troca para essa sessão de usuário que será a utilizada nas requisições
      this.currentUser = _user;
      //Armazena no local storage a nova sessão de usuário ativa
      this.userService.setCurrentUserOnLocalStorage(this.currentUser);
      this.userService.moveUserToFirstPositionOnLocalStorage(this.currentUser.UID);
      this.roleService.getRolesUserByIdInLocalStorage(this.currentUser.id)
      localStorage.removeItem('currentMenu');
      localStorage.removeItem('menus');

      return this.currentUser;
    }

    throw new Error("Não foi possível alterar o usuário ativo");

  }

  async signOutUser(user: IUser): Promise<void> {
    try {
      await firstValueFrom(this.signout().pipe(take(1)));
      this.roleService.deleteAllRolesFromLocalStorage();
      this.userService.deleteUserFromLocalStorage(user.UID);
      this.userService.deleteCurrentUserFromLocalStorage();
      localStorage.removeItem('currentMenu');
      localStorage.removeItem('menus');
      this.currentUser = null;
    } catch (error) {
      console.error("Error to signOut user.");
    }
  }

  async signOutAllUsers(): Promise<void> {
    const users = this.userService.getUsersFromLocalstorage();

    for (const user of users) {
      try {
        // Aguarda o signout ser concluído antes de passar para o próximo usuário
        await firstValueFrom(this.signout().pipe(take(1)));

        // Limpa os dados do usuário do localStorage
        this.userService.deleteUserFromLocalStorage(user.UID);
        this.userService.deleteCurrentUserFromLocalStorage();
        this.roleService.deleteAllRolesFromLocalStorage();
        localStorage.removeItem('currentMenu');
        localStorage.removeItem('menus');
        this.currentUser = null;


      } catch (error) {
        console.error("Error to signOut user.");
      }
    }

    //Limpa todas as sessões do LocalStorage
    this.userService.deleteAllUserFromLocalStorage();
    this.currentUser = null;
    this.tenantService.deleteAllTenantsFromLocalStorage();

  }

  logoutUserByUID(userUID: string): void {
    // Fará a remoção das informações do usuário no localstorage
    const removedUserUID: string | null = this.userService.deleteUserFromLocalStorage(userUID);

    if (removedUserUID == null) {
      throw new Error("Erro ao encerrar a sessão do usuário");
    }

    // Se o usuário atual for o mesmo que está sendo removido o acesso, alterar para a outra conta que está acessada.
    if (this.currentUser && this.currentUser.UID === removedUserUID) {

      const otherUser: IUser | null = this.userService.getAnyUserFromLocalStorage();

      if (otherUser != null) {
        this.switchUser(otherUser.UID);
      }

    }

    this.router.navigate(['/']);
  }

  /**
   * Check the authentication status
   */
  check(): Observable<boolean> {

    if (this.currentUser != null &&
      this.tenantService.currentTenant != null) {
      return of(true);
    }

    return of(false);
  }

  signin(email: string, password: string): Observable<IUser> {
    return this.httpClient.post<IUser>(`${this.url}/signin`, { email, password }, { withCredentials: true });//"{withCredentials: true}" instrui o Angular a incluir cookies em requisições HTTP
  }

  signup(signupDTO: SignupDTO): Observable<IUser> {
    return this.httpClient.post<IUser>(`${this.url}/signup`, signupDTO);
  }

  signout() {
    return this.httpClient.post<IUser>(`${this.url}/signout`, {});
  }

  checkEmailExist(email: string): Observable<boolean> {
    return this.httpClient.post<boolean>(`${this.url}/check-email-exist`, { email });
  }

  sendVerificationEmailCodeToEmail(email: string): Observable<any> {
    return this.httpClient.post(`${this.url}/send-verification-email-code`, { email });
  }

  sendPasswordResetLinkToEmail(email: string): Observable<any> {
    return this.httpClient.post(`${this.url}/send-password-reset-link-to-email`, { email });
  }

  resetPassword(password: string, resetPasswordToken: string) {
    return this.httpClient.patch<IUser>(`${this.url}/reset-password`, { password, resetPasswordToken });
  }

  validateVerificationEmailCode(verificationEmailCode: string): Observable<any> {
    return this.httpClient.post(`${this.url}/validate-verification-email-code`, { verificationEmailCode });
  }

  refreshAccessToken(): Observable<IUser[]> {
    return this.httpClient.get<IUser[]>(`${this.url}/refresh-token`);
  }

  singleSignOn(): Observable<IUser[]> {
    return this.httpClient.get<IUser[]>(`${this.url}/single-sign-on`);
  }

  /**
   * Obtem dados de usuário e tenants para armazenamento local
   */
  handleToken(): Observable<boolean> {

    return from(this.refreshAccessToken().pipe(take(1))).pipe(
      switchMap((usersData: IUser[]) => {

        if (usersData.length === 0) {
          return throwError(() => new Error("Nenhum usuário retornado após a atualização do token."));
        }

        if (this.userService.getCurrentUserFromLocalStorage() == null) {
          this.userService.setCurrentUserOnLocalStorage(usersData[0]);
          this.userService.moveUserToFirstPositionOnLocalStorage(usersData[0].UID);
          this.currentUser = usersData[0];
        }

        usersData.forEach((userData: IUser) => {
          this.userService.addUserOnLocalStorage(userData);
          this.tenantService.getTenantsAndSaveInLocalStorage(userData.UID);
        });

        let currentTennat = this.tenantService.currentTenant;

        return of(true);
      }),
      catchError((error) => {
        console.error("Erro ao atualizar token:", error);
        return of(false);
      })
    );
  }

}