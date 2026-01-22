import axios from "axios";
import { IidentityService } from "../../domain/services/Iidentity.service";

export class GetApplicationFromDirectoryUseCase {
  constructor(private identityService: IidentityService) { }

  async execute(): Promise<any | Error> {

    try {

      const accessToken : string = await this.identityService.getAccessToken();

      // Buscar todas as aplicações do tenant
      const applicationsResponse = await axios.get('https://graph.microsoft.com/v1.0/applications', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Filtrar aplicações e remover 'b2c-extensions-app'
      const applications = applicationsResponse.data.value.filter((app: any) => app.displayName !== 'b2c-extensions-app. Do not modify. Used by AADB2C for storing user data.');

      // Preparar array para armazenar detalhes de cada aplicação
      const applicationDetails = [];

      // Iterar sobre cada aplicação e buscar detalhes
      for (const app of applications) {
        // Verificar se a aplicação possui configuração SPA
        if (app.spa) {
          // Obter a primeira URI de redirecionamento do SPA
          const redirect_uri = app.spa.redirectUris && app.spa.redirectUris.length > 0 ? app.spa.redirectUris[0] : null;

          // Buscar os escopos de permissão do OAuth2
          const apiPermissions = app.api && app.api.oauth2PermissionScopes ? app.api.oauth2PermissionScopes : [];
          const scopes = apiPermissions.filter((scope : any) => scope.type === "Admin").map((scope: any) => scope.value);

          // Construir objeto com detalhes da aplicação
          const appDetail = {
            displayName: app.displayName,
            icon: app.info && app.info.logoUrl ? app.info.logoUrl : null,
            redirect_uri: redirect_uri,
            client_id: app.appId,
            scope: (app.identifierUris && app.identifierUris.length > 0 && scopes.length > 0)
              ? `openid profile ${app.identifierUris[0]}/${scopes[0]}`
              : null,
            post_logout_redirect_uri: app.web && app.web.logoutUrl ? app.web.logoutUrl : null
          };
          // Adicionar detalhes da aplicação ao array
          applicationDetails.push(appDetail);
        }
      }

      // Retornar os detalhes das aplicações na resposta
      // res.json(applicationDetails);

      return applicationDetails;
    } catch (error) {
      // res.status(500).json({ error: error.message });
      throw new Error("Erro ao obter as aplicações do usuário. "+error)
    } 
  }
}