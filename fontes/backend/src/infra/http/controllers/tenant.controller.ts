import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { NotFoundError } from '../../../errors/client.error';
import { DatabaseType } from '../../database/createDb.adapter';
import {
	ITenant,
	ITenantDatabaseModel,
	Tenant
} from '../../../domain/entities/tenant.model';
// import DatabasePermissionRepository from "../../../domain/repositories/databasePermission.repository";
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import TenantRepository from '../../../domain/repositories/tenant.repository';
import { InviteUserToTenantUseCase } from '../../../useCases/tenant/inviteUserToTenant.userCase';
import { EmailService } from '../../../domain/services/email.service';
import { EntraIdService } from '../../../domain/services/entraId.service';
import { TokenGenerator } from '../../../utils/tokenGenerator';
import DatabaseCredentialRepository from '../../../domain/repositories/databaseCredential.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';
import { GetSecurityTenantConnectionUseCase } from '../../../useCases/tenant/getSecurityTenantConnection.useCase';
import { InternalServerError } from '../../../errors/internal.error';

export class TenantController {
	async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.create(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.findAll(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.findById(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async findByIdWithEagerLoading(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.findByIdWithEagerLoading(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async getCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.getCount(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.update(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.delete(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async deleteAll(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<ITenantDatabaseModel, Tenant> =
				new BaseController(tenantRepository, 'Tenant');

			baseController.deleteAll(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async findByUserID(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			console.log('TenantController: findByUserID start', {
				identityProviderUID: req.user?.identityProviderUID
			});
			const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
				new GetSecurityTenantConnectionUseCase();
			const securityTenantConnection: TenantConnection =
				await getSecurityTenantConnectionUseCase.execute();

			console.log('TenantController: security tenant connection ready', {
				databaseType: securityTenantConnection.databaseType
			});
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(securityTenantConnection);

			if (!req.user) {
				console.error('TenantController: user not defined');
				throw new NotFoundError('NOT_FOUND', { cause: 'User not defined.' });
			}

			console.log(
				'TenantController: fetching accessible tenants for user',
				req.user.identityProviderUID
			);
			const databaseCredentialList =
				await databaseCredentialRepository.advancedSearches.getAccessibleByUserIdentityProviderUID(
					req.user.identityProviderUID
				);

			if (!databaseCredentialList) {
				console.error('TenantController: no accessible tenants found');
				throw new NotFoundError('NOT_FOUND', {
					cause: "User don't have tenants to access."
				});
			}

			const filteredTenantList = databaseCredentialList.map(
				(databaseCredential) => ({
					tenantId: databaseCredential.tenant,
					databaseCredentialId: databaseCredential.id,
					identityProviderUID: req.user!.identityProviderUID
				})
			);

			console.log('TenantController: findByUserID success', {
				count: filteredTenantList.length
			});
			return res.status(200).send(filteredTenantList);
		} catch (error) {
			console.error('TenantController: findByUserID failed', error);
			next(error);
		}
	}

	/**
	 * Obter todos os tenants que o usuário que faz a requisição é administrador
	 * @returns Retorna um array com todos os tenants que o usuário que faz a requisição é administrador
	 */
	async findTenantsUserIsAdmin(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			// const databasePermissionRepository: DatabasePermissionRepository = new DatabasePermissionRepository(req.tenantConnection as TenantConnection);
			const tenantRepository: TenantRepository = new TenantRepository(
				req.tenantConnection as TenantConnection
			);

			// const tenantsUserIsAdmin: Tenant[] = await te.findTenantsUserIsAdmin(req.params.userUID);
			const tenantsUserIsAdmin: ITenantDatabaseModel[] =
				await tenantRepository.findMany(
					{ ownerUserId: Number(req.params.userId) },
					100,
					0
				);

			if (tenantsUserIsAdmin.length == 0) {
				throw new NotFoundError('NOT_FOUND', {
					cause: 'No tenants were found where this user is an administrator.'
				});
			}

			return res.status(200).send(tenantsUserIsAdmin);
		} catch (error) {
			next(error);
		}
	}

	async getDatabaseType(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): Promise<any> {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantConnection = req.body.tenantConnection as TenantConnection;
			const databaseType: DatabaseType = tenantConnection.databaseType;

			return res.status(200).send(databaseType);
		} catch (error) {
			next(error);
		}
	}

	async inviteUserToTenant(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): Promise<any> {
		try {
			const frontEndURI = process.env.FRONTEND_PATH;

			if (!frontEndURI) {
				throw new NotFoundError('NOT_FOUND', {
					cause: 'Variaveis ambiente não configuradas.'
				});
			}

			const emailService: EmailService = new EmailService();
			const azureADService: EntraIdService = new EntraIdService();
			const tokenGenerator: TokenGenerator = new TokenGenerator();
			const inviteUserToTenantUseCase: InviteUserToTenantUseCase =
				new InviteUserToTenantUseCase(
					emailService,
					azureADService,
					tokenGenerator,
					frontEndURI
				);
			const response = await inviteUserToTenantUseCase.execute({
				databaseCredentialId: req.body.databaseCredentialId,
				invitedUserEmail: req.body.invitedUserEmail,
				invitingUserEmail: req.body.invitingUserEmail,
				tenantId: req.body.tenantId
			});

			return res.status(200).send(response);
		} catch (error) {
			next(error);
		}
	}

	async removeUserAccessToTenant(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): Promise<any> {
		try {
			throw new InternalServerError('Method not implemented yet.');
		} catch (error) {
			next(error);
		}
	}
}
