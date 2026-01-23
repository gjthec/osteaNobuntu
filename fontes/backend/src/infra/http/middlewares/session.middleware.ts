import { NextFunction, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../../errors/client.error';
import {
	buildSessionCookieOptions,
	getSessionCookieName,
	getSessionRefreshThresholdMs,
	SessionService
} from '../session/session.service';
import { AuthenticatedRequest } from './checkUserAccess.middleware';

export async function requireAuth(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const sessionId = req.cookies?.[getSessionCookieName()];
		if (!sessionId) {
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: 'Session not found.'
			});
		}

		const sessionService = SessionService.getInstance();
		const session = await sessionService.getSession(sessionId);
		if (!session) {
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: 'Session expired.'
			});
		}

		const remainingMs = session.expiresAt - Date.now();
		if (remainingMs <= getSessionRefreshThresholdMs()) {
			const refreshed = await sessionService.refreshSession(sessionId);
			if (refreshed) {
				const maxAgeMs = refreshed.expiresAt - Date.now();
				res.cookie(getSessionCookieName(), sessionId, buildSessionCookieOptions(maxAgeMs));
				req.session = refreshed;
			} else {
				req.session = session;
			}
		} else {
			req.session = session;
		}

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
	const sessionId = req.cookies?.[getSessionCookieName()];
	if (!sessionId) {
		return next();
	}

	const sessionService = SessionService.getInstance();
	const session = await sessionService.getSession(sessionId);
	if (session) {
		req.session = session;
		req.user = {
			id: session.user.id,
			identityProviderUID: session.user.identityProviderUID,
			roles: session.user.roles
		};
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
