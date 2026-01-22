/* eslint-disable prettier/prettier */
import { CanActivateFn } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthGuard as AuthNormal } from './auth.guard';
import { AuthGuard as AuthMSAL } from 'app/core/azure/auth/guards/auth.guard';
import { inject } from '@angular/core';

export const createAuthGuard: CanActivateFn = (route, state) => {
    if (environment.authMethod === 'MSAL') {
        const msalAuthGuard = inject(AuthMSAL);
        return msalAuthGuard.canActivate(route, state);
    } else {
        const normalAuthGuard = inject(AuthNormal);
        return normalAuthGuard.canActivate(route, state);
    }
};