import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { NotFoundError } from '../../../errors/client.error';
import {
	IFieldFile,
	FieldFile
} from '../../../domain/entities/fieldFile.model';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import FieldFileRepository from '../../../domain/repositories/fieldFile.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class FieldFileController {
	async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			//O Service será criado com base no tipo de banco de dados e o model usado
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

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
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

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
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

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
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

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
			//O Service será criado com base no tipo de banco de dados e o model usado
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

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
			//O Service será criado com base no tipo de banco de dados e o model usado
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

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
			//O Service será criado com base no tipo de banco de dados e o model usado
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

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
			//O Service será criado com base no tipo de banco de dados e o model usado
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);
			const baseController: BaseController<IFieldFile, FieldFile> =
				new BaseController(fieldFileRepository, 'fieldFile');

			baseController.findCustom(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async upload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			//O Service será criado com base no tipo de banco de dados e o model usado
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);

			// Extrair apenas a parte desejada
			const { fieldType, files } = req.body;

			// Criar uma nova variável com apenas os dados desejados
			const fieldFile = { fieldType, files };

			const data = await fieldFileRepository.upload(fieldFile);

			res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	async findAllFilesById(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			//O Service será criado com base no tipo de banco de dados e o model usado
			const fieldFileRepository: FieldFileRepository = new FieldFileRepository(
				req.tenantConnection as TenantConnection
			);

			const fieldFileId = parseInt(req.params.id, 10);

			if (!fieldFileId) {
				throw new Error('ID não fornecido ou inválido');
			}

			if (isNaN(fieldFileId)) {
				throw new Error('Invalid fieldFile ID');
			}

			const fieldFileWithFiles =
				await fieldFileRepository.findAllFilesById(fieldFileId);

			return res.status(200).json(fieldFileWithFiles);
		} catch (error) {
			next(error);
		}
	}
}
