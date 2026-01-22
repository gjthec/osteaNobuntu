import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from 'app/shared/services/shared.service';
import { environment } from 'environments/environment';
import { Session } from './session.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class SessionService extends BaseResourceService<Session> {

  protected http: HttpClient 

  constructor(protected override injector: Injector) { 
    var url = environment.backendUrl+"/api/session"; 

    super(url, injector, Session.fromJson) 
  }

  registerNewSession(uid: string, userid: string, token: string): Observable<Session> {
    const newSession: Session = {
      finishSessionDate: new Date(),
      hashValidationLogin: "test",
      hashValidationLogout: "test",
      initialDate: new Date(),
      stayConnected: false,
      tenantUID: environment.tenant_id,
      accessToken: token,
      userUID: uid,
      accessTokenExpirationDate: new Date(),
      user: userid,
    }

    return this.create(newSession);
  }
}
