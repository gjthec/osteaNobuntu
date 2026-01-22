import { Injectable } from '@angular/core';
import {
  PublicClientApplication,
  AccountInfo,
  SilentRequest,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { msalConfig, tokenRequest } from './config/msal.config';

import { IAuthService, IAuthUser, IAuthResult } from '../auth/models/auth.models';

@Injectable()
export class MsalAuthService implements IAuthService {
  private msalInstance: PublicClientApplication;
  private msalInstanceInitialized: boolean = false;

  constructor() {

    this.msalInstance = new PublicClientApplication(msalConfig);
    // this.initializeMsal();
  }

  private async initializeMsal(): Promise<void> {
    try {
      await this.msalInstance.initialize();
      this.msalInstanceInitialized = true;

      // Após inicialização, verifica se tem contas em cache
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        // Define a primeira conta como ativa se não houver uma conta ativa
        if (!this.msalInstance.getActiveAccount()) {
          this.msalInstance.setActiveAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar MSAL:', error);
    }
  }

  isInitialized(): boolean {
    return this.msalInstanceInitialized;
  }

  async login(): Promise<IAuthResult> {

    if (!this.isInitialized()) {
      console.warn('MSAL não inicializado ao tentar login');
      return { success: false, error: 'MSAL não inicializado' };
    }

    try {
      const result = await this.msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email', 'User.Read']
      });

      if (result && result.account) {

        this.msalInstance.setActiveAccount(result.account);

        const user = this.mapAccountToUser(result.account);
        return {
          success: true,
          user,
          token: result.accessToken
        };
      }

      return { success: false, error: 'Login falhou' };
    } catch (error) {
      console.error('Erro durante login:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido durante login'
      };
    }
  }

  async logout(): Promise<void> {

    if (!this.isInitialized()) {
      console.warn('MSAL não inicializado');
      return null;
    }

    await this.msalInstance.logoutPopup({
      postLogoutRedirectUri: window.location.origin
    });
  }

  getUser(): IAuthUser | null {

    if (!this.isInitialized()) {
      console.warn('MSAL não inicializado ao obter usuário');
      return null;
    }

    const account = this.msalInstance.getActiveAccount();
    if (!account) {
      return null;
    }

    return this.mapAccountToUser(account);
  }

  isAuthenticated(): boolean {
    if (!this.isInitialized()) {
      console.warn('MSAL não inicializado ao obter usuário');
      return null;
    }

    return !!this.msalInstance.getActiveAccount();
  }

  async getAccessToken(scopes: string[] = tokenRequest.scopes): Promise<string | null> {

    if (!this.isInitialized()) {
      console.warn('MSAL não inicializado.');
      return null;
    }

    const account = this.msalInstance.getActiveAccount();
    if (!account) {
      return null;
    }

    const request: SilentRequest = {
      scopes,
      account
    };

    try {

      const response = await this.msalInstance.acquireTokenSilent(request);
      return response.accessToken;

    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token expirado ou interação necessária
        try {
          const response = await this.msalInstance.acquireTokenPopup({scopes: scopes});
          return response.accessToken;
        } catch (popupError) {
          console.error('Erro ao adquirir token via popup:', popupError);
          return null;
        }
      }
      console.error('Erro ao adquirir token silenciosamente:', error);
      return null;
    }
  }

  private mapAccountToUser(account: AccountInfo | null): IAuthUser | null {
    if (!account) {
      return null;
    };

    return {
      UID: account.homeAccountId,
      name: account.name || '',
      email: account.username,
      roles: this.extractRolesFromIdToken(account),
    };
  }

  private extractRolesFromIdToken(account: AccountInfo): string[] {
    // Extrair roles do token ID (depende da configuração do seu Azure AD)
    const idTokenClaims = account.idTokenClaims as any;
    return idTokenClaims?.roles || [];
  }

}