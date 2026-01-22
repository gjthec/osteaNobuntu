import { AuthMethod } from 'app/core/config/config.service';

export const environment = {
	applicationTitle: 'Osteo',
	backendUrl: '/api',
	frontendUrl: 'https://osteofrontend-455563875480.us-central1.run.app',
	menuPath: '../../../../assets/dicionario/menu/menu.json',
	jsonPath: '../../../../assets/dicionario/',

	authMethod: 'NORMAL' as AuthMethod, // ou 'OutroMetodo'

	enableTenantSwitch: false,

	msalConfig: {
		auth: {
			clientId: '85e0f818-8635-43e1-b178-13dd5e3bd20b', // Client ID
			authority:
				'https://login.microsoftonline.com/fdbfb69e-578b-4476-b284-27364c3aa1ab', // Tenant ID
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
