import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

/**
 * Intercepta toda requisição adicionando ao cabeçario identificador do usuário da sessão atual, ou seja, usuário que está fazendo a requisição e também identificador do banco de dados que está sendo usado pelo usuário na requisição.
 */
@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  /**
   * Constructor
   */
  constructor(
    private translocoService: TranslocoService,
  ) {
  }

  /**
   * Intercepta a requisição informando dados de usuário e banco de dados usado para API.
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let newReq = req.clone();

    const activeLang = this.translocoService.getActiveLang();

    newReq = req.clone({
      setHeaders: {
        "X-Language": activeLang,
      },
      withCredentials: true,
    });

    // Resposta obtida após a requisição
    return next.handle(newReq).pipe(
      // Caso ocorreu algum erro
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
        })
    );
  }
}