import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { NotFoundError } from '../../../errors/client.error';
import { IRole, Role } from '../../../domain/entities/role.model';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import RoleRepository from '../../../domain/repositories/role.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class RoleController {
	async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<IRole, Role> = new BaseController(
				roleRepository,
				'Role'
			);

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

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<IRole, Role> = new BaseController(
				roleRepository,
				'Role'
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

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<IRole, Role> = new BaseController(
				roleRepository,
				'Role'
			);

			baseController.findById(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async getCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<IRole, Role> = new BaseController(
				roleRepository,
				'Role'
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

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<IRole, Role> = new BaseController(
				roleRepository,
				'Role'
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

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<IRole, Role> = new BaseController(
				roleRepository,
				'Role'
			);

			baseController.delete(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async findAllByUser(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);

			const userId = parseInt((req.query.userId as string) || '0');
			res.status(200).json(await roleRepository.getUserRoles(userId));
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

			const roleRepository: RoleRepository = new RoleRepository(
				req.tenantConnection as TenantConnection
			);
			//Base Controller é uma classe que já tem implementado todas as funções de CRUD
			const baseController: BaseController<IRole, Role> = new BaseController(
				roleRepository,
				'Role'
			);

			baseController.deleteAll(req, res, next);
		} catch (error) {
			next(error);
		}
	}
}
