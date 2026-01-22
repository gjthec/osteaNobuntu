import { NextFunction, Request, Response } from 'express';
import { NotFoundError, ValidationError } from '../../../errors/client.error';
import MenuRepository from '../../../domain/repositories/menu.repository';
import { TenantConnection } from '../../../domain/entities/tenantConnection.model';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class MenuController {
	async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const menuRepository: MenuRepository = new MenuRepository(
				req.tenantConnection as TenantConnection
			);

			const menus = await menuRepository.getAllMenus();
			res.status(200).json(menus);
		} catch (error) {
			console.log(error);
			next(error);
		}
	}

	async getDefaultMenu(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const menuRepository: MenuRepository = new MenuRepository(
				req.tenantConnection as TenantConnection
			);

			const menus = await menuRepository.getDefaultMenu();
			res.status(200).json(menus);
		} catch (error) {
			console.log(error);
			next(error);
		}
	}

	async getAllByRole(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			const menuRepository: MenuRepository = new MenuRepository(
				req.tenantConnection as TenantConnection
			);

			const roleId = parseInt(req.query.roleId as string);
			if (!roleId) {
				throw new ValidationError('VALITADION', {
					cause: 'roleId não foi informado.'
				});
			}

			if (isNaN(roleId)) {
				throw new ValidationError('VALITADION', {
					cause: 'roleId não é um número válido.'
				});
			}
			console.log(roleId);
			const menus = await menuRepository.getMenuByRole(roleId); //TODO: Trocar para pegar o role do usuário logado
			res.status(200).json(menus);
		} catch (error) {
			console.log(error);
			next(error);
		}
	}

	async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const menuRepository: MenuRepository = new MenuRepository(
				req.tenantConnection as TenantConnection
			);

			const id = parseInt(req.params.id as string);
			const menu = await menuRepository.getMenuById(id);

			if (!menu || menu.length === 0) {
				throw new NotFoundError('NOT_FOUND', { cause: 'Not found any menu' });
			}

			if (!menu || menu.length === 0) {
				throw new NotFoundError('NOT_FOUND', { cause: 'Not found any menu' });
			}

			res.status(200).json(menu);
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
}
