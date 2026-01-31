import { AuthMethod } from 'app/core/config/config.service';

export const environment = {
	applicationTitle: 'Osteo',
	backendUrl: 'https://osteo-backend-service1-455563875480.us-central1.run.app',
	frontendUrl: 'https://osteo.nobuntu.com.br',
	menuPath: '../../../../assets/dicionario/menu/menu.json',
	jsonPath: '../../../../assets/dicionario/',

	authMethod: 'NORMAL' as AuthMethod, // ou 'OutroMetodo'

	enableTenantSwitch: false,

	msalConfig: {
		auth: {
			clientId: '85e0f818-8635-43e1-b178-13dd5e3bd20b', // Client ID
			authority:
				'https://login.microsoftonline.com/f38a0a95-27b7-4d5a-ace2-220ab569bde7', // Tenant ID
			redirectUri: 'https://localhost:4200/home' // URL para redirecionamento após login
			//postLogoutRedirectUri: window.location.origin // URL para redirecionamento após logout
		},
		cache: {
			cacheLocation: 'localStorage', // 'localStorage' ou 'sessionStorage'
			storeAuthStateInCookie: false
		},
		// Escopos de API que a aplicação acessa
		tokenRequest: {
			scopes: ['api://3cf4a8d5-de59-400f-8506-be5715c01a94/aa']
		}
	},

	defaultJSONPath: '../../../../assets/dicionario/',

	pacienteJSONPath: '../../../../assets/dicionario/paciente.json',

	avaliacaoJSONPath: '../../../../assets/dicionario/avaliacao.json',

	agendaJSONPath: '../../../../assets/dicionario/agenda.json'
};
