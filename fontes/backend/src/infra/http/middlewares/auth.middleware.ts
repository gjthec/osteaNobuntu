import { Response, NextFunction } from 'express';
import { errorHandler } from './errorHandler.middleware';
import {
	AuthenticatedRequest,
	checkUserIsRegisteredOnApplication,
	registerUserOnApplication
} from './checkUserAccess.middleware';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import { GetSecurityTenantConnectionUseCase } from '../../../useCases/tenant/getSecurityTenantConnection.useCase';
import {
	getSessionCookieName,
	SessionService
} from '../session/session.service';
import { UnauthorizedError } from '../../../errors/client.error';

/**
 * Verifica se o usuário foi cadastrado no servidor de identidade
 */
export async function verifyIdentityProviderUserRegistered(
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

		const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();
		const securityTenantConnection: TenantConnection =
			await getSecurityTenantConnectionUseCase.execute();

		//Se o cliente registrado no security e não estiver no banco normal, poderá ter problemas, precisa garantir que se ele tiver no security tem que estar nos outros

		const isUserRegisteredOnApplication =
			await checkUserIsRegisteredOnApplication(
				session.user,
				securityTenantConnection
			);

		if (isUserRegisteredOnApplication == false) {
			await registerUserOnApplication(session.user);
		}

		req.user = {
			identityProviderUID: session.user.identityProviderUID
		};

		next();
	} catch (error: any) {
		errorHandler(error, req, res, next);
	}
}
