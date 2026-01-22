import { Configuration } from '@azure/msal-browser';
import { environment } from 'environments/environment';

export const msalConfig: Configuration = {
  auth: environment.msalConfig.auth,
  cache: environment.msalConfig.cache
};

// Escopos de API que a aplicação acessa
export const loginRequest = {
  // scopes: ['User.Read']
  scopes: ["https://nettransfer.rmzkseguros.com/escopo/tasks.read"]
};

// Escopos adicionais
export const tokenRequest = {
  // scopes: ['User.Read', 'Mail.Read']
  //scopes: ["https://nettransfer.rmzkseguros.com/escopo/tasks.read"] // Escopo da API
  scopes: environment.msalConfig.tokenRequest.scopes!
};