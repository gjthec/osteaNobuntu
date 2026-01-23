import { NextFunction, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../../errors/client.error';
import {
	buildSessionCookieOptions,
	getSessionCookieName,
	getSessionRefreshThresholdMs,
	SessionService
} from '../session/session.service';
import { AuthenticatedRequest } from './checkUserAccess.middleware';
import { EntraIdService } from '../../../domain/services/entraId.service';
import { RefreshTokenUseCase } from '../../../useCases/authentication/refreshToken.useCase';

export function getSessionIdFromRequest(
	req: AuthenticatedRequest
): string | undefined {
	const headerSessionId = req.headers['x-session-id'];
	if (typeof headerSessionId === 'string' && headerSessionId.length > 0) {
		return headerSessionId;
	}
	if (Array.isArray(headerSessionId) && headerSessionId[0]) {
		return headerSessionId[0];
	}
	return req.cookies?.[getSessionCookieName()];
}

export async function resolveSession(
	req: AuthenticatedRequest,
	res: Response
): Promise<{ session: NonNullable<AuthenticatedRequest['session']>; updated: boolean }> {
	const sessionId = getSessionIdFromRequest(req);
	if (!sessionId) {
		throw new UnauthorizedError('UNAUTHORIZED', {
			cause: 'Session not found.'
		});
	}

	const sessionService = SessionService.getInstance();
	let session = await sessionService.getSession(sessionId);
	if (!session) {
		throw new UnauthorizedError('UNAUTHORIZED', {
			cause: 'Session expired.'
		});
	}

	if (!session.accessTokenExpiresAt && !session.refreshTokenExpiresAt) {
		throw new UnauthorizedError('UNAUTHORIZED', {
			cause: 'Token metadata missing for session.'
		});
	}

	if (session.expiresAt <= Date.now()) {
		await sessionService.deleteSession(sessionId);
		throw new UnauthorizedError('UNAUTHORIZED', {
			cause: 'Session expired.'
		});
	}

	let updated = false;
	if (
		session.accessTokenExpiresAt &&
		session.accessTokenExpiresAt - Date.now() <= getSessionRefreshThresholdMs()
	) {
		if (!session.refreshToken) {
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: 'Refresh token missing for session.'
			});
		}

		const refreshTokenUseCase = new RefreshTokenUseCase(new EntraIdService());
		const refreshResponse = await refreshTokenUseCase.execute({
			refreshToken: session.refreshToken
		});

		const updatedSession = await sessionService.updateSessionTokens(
			sessionId,
			refreshResponse.tokens
		);
		if (!updatedSession) {
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: 'Unable to refresh session tokens.'
			});
		}
		session = updatedSession;
		updated = true;
	}

	if (updated) {
		const maxAgeMs = session.expiresAt - Date.now();
		if (maxAgeMs > 0) {
			res.cookie(getSessionCookieName(), sessionId, buildSessionCookieOptions(maxAgeMs));
		}
	}

	return { session, updated };
}

export async function requireAuth(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { session } = await resolveSession(req, res);
		req.session = session;

		req.user = {
			id: session.user.id,
			identityProviderUID: session.user.identityProviderUID,
			roles: session.user.roles
		};

		next();
	} catch (error) {
		next(error);
	}
}

export async function optionalAuth(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { session } = await resolveSession(req, res);
		req.session = session;
		req.user = {
			id: session.user.id,
			identityProviderUID: session.user.identityProviderUID,
			roles: session.user.roles
		};
	} catch (error) {
		// Optional auth should not block when no valid session is present.
	}
	return next();
}

export function requireRole(role: string) {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.session) {
			return next(
				new UnauthorizedError('UNAUTHORIZED', { cause: 'Session not found.' })
			);
		}

		const roles = req.session.user.roles || [];
		if (!roles.includes(role)) {
			return next(new ForbiddenError('FORBIDDEN'));
		}

		return next();
	};
}
