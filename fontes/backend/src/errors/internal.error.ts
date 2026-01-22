// Para erros internos os códigos de status HTTP 5xx (500-599) vão indicar erros no servidor.

import { AppError } from './app.error';

/**
 * Erro indica um erro genérico interno
 */
export class InternalServerError extends Error {
	statusCode: number;
	cause?: unknown;
	date: Date;

	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.statusCode = 500;
		this.name = 'InternalServerError';
		this.cause = options?.cause;
		this.date = new Date();
	}
}

/**
 * Erro que indica algum erro em relação a algum serviço que essa API usa como: seviço de email, servidor de identidade ou algo assim.
 */
export class BadGatewayError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;
	date: Date;

	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.statusCode = 502;
		this.name = 'BadGatewayError';
		this.cause = options?.cause;
		this.date = new Date();
	}
}

/**
 * Erro que indica Banco de dados indisponível
 */
export class ServiceUnavailableError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;
	date: Date;

	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.statusCode = 503;
		this.name = 'ServiceUnavailableError';
		this.cause = options?.cause;
		this.date = new Date();
	}
}

/**
 * Erro que indica que demorou demais pra ter resposta
 */
export class GatewayTimeoutError extends Error implements AppError {
	statusCode: number;
	cause?: unknown;
	date: Date;

	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.statusCode = 504;
		this.name = 'GatewayTimeoutError';
		this.cause = options?.cause;
		this.date = new Date();
	}
}
