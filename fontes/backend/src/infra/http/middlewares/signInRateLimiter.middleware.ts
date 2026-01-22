import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../../../errors/client.error';
import { errorHandler } from './errorHandler.middleware';

// tentativas de login de cada usuário
export const loginAttempts: Record<
	string,
	{ attempts: number; blockUntil: number | null }
> = {};

/**
 * Middleware para controle de tentativas de signin
 */
export function signInRateLimiter(
	request: Request,
	response: Response,
	nextFunction: NextFunction
) {
	const { email } = request.body;
	const now = Date.now();

	if (!loginAttempts[email]) {
		loginAttempts[email] = { attempts: 0, blockUntil: null };
	}

	const user = loginAttempts[email];

	if (user.blockUntil == null) {
		return nextFunction();
	}

	// Verifica se o tempo de bloqueio expirou
	if (now >= user.blockUntil) {
		delete loginAttempts[email]; // Remove o e-mail da lista
		return nextFunction();
	} else {
		return errorHandler(
			new TooManyRequestsError('TOO_MANY_REQUEST', {
				cause: 'Too many signIn attempts. Please try accessing later.'
			}),
			request,
			response,
			nextFunction
		);
	}
}
