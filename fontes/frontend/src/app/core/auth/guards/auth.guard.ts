import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree
} from '@angular/router';
import { Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	/**
	 * Constructor
	 */
	constructor(
		private _authService: AuthService,
		private _router: Router,
		private httpClient: HttpClient
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Can activate
	 *
	 * @param route
	 * @param state
	 */
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	):
		| Observable<boolean | UrlTree>
		| Promise<boolean | UrlTree>
		| boolean
		| UrlTree {
		return this._check(state.url);
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Private methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Check the authenticated status
	 *
	 * @param url
	 * @private
	 */
	private _check(url: string): Observable<boolean | UrlTree> {
		// Check the authentication status

		return this._authService.check().pipe(
			switchMap((authenticated) => {
				if (!authenticated) {
					return this.redirectToSignIn(url);
				}

				return of(true);
			}),
			take(1)
		);
	}

	private saveRedirectURL(redirectURL: string) {
		localStorage.setItem('redirectURL', redirectURL);
	}

	/**
	 * Redireciona para a página de login e retorna `of(false)`
	 */
	private redirectToSignIn(url: string): Observable<boolean> {
		// Redirecionará para pagina de sign-in com um redirectUrl param
		this.saveRedirectURL(url);
		//Redireciona o usuário para página de signIn
		this._router.navigate(['signin']);
		return of(false);
	}

	//TODO ao verificar o acesso a página, obter o JSON de contrução de página relacionado a pagina requisitada e a role do usuário
	verifyAcessToPage(url: string) {
		//No momento que a pessoa for acessar a rota, preciso ler o JSON do menu e pegar o caminho da API
		this.httpClient
			.get<any>(environment.menuPath)
			.pipe(take(1))
			.subscribe({
				next: (data) => {
					const routeobj = data['itens'].find(
						(item) => item.routeUrl === url.substring(1)
					);

					if (routeobj == null) return;

					const _params = new HttpParams()
						.set('method', 'GET')
						.set('apiUrl', '/cartaoConsumo');

					this.httpClient
						.get<any>(environment.backendUrl + '/api/guard', {
							params: _params
						})
						.subscribe({
							next: (data) => console.log(data)
						});
				}
			});
	}
}
