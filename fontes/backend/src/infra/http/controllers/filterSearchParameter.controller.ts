import { NextFunction, Request, Response } from 'express';
import { BaseController, PaginatedResponse } from './base.controller';
import {
	ForbiddenError,
	NotFoundError,
	ValidationError
} from '../../../errors/client.error';
import {
	FilterSearchParameter,
	IFilterSearchParameterDatabaseModel
} from '../../../domain/entities/filterSearchParameter.model';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import FilterSearchParameterRepository from '../../../domain/repositories/filterSearchParameter.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class FilterSearchParameterController {
	async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const userIdentityProviderUID: string = req.user!.identityProviderUID;

			if (!userIdentityProviderUID) {
				throw new ValidationError('VALITADION', { cause: 'Invalid user.' });
			}

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(
					req.tenantConnection as TenantConnection
				);
			const result =
				await filterSearchParameterRepository.advancedSearches.create(
					req.body,
					userIdentityProviderUID
				);
			return res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	}

	async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			if (!req.user) {
				throw new NotFoundError('USER_NOT_FOUND');
			}

			const id: number = Number(req.params.id);

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(
					req.tenantConnection as TenantConnection
				);
			const userId =
				await filterSearchParameterRepository.advancedSearches.checkUserAccess(
					id,
					['owner', 'read'],
					['owner', 'read'],
					req.user.identityProviderUID
				);

			if (userId) {
				const baseController: BaseController<
					IFilterSearchParameterDatabaseModel,
					FilterSearchParameter
				> = new BaseController(
					filterSearchParameterRepository,
					'FilterSearchParameter'
				);
				baseController.findById(req, res, next);
			} else {
				throw new ForbiddenError('FORBIDDEN', {
					cause: "User don't have permission."
				});
			}
		} catch (error) {
			next(error);
		}
	}

	async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			if (!req.user) {
				throw new NotFoundError('USER_NOT_FOUND');
			}

			const id: number = Number(req.params.id);

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(
					req.tenantConnection as TenantConnection
				);
			const userId =
				await filterSearchParameterRepository.advancedSearches.checkUserAccess(
					id,
					['owner', 'update'],
					['owner', 'update'],
					req.user.identityProviderUID
				);

			if (userId) {
				const baseController: BaseController<
					IFilterSearchParameterDatabaseModel,
					FilterSearchParameter
				> = new BaseController(
					filterSearchParameterRepository,
					'FilterSearchParameter'
				);
				baseController.update(req, res, next);
			} else {
				throw new ForbiddenError('FORBIDDEN', {
					cause: "User don't have permission."
				});
			}
		} catch (error) {
			next(error);
		}
	}

	async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			if (!req.user) {
				throw new NotFoundError('USER_NOT_FOUND');
			}

			const id: number = Number(req.params.id);

			if (!id) {
				throw new ValidationError('VALITADION', { cause: 'Id is required.' });
			}

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(
					req.tenantConnection as TenantConnection
				);
			const data =
				await filterSearchParameterRepository.advancedSearches.delete(
					id,
					req.user.identityProviderUID
				);

			if (!data) {
				throw new NotFoundError('NOT_FOUND', {
					cause: 'The entity not found.'
				});
			}

			return res.status(200).send({
				message: 'The entity with id: ' + id + ' deleted successfully.'
			});
		} catch (error) {
			next(error);
		}
	}

	async getAccessibleFilters(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			//Obtem a página
			const page: number = parseInt(req.query.page as string) || 1;
			//Obtem a quantidade limite de itens por página
			const pageSize: number = parseInt(req.query.pageSize as string) || 100;

			const startIndex = (page - 1) * pageSize;

			const className: string = req.query.className as string;

			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			if (!req.user) {
				throw new ValidationError('VALITADION', { cause: 'Invalid user.' });
			}

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(
					req.tenantConnection as TenantConnection
				);
			const data =
				await filterSearchParameterRepository.advancedSearches.getAccessibleByUserIdentityProviderUID(
					className,
					req.user.identityProviderUID,
					pageSize,
					startIndex
				);
			const count =
				await filterSearchParameterRepository.advancedSearches.getCountAccessibleByUserIdentityProviderUID(
					className,
					req.user.identityProviderUID
				);

			const formattedData: PaginatedResponse<FilterSearchParameter> = {
				items: data,
				page: page,
				pageSize: pageSize,
				total: count
			};

			res.status(200).send(formattedData);
		} catch (error) {
			next(error);
		}
	}

	async setUserPermission(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			if (!req.user) {
				throw new ValidationError('VALITADION', { cause: 'Invalid user.' });
			}

			const filterSearchParameterId: number = Number(req.body.id);
			const permissionReceiverId: number = Number(
				req.body.permissionReceiverId
			);
			const accessLevel: string = req.body.accessLevel;

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(
					req.tenantConnection as TenantConnection
				);
			const data =
				await filterSearchParameterRepository.advancedSearches.setUserPermissionForFilterSearchParameter(
					req.user.id!,
					permissionReceiverId,
					filterSearchParameterId,
					accessLevel
				);

			res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}

	async removeUserPermission(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			if (!req.user) {
				throw new ValidationError('VALITADION', { cause: 'Invalid user.' });
			}

			const filterSearchParameterId: number = Number(req.body.id);
			const permissionReceiverId: number = Number(
				req.body.permissionReceiverId
			);

			const filterSearchParameterRepository: FilterSearchParameterRepository =
				new FilterSearchParameterRepository(
					req.tenantConnection as TenantConnection
				);
			const data =
				await filterSearchParameterRepository.advancedSearches.removeUserPermissionForFilterSearchParameter(
					req.user.id!,
					permissionReceiverId,
					filterSearchParameterId
				);

			res.status(200).send(data);
		} catch (error) {
			next(error);
		}
	}
}
