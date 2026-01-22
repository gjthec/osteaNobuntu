import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { NotFoundError } from '../../../errors/client.error';
import { RegisterDatabaseCredentialUseCase } from '../../../useCases/tenant/registerDatabaseCredential.useCase';
import {
	IDatabaseCredentialDatabaseModel,
	DatabaseCredential
} from '../../../domain/entities/databaseCredential.model';
import DatabaseCredentialRepository from '../../../domain/repositories/databaseCredential.repository';
import UserRepository from '../../../domain/repositories/user.repository';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

//TODO um usuário X que deve ser administrador do tenant pode alterar quais usuários tem permissão no tenant. Ao ter feito alguma alteração, tem que ser alterado no cache. Mudar o accessLevel

export class DatabaseCredentialController {
	async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const tenantCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(req.body.tenantConnection);
			// const userTenantRepository: UserTenantRepository = new UserTenantRepository(req.body.tenantConnection);
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);

			//Use case para realizar operações mais complexas
			// const registerDatabaseCredentialUseCase: RegisterDatabaseCredentialUseCase = new RegisterDatabaseCredentialUseCase(tenantCredentialRepository, userTenantRepository, userRepository);

			// const data = await registerDatabaseCredentialUseCase.execute({
			//   databaseCredential: new DatabaseCredential({
			//     name: req.body.databaseName,
			//     type: req.body.databaseType,
			//     username: req.body.databaseUsername,
			//     password: req.body.databasePassword,
			//     host: req.body.databaseHost,
			//     port: req.body.databasePort,
			//     srvEnabled: req.body.srvEnabled,
			//     options: req.body.options,
			//     storagePath: req.body.storagePath,
			//     sslEnabled: req.body.sslEnabled,
			//     poolSize: req.body.poolSize,
			//     timeOutTime: req.body.timeOutTime,
			//     isPublic: true,
			//     //SSL data
			//     sslCertificateAuthority: req.body.sslCertificateAuthority,
			//     sslPrivateKey: req.body.sslPrivateKey,
			//     sslCertificate: req.body.sslCertificate
			//   }),
			//   tenantId: req.body.tenantId,
			//   userUID: req.body.userUID
			// });

			// return res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			const baseController: BaseController<
				IDatabaseCredentialDatabaseModel,
				DatabaseCredential
			> = new BaseController(
				databaseCredentialRepository,
				'DatabaseCredential'
			);

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

			//O Service será criado com base no tipo de banco de dados e o model usado
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<
				IDatabaseCredentialDatabaseModel,
				DatabaseCredential
			> = new BaseController(
				databaseCredentialRepository,
				'DatabaseCredential'
			);

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

			//O Service será criado com base no tipo de banco de dados e o model usado
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<
				IDatabaseCredentialDatabaseModel,
				DatabaseCredential
			> = new BaseController(
				databaseCredentialRepository,
				'DatabaseCredential'
			);

			baseController.findByIdWithEagerLoading(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async findByTenantId(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			//Quem pode pegar esse dado? só o gerenciador desse tenant (o dono do tenant)

			// const data = await databaseCredentialRepository.advancedSearches.getDatabaseCredentialByTenantId(req.body.tenantId, req.body.userId);

			// return res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	async getCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			//O Service será criado com base no tipo de banco de dados e o model usado
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<
				IDatabaseCredentialDatabaseModel,
				DatabaseCredential
			> = new BaseController(
				databaseCredentialRepository,
				'DatabaseCredential'
			);

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

			//O Service será criado com base no tipo de banco de dados e o model usado
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<
				IDatabaseCredentialDatabaseModel,
				DatabaseCredential
			> = new BaseController(
				databaseCredentialRepository,
				'DatabaseCredential'
			);

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

			//O Service será criado com base no tipo de banco de dados e o model usado
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<
				IDatabaseCredentialDatabaseModel,
				DatabaseCredential
			> = new BaseController(
				databaseCredentialRepository,
				'DatabaseCredential'
			);

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

			//O Service será criado com base no tipo de banco de dados e o model usado
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(
					req.tenantConnection as TenantConnection
				);

			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<
				IDatabaseCredentialDatabaseModel,
				DatabaseCredential
			> = new BaseController(
				databaseCredentialRepository,
				'DatabaseCredential'
			);

			baseController.deleteAll(req, res, next);
		} catch (error) {
			next(error);
		}
	}
}
