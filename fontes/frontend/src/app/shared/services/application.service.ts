import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface Application {
  displayName: string;
  icon: string | null;
  redirect_uri: string | null; // Renomeado de spaRedirectUris para redirect_uri
  client_id: string | null; // Renomeado de clientId para client_id
  scope: string | null; // Novo campo baseado em identifierUri e scopes
  post_logout_redirect_uri: string | null; // Renomeado de logoutUrl para post_logout_redirect_uri
}

  
@Injectable({
  providedIn: 'root'
})

export class ApplicationService {
  resetPassword(resetPasswordPayload: { email: string; password: string; }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.backendUrl+'/api/token'; // URL do seu servidor Node.js
  
  private apiUrlUserDirectory = environment.backendUrl+'/api/userDirectory'; // URL do seu servidor Node.js
  
  private apiUrlApplications = environment.backendUrl+'/api/application'; // URL do seu servidor Node.js

  constructor(private http: HttpClient) { }

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrlApplications}/`);
  }

  createUser(userPayload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createUserInDirectory`, userPayload);
  }

  getDomain(): Observable<string> {
    return this.http.get<{ message: string, domain: string }>(`${this.apiUrl}/getDomainTenant`)
      .pipe(
        map(response => response.domain) // Extrai a string dentro de "domain"
      );
  }

  getUserPrincipalName(email: string): Observable<string> {
    const body = { email: email };

    return this.http.post<{ message: string, userPrincipalName: string }>(`${this.apiUrl}/getUserPrincipalName`, body)
      .pipe(
        map(response => response.userPrincipalName) // Extrai apenas o userPrincipalName
      );
  }
  
  updateUserProfile(user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrlUserDirectory}/edit-user-details`, user);
  }
  
}

