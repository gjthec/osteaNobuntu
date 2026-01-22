export type Locale = 'en' | 'pt' | 'pt-BR';
export type MessageCode =
	| 'INTERNAL_ERROR'
	| 'USER_NOT_FOUND'
	| 'TENANT_NOT_FOUND'
	| 'NOT_FOUND'
	| 'INVALID_TENANT'
	| 'FIELD_REQUIRED'
	| 'VALITADION'
	| 'EMAIL_VERIFICATION_REQUIRED'
	| 'VALIDATION_FAILED_FORMAT'
	| 'VALIDATION_FAILED_LENGTH'
	| 'UNAUTHORIZED'
	| 'TOO_MANY_REQUEST'
	| 'FORBIDDEN'
	| 'RESOURCE_CONFLICT';

type Catalog = Record<Locale, Record<MessageCode, string>>;

export const catalogs: Catalog = {
	en: {
		INTERNAL_ERROR: 'An unexpected error occurred.',
		USER_NOT_FOUND: 'User not found.',
		TENANT_NOT_FOUND: 'Tenant not found.',
		NOT_FOUND: 'Register not found.',
		INVALID_TENANT: 'Invalid tenant.',
		FIELD_REQUIRED: 'The field {field} is required.',
		VALITADION: 'Validation error.',
		EMAIL_VERIFICATION_REQUIRED: 'Email verification is required.',
		VALIDATION_FAILED_FORMAT: 'The field {field} is incorrect format.',
		VALIDATION_FAILED_LENGTH:
			'The field {field} length must be {min_length}-{max_length}.',
		UNAUTHORIZED: 'You are not authorized.',
		TOO_MANY_REQUEST: 'Too many requests.',
		FORBIDDEN: 'You do not have permission to perform this action.',
		RESOURCE_CONFLICT: 'A resource conflict occurred.'
	},
	pt: {
		INTERNAL_ERROR: 'Ocorreu um erro inesperado.',
		USER_NOT_FOUND: 'Usuário não encontrado.',
		TENANT_NOT_FOUND: 'Tenant não encontrado.',
		NOT_FOUND: 'Registro não encontrado.',
		INVALID_TENANT: 'Tenant inválido.',
		VALITADION: 'Erro de validação.',
		FIELD_REQUIRED: 'O campo {field} é obrigatório.',
		EMAIL_VERIFICATION_REQUIRED: 'A verificação de email é obrigatória.',
		VALIDATION_FAILED_FORMAT: 'O campo {field} está em formato incorreto.',
		VALIDATION_FAILED_LENGTH:
			'O campo {field} deve conter tamanho entre {min_length} e {max_length}.',
		UNAUTHORIZED: 'Você não está autorizado.',
		TOO_MANY_REQUEST: 'Too many requests.',
		FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
		RESOURCE_CONFLICT: 'Ocorreu um conflito de recurso.'
	},
	'pt-BR': {
		INTERNAL_ERROR: 'Ocorreu um erro inesperado.',
		USER_NOT_FOUND: 'Usuário não encontrado.',
		TENANT_NOT_FOUND: 'Tenant não encontrado.',
		NOT_FOUND: 'Registro não encontrado.',
		INVALID_TENANT: 'Tenant inválido.',
		VALITADION: 'Erro de validação.',
		FIELD_REQUIRED: 'O campo {field} é obrigatório.',
		EMAIL_VERIFICATION_REQUIRED: 'A verificação de email é obrigatória.',
		VALIDATION_FAILED_FORMAT: 'O campo {field} está em formato incorreto.',
		VALIDATION_FAILED_LENGTH:
			'O campo {field} deve conter tamanho entre {min_length} e {max_length}.',
		UNAUTHORIZED: 'Você não está autorizado.',
		TOO_MANY_REQUEST: 'Too many requests.',
		FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
		RESOURCE_CONFLICT: 'Ocorreu um conflito de recurso.'
	}
};
