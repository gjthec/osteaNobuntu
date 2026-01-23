import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../errors/client.error';
import {
	AuthenticatedUser,
	ValidateAccessTokenUseCase
} from '../../../useCases/authentication/validateAccessToken.useCase';
import {
	DatabaseConnection,
	getTenantConnection
} from '../../database/database.config';
import { ForbiddenError } from '../../../errors/client.error';
import { errorHandler } from './errorHandler.middleware';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import { GetSecurityTenantConnectionUseCase } from '../../../useCases/tenant/getSecurityTenantConnection.useCase';
import { InternalServerError } from '../../../errors/internal.error';
import {
	IUserDataInputDTO,
	SyncUserAccountOnTenantsUseCase
} from '../../../useCases/authentication/syncUserAccountOnTenants.useCase';
import UserRepository from '../../../domain/repositories/user.repository';
import { UserRouteAccessService } from '../../../domain/services/userRouteAccess.service';
import { TenantConnectionAccessService } from '../../../domain/services/tenantConnection.service';

/**
 * Interface personalizada que irá armazenar informações do usuário
 */
export interface AuthenticatedRequest extends Request {
	user?: {
		id?: number;
		identityProviderUID: string;
		roles?: number[]; //Os ids das roles
	};
	tenantConnection?: TenantConnection;
}

/**
 * Middleware criado para:
 * -> Validar o usuário;
 * -> Validar se usuário tem acesso ao Tenant;
 * -> Validar se usuário tem acesso a rota;
 * Retorna ao corpo da requisição o tenant;
 */
export async function checkUserAccess(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) {
	try {
		const authHeader = req.headers.authorization;
		const authenticatedUser: AuthenticatedUser = await checkAccessToken(
			authHeader!
		);

		const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();
		const securityTenantConnection: TenantConnection =
			await getSecurityTenantConnectionUseCase.execute();

		const isUserRegisteredOnApplication =
			await checkUserIsRegisteredOnApplication(
				authenticatedUser,
				securityTenantConnection
			);

		if (isUserRegisteredOnApplication == false) {
			await registerUserOnApplication(authenticatedUser);
		}

		//Obter o tenant
		const databaseCredentialId: number = Number(req.header('X-Tenant-ID'));

		if (isNaN(databaseCredentialId)) {
			throw new UnauthorizedError('INVALID_TENANT');
		}

		let databaseConnection: DatabaseConnection | null = null;
		databaseConnection = await checkUserHasAccessToTenant(
			databaseCredentialId,
			authenticatedUser.uid
		);

		if (databaseConnection == null) {
			throw new UnauthorizedError('INVALID_TENANT');
		}

		req.user = {
			identityProviderUID: authenticatedUser.uid
		};

		await checkUserHasAccessToRoute(
			authenticatedUser,
			req,
			databaseConnection.tenantConnection
		);

		req.tenantConnection = databaseConnection.tenantConnection;
		next();
	} catch (error: any) {
		errorHandler(error, req, res, next);
	}
}

export async function checkUserIsRegisteredOnApplication(
	authenticatedUser: AuthenticatedUser,
	tenantConnection: TenantConnection
): Promise<Boolean> {
	const isUserOnCache = checkUserOnCache(authenticatedUser, tenantConnection);

	if (isUserOnCache == true) {
		return true;
	}

	const userRepository: UserRepository = new UserRepository(tenantConnection);

	const user = await userRepository.findOne({
		identityProviderUID: authenticatedUser.uid
	});

	if (!user) {
		return false;
	}

	return true;
}

export function checkUserOnCache(
	authenticatedUser: AuthenticatedUser,
	tenantWithRouteAccessRecords: TenantConnection
) {
	const userRouteAccessService: UserRouteAccessService =
		UserRouteAccessService.getInstance();

	const isUserOnCache: Boolean =
		userRouteAccessService.userRouteAccessCache.isUserOnCacheByUserUID(
			authenticatedUser.uid
		);

	if (isUserOnCache == true) {
		return true;
	}

	return false;
}

