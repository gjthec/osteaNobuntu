import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

export type AuthMethod = 'NORMAL' | 'MSAL';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly _authMethod: AuthMethod;

  constructor() {
    const raw = String(environment.authMethod ?? 'NORMAL')
      .trim()
      .toUpperCase();
    this._authMethod = raw === 'MSAL' || raw === 'NORMAL' ? (raw as AuthMethod) : 'NORMAL';
  }

  get authMethod(): AuthMethod {
    return this._authMethod;
  }

  get isMsal(): boolean {
    return this._authMethod === 'MSAL';
  }
  get isNormal(): boolean {
    return this._authMethod === 'NORMAL';
  }
}
