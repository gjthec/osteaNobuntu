import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { NotFoundError } from '../../../errors/client.error';
import { IFile, File } from '../../../domain/entities/file.model';
import FileRepository from '../../../domain/repositories/file.repository';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class FileController {
	async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const fileRepository: FileRepository = new FileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
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

			const fileRepository: FileRepository = new FileRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
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

			const fileRepository: FileRepository = new FileRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
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

			const fileRepository: FileRepository = new FileRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
			);

			baseController.findByIdWithEagerLoading(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const fileRepository: FileRepository = new FileRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
			);

			baseController.update(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async getCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const fileRepository: FileRepository = new FileRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
			);

			baseController.getCount(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const fileRepository: FileRepository = new FileRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
			);

			baseController.delete(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async customQuery(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const fileRepository: FileRepository = new FileRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IFile, File> = new BaseController(
				fileRepository,
				'File'
			);

			baseController.findCustom(req, res, next);
		} catch (error) {
			next(error);
		}
	}
}
