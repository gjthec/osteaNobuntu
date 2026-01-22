import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  canActivate(next: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = next.data.roles as Array<string>;

    const user = JSON.parse(localStorage.getItem('user')).role;

    if (!user) {
      return false;
    }

    if(user.isAdministrator) {
        return true;
    }
    
    const userRoles = user.Roles;

    if (userRoles.some(role => allowedRoles.includes(role.name))) {
      return true;
    } else {
      return false;
    }
  }
}