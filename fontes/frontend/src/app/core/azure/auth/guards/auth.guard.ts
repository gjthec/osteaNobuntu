// src/app/auth/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthFacade } from '../auth.facade';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authFacade: AuthFacade,
    private router: Router
  ) { }

  //Antes que o componente da rota seja instanciado é feito a verificação se a rota pode ser ativada
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {


    // Verificação síncrona imediata
    if (this.authFacade.isAuthenticated()) {
      return this.checkRoles(route) || true;
    }

    // Se não estiver autenticado, redireciona para a página inicial
    this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
    return false;

  }

  private checkRoles(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
      const user = this.authFacade.getUser();
      const hasRequiredRole = user?.roles.some(role => requiredRoles.includes(role));

      if (!hasRequiredRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }
    return true;
  }
}