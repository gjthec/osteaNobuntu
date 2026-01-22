import { Injectable } from '@angular/core';
import { CanMatch, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanMatch
{
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can match
     *
     * @param route
     * @param segments
     */
    canMatch(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        return this._check();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Verifica o status de autenticação
     *
     * @private
     */
    private _check(): Observable<boolean>
    {
        // Verifica o status de autenticação e retorna um  observable of
        // "true" ou "false" para permitir ou previnir o acesso
        return this._authService.check().pipe(
            switchMap((authenticated) => of(!authenticated))
        );
        
    }
}
