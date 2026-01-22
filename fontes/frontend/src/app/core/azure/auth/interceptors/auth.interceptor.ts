import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthFacade } from '../auth.facade';
import { environment } from 'environments/environment';
import { TenantService } from 'app/core/tenant/tenant.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authFacade: AuthFacade, private tenantService: TenantService) { }

  //Em toda requisição que usa o módulo no qual esse interceptador pertence, irá ser obtifo o token de acesso enviado para API
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Verificar se a requisição é para uma API protegida
    if (this.shouldAddToken(request.url)) {
      //Obtem o token de acesso
      return from(this.authFacade.getAccessToken()).pipe(
        switchMap(token => {
          if (token) {

             //Indica qual usuário está fazendo a requisição
            let user: string = "";
            //Indica qual tenant (banco de dados) será a requisição
            let databaseUsedInRequest: string = "";
            
            if (this.tenantService.currentTenant != null) {
              databaseUsedInRequest = String(this.tenantService.currentTenant.databaseCredentialId);//TODO arrumar
            }
            
            //Coloca o token de acesso no cabeçario da requisição
            const authRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
                "usersession": user,
                "X-Tenant-ID": databaseUsedInRequest,
              }
            });
            return next.handle(authRequest);
          }
          return next.handle(request);
        })
      );
    }

    return next.handle(request);
  }

  private shouldAddToken(url: string): boolean {
    // Lógica para determinar se o token deve ser adicionado
    return url.includes(environment.backendUrl);
  }

}