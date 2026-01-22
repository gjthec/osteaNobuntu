// Para erros indicam que o cliente (quem fez a requisição) cometeu um erro os códigos de status HTTP 4xx (400-499).

import { MessageCode } from '../resources/i18n/catalog';
import { AppError } from './app.error';

/**
 * Erro que indica dados enviados no corpo da requisição não seguem o formato esperado (ex: email inválido, campo obrigatório faltando).
 */
export class ValidationError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;

	constructor(message: MessageCode, options?: { cause?: unknown }) {
		if (!message) {
			message = 'VALITADION';
		}
		super(message);
		this.statusCode = 400;
		this.name = 'ValidationError';
		this.cause = options?.cause;
	}
}

/**
 * Erro que indica que o usuário ou o cliente não foi autenticado adequadamente
 */
export class UnauthorizedError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;

	constructor(message: MessageCode, options?: { cause?: unknown }) {
		if (!message) {
			message = 'UNAUTHORIZED';
		}
		super(message);
		this.statusCode = 401;
		this.name = 'UnauthorizedError';
		this.cause = options?.cause;
	}
}

/**
 * Erro que indica que o cliente foi autenticado mas ele não tem permissão para acessar o recurso solicitado.
 */
export class ForbiddenError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;

	constructor(message: MessageCode, options?: { cause?: unknown }) {
		if (!message) {
			message = 'FORBIDDEN';
		}
		super(message);
		this.statusCode = 403;
		this.name = 'ForbiddenError';
		this.cause = options?.cause;
	}
}

/**
 * Erro que indica que o recurso (exemplo: ID de usuário, produto ou outro) não existe.
 */
export class NotFoundError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;

	constructor(message?: MessageCode, options?: { cause?: unknown }) {
		if (!message) {
			message = 'NOT_FOUND';
		}
		super(message);
		this.statusCode = 404;
		this.name = 'NotFoundError';
		this.cause = options?.cause;
	}
}

/**
 * Erro que indica que a requisição não pôde ser completada devido a um conflito com o estado atual do recurso. Isso ocorrem em exemplos como:
 * DuplicateEntryError: Tentativa de criar um recurso que já existe (ex: email já cadastrado).
 * VersionConflictError: Tentativa de atualizar um recurso com uma versão antiga (conflito de concorrência).
 */
export class ConflictError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;

	constructor(message?: MessageCode, options?: { cause?: unknown }) {
		if (!message) {
			message = 'RESOURCE_CONFLICT';
		}
		super(message);
		this.statusCode = 409;
		this.name = 'ConflictError';
		this.cause = options?.cause;
	}
}

/**
 * Erro que indica que o suário enviou muitas requisições em um dado período de tempo (rate limiting).
 */
export class TooManyRequestsError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;

	constructor(message?: MessageCode, options?: { cause?: unknown }) {
		if (!message) {
			message = 'TOO_MANY_REQUEST';
		}
		super(message);
		this.statusCode = 429;
		this.name = 'TooManyRequestsError';
		this.cause = options?.cause;
	}
}
