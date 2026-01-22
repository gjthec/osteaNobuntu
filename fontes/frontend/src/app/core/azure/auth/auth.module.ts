import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthFacade } from './auth.facade';
import { MsalAuthService } from './msal-auth.service';
import { environment } from './../../../../environments/environment';
import { IAuthService } from './models/auth.models';

// Factory para selecionar o serviço de autenticação baseado na variável de ambiente "authMethod"
function authServiceFactory(): IAuthService {
	console.log('environment.authMethod: ', environment.authMethod);

	switch (environment.authMethod) {
		case 'MSAL':
			return new MsalAuthService();

		case 'NORMAL':
			// Stub "NO-OP" para não quebrar enquanto NORMAL não está implementado
			return {
				async login() {
					return { success: false, error: 'Auth NORMAL não implementado' };
				},
				async logout() {
					/* no-op */
				},
				isAuthenticated() {
					return false;
				},
				getUser() {
					return null;
				},
				async getAccessToken() {
					return null;
				}
			} as IAuthService;

		default:
			// Fallback seguro
			throw new Error(
				'Método de autenticação não suportado: ' + environment.authMethod
			);
	}
}

// Função de inicialização para garantir que o serviço esteja inicializado
function initializeAuth(authService: IAuthService): () => Promise<void> {
	return () =>
		new Promise<void>((resolve) => {
			const initialize = async () => {
				// Verifica se o serviço tem método de inicialização
				if (typeof (authService as any).initializeMsal === 'function') {
					// Função de inicialização do MSAL para garantir que ele esteja inicializado antes da inicialização de tudo
					await (authService as any).initializeMsal();
					console.log('oii');
				}
				// Se deve adicionar outras inicializações com base na adição de métodologias de controle de acesso
				resolve();
			};
			initialize();
		});
}

@NgModule({
	imports: [CommonModule],
	providers: [
		{
			provide: MsalAuthService,
			useFactory: authServiceFactory
		},
		// AuthFacade,
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{
			provide: APP_INITIALIZER,
			useFactory: initializeAuth,
			deps: [MsalAuthService], // Isso vai injetar a instância criada pela factory
			multi: true
		}
	]
})
export class AuthModule {}