export async function registerUserOnApplication(
	authenticatedUser: AuthenticatedUser
) {
	const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
		new GetSecurityTenantConnectionUseCase();
	const securityTenantConnection: TenantConnection =
		await getSecurityTenantConnectionUseCase.execute();
	const userRepository: UserRepository = new UserRepository(
		securityTenantConnection
	);

	const user = await userRepository.findOne({
		identityProviderUID: authenticatedUser.uid
	});

	if (user == undefined || user == null) {
		try {
			const indexSeparationFirstName =
				authenticatedUser.rawToken.name.indexOf(' ');
			let _lastName: string = '';

			if (indexSeparationFirstName === -1) {
				// Não tem espaço, retorna o texto inteiro como primeira parte
				_lastName = '';
			} else {
				_lastName = authenticatedUser.rawToken.name.substring(
					indexSeparationFirstName + 1
				);
			}

			//TODO tirar isso e usar o User como input do caso de uso
			const userData: IUserDataInputDTO = {
				email: authenticatedUser.rawToken.preferred_username,
				firstName: authenticatedUser.rawToken.name.substring(
					0,
					indexSeparationFirstName
				),
				identityProviderUID: authenticatedUser.uid,
				userName: authenticatedUser.rawToken.name,
				provider: authenticatedUser.provider,
				lastName: _lastName
			};

			await userRepository.create({
				userName: authenticatedUser.rawToken.name,
				identityProviderUID: authenticatedUser.uid,
				provider: authenticatedUser.provider,
				email: authenticatedUser.rawToken.preferred_username,
				tenantUID: process.env.TENANT_ID,
				firstName: authenticatedUser.rawToken.name.substring(
					0,
					indexSeparationFirstName
				),
				lastName: _lastName,
				isAdministrator: false,
				password: '' //pelo msal não salvará senha
			});

			const tenantConnectionAccessService: TenantConnectionAccessService =
				TenantConnectionAccessService.instance;
			tenantConnectionAccessService.tenantConnectionCache.saveUserAccessOnMemory(
				securityTenantConnection
			);

			const syncUserAccountOnTenantsUseCase: SyncUserAccountOnTenantsUseCase =
				new SyncUserAccountOnTenantsUseCase();
			await syncUserAccountOnTenantsUseCase.execute(
				authenticatedUser.uid,
				userData
			);
		} catch (error: any) {
			throw new InternalServerError('Error to register new user.', {
				cause: error
			});
		}
	}
}

async function checkUserHasAccessToTenant(
	databaseCredentialId: number,
	identityProviderUID: string
): Promise<DatabaseConnection> {
	let databaseConnection: DatabaseConnection | null = null;
	databaseConnection = await getTenantConnection(
		databaseCredentialId,
		identityProviderUID
	);

	if (databaseConnection == null) {
		throw new UnauthorizedError('INVALID_TENANT');
	}

	return databaseConnection;
}

export async function checkUserHasAccessToRoute(
	authenticatedUser: AuthenticatedUser,
	request: Request,
	tenantWithRouteAccessRecords: TenantConnection
) {
	const userRouteAccessService: UserRouteAccessService =
		UserRouteAccessService.getInstance();

	let requestFullRoute = request.baseUrl + (request.route?.path || '');
	if (requestFullRoute.endsWith('/')) {
		requestFullRoute = requestFullRoute.slice(0, -1);
	}

	//TODO mas preciso verificar acesso para casos específicos

	const userHasAccessToRoute =
		await userRouteAccessService.userRouteAccessCache.hasUserAccessByUserUID(
			authenticatedUser.uid,
			request.method.toLowerCase(),
			requestFullRoute,
			tenantWithRouteAccessRecords
		);

	console.log('userHasAccessToRoute: ', userHasAccessToRoute);
	if (userHasAccessToRoute == false) {
		throw new ForbiddenError('FORBIDDEN');
	}
}

export async function checkAccessToken(
	authHeader: string
): Promise<AuthenticatedUser> {
	const clientId = process.env.CLIENT_ID;
	const issuer = process.env.TOKEN_ISSUER;
	const jwksUri = process.env.JWKsUri;
	const configuredAudience = process.env.ACCESS_TOKEN_AUDIENCE;

	if (clientId == undefined || issuer == undefined || jwksUri == undefined) {
		throw new InternalServerError('Populate Azure environment variables.');
	}

	const issuers = issuer
		.split(',')
		.map((value) => value.trim())
		.filter((value) => value.length > 0);

	const audiences = (configuredAudience || clientId)
		.split(',')
		.map((value) => value.trim())
		.filter((value) => value.length > 0);

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new UnauthorizedError('UNAUTHORIZED', {
			cause: 'Invalid access token.'
		});
	}

	const accessToken = authHeader!.split(' ')[1]; // Obtém o token após "Bearer"

	const validateAccessTokenUseCase: ValidateAccessTokenUseCase =
		new ValidateAccessTokenUseCase();
	const authenticatedUser: AuthenticatedUser =
		await validateAccessTokenUseCase.execute(accessToken, {
			issuer: issuers,
			jwksUri: jwksUri!,
			audience: audiences
		});

	return authenticatedUser;
}
