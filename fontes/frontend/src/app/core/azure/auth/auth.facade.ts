import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IAuthService, IAuthUser } from '../auth/models/auth.models';
import { MsalAuthService } from './msal-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private userSubject = new BehaviorSubject<IAuthUser | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  public readonly user$: Observable<IAuthUser | null> = this.userSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  
  //TODO alterar o tipo de modelo de autenticação deve ser alterado essa parte do que é injetado na aplicação
  constructor(@Optional() private authService?: MsalAuthService) {
    // Inicializar o estado com base no usuário atual
    this.checkAuthState();
  }
  
  private checkAuthState(): void {
    if (!this.authService) {
      this.userSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      return;
    }

    const user = this.authService.getUser();
    const isAuthenticated = this.authService.isAuthenticated();
    
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
  }
  
  async login(): Promise<boolean> {
    if (!this.authService) {
      return false;
    }

    const result = await this.authService.login();
    
    if (result.success && result.user) {

      this.userSubject.next(result.user);
      this.isAuthenticatedSubject.next(true);

      return true;
    }
    
    return false;
  }
  
  async logout(): Promise<void> {
    if (!this.authService) {
      return;
    }

    await this.authService.logout();
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
  
  getUser(): IAuthUser | null {
    return this.authService ? this.authService.getUser() : null;
  }
  
  isAuthenticated(): boolean {
    return this.authService ? this.authService.isAuthenticated() : false;
  }
  
  async getAccessToken(scopes?: string[]): Promise<string | null> {
    return this.authService ? this.authService.getAccessToken(scopes) : null;
  }
  
}
