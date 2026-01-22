import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from 'app/shared/services/shared.service';
import { environment } from 'environments/environment';
import { DatabaseCredential } from './databaseCredential.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DatabaseCredentialService extends BaseResourceService<DatabaseCredential> {
  url = environment.backendUrl + "/api/tenantCredential";//TODO não faz sentido ter isso repetido
  protected http: HttpClient;

  constructor(protected override injector: Injector) {
    let url = environment.backendUrl + "/api/tenantCredential";

    super(url, injector, DatabaseCredential.fromJson)
  }

  getByTenantId(tenantId: number): Observable<DatabaseCredential[]> {
    return this.http.get<DatabaseCredential[]>(`${this.url}/tenantId/`+ tenantId );
  }

  checkEmailExist(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/check-email-exist`, { email });
  }

}
