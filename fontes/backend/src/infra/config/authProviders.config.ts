export interface AuthProviderConfig {
	uidField: string;
	issuerPattern?: RegExp;
	additionalFields?: string[];
}

/**
 * Tipos de provedores de identidade com sesu dados de como obtero  UID, comportamento do issuer e campos adicionais
 */
export const AUTH_PROVIDERS: Record<string, AuthProviderConfig> = {
	auth0: {
		uidField: 'sub',
		issuerPattern: /https:\/\/.*\.auth0\.com\//,
		additionalFields: ['email', 'email_verified']
	},
	firebase: {
		uidField: 'uid',
		issuerPattern: /https:\/\/securetoken\.google\.com\//,
		additionalFields: ['email', 'email_verified']
	},
	cognito: {
		uidField: 'sub',
		issuerPattern: /https:\/\/cognito-idp\..*\.amazonaws\.com\//,
		additionalFields: ['email', 'email_verified', 'cognito:username']
	},
	azure: {
		uidField: 'oid',
		issuerPattern: /https:\/\/login\.microsoftonline\.com\//,
		additionalFields: ['email', 'preferred_username']
	},
	keycloak: {
		uidField: 'sub',
		additionalFields: ['email', 'preferred_username']
	},
	generic: {
		uidField: 'sub', // fallback padrão
		additionalFields: ['email']
	}
};
