import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { NotFoundError } from '../../../errors/client.error';
import {
	IFunctionSystem,
	FunctionSystem
} from '../../../domain/entities/functionSystem.model';
import FunctionSystemRepository from '../../../domain/repositories/functionSystem.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class FunctionSystemController {
	constructor() {}

	async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			//O Service será criado com base no tipo de banco de dados e o model usado
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

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
			//O Service será criado com base no tipo de banco de dados e o model usado
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

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
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

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
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

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
			//O Service será criado com base no tipo de banco de dados e o model usado
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

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
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

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
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

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
			const functionSystemRepository: FunctionSystemRepository =
				new FunctionSystemRepository(req.body.tenantConnection);
			const baseController: BaseController<IFunctionSystem, FunctionSystem> =
				new BaseController(functionSystemRepository, 'FunctionSystem');

			baseController.deleteAll(req, res, next);
		} catch (error) {
			next(error);
		}
	}
}
