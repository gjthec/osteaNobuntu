import { Response, NextFunction } from 'express';
import { errorHandler } from './errorHandler.middleware';
import { AuthenticatedUser } from '../../../useCases/authentication/validateAccessToken.useCase';
import { checkEnvironmentVariableIsEmpty } from '../../../utils/verifiers.util';
import { InternalServerError } from '../../../errors/internal.error';
import {
	AuthenticatedRequest,
	checkAccessToken,
	checkUserIsRegisteredOnApplication,
	registerUserOnApplication
} from './checkUserAccess.middleware';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import { GetSecurityTenantConnectionUseCase } from '../../../useCases/tenant/getSecurityTenantConnection.useCase';

/**
 * Verifica se o usuário foi cadastrado no servidor de identidade
 */
export async function verifyIdentityProviderUserRegistered(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> {
	const clientId = process.env.CLIENT_ID;
	const issuer = process.env.TOKEN_ISSUER;
	const jwksUri = process.env.JWKsUri;

	if (
		checkEnvironmentVariableIsEmpty(clientId!) == true ||
		checkEnvironmentVariableIsEmpty(issuer!) == true ||
		checkEnvironmentVariableIsEmpty(jwksUri!) == true
	) {
		throw new InternalServerError(
			'Identity provider environment variables not defined.'
		);
	}

	try {
		const authHeader = req.headers.authorization;

		const authenticatedUser: AuthenticatedUser = await checkAccessToken(
			authHeader!
		);

		const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();
		const securityTenantConnection: TenantConnection =
			await getSecurityTenantConnectionUseCase.execute();

		//Se o cliente registrado no security e não estiver no banco normal, poderá ter problemas, precisa garantir que se ele tiver no security tem que estar nos outros

		const isUserRegisteredOnApplication =
			await checkUserIsRegisteredOnApplication(
				authenticatedUser,
				securityTenantConnection
			);

		if (isUserRegisteredOnApplication == false) {
			await registerUserOnApplication(authenticatedUser);
		}

		req.user = {
			identityProviderUID: authenticatedUser.uid
		};

		next();
	} catch (error: any) {
		errorHandler(error, req, res, next);
	}
}
