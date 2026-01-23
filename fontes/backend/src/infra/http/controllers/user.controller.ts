import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { NotFoundError } from '../../../errors/client.error';
import { IidentityService } from '../../../domain/services/Iidentity.service';
import { EntraIdService } from '../../../domain/services/entraId.service';
import { GetUserProfilePhotoUseCase } from '../../../useCases/user/getUserProfilePhoto.useCase';
import { UpdateUserProfilePhotoUseCase } from '../../../useCases/user/updateUserProfilePhoto.UseCase';
import { UnauthorizedError } from '../../../errors/client.error';
import { GetUserGroupsUseCase } from '../../../useCases/user/getUserGroups.useCase';
import UserRepository from '../../../domain/repositories/user.repository';
import { IUser, User } from '../../../domain/entities/user.model';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class UserController {
	async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			//O Service será criado com base no tipo de banco de dados e o model usado
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IUser, User> = new BaseController(
				userRepository,
				'User'
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
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IUser, User> = new BaseController(
				userRepository,
				'User'
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
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IUser, User> = new BaseController(
				userRepository,
				'User'
			);

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
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IUser, User> = new BaseController(
				userRepository,
				'User'
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
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IUser, User> = new BaseController(
				userRepository,
				'User'
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
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IUser, User> = new BaseController(
				userRepository,
				'User'
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
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);
			const baseController: BaseController<IUser, User> = new BaseController(
				userRepository,
				'User'
			);

			baseController.deleteAll(req, res, next);
		} catch (error) {
			next(error);
		}
	}

	async findByUID(req: AuthenticatedRequest, res: Response) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			//O Service será criado com base no tipo de banco de dados e o model usado
			const userRepository: UserRepository = new UserRepository(
				req.body.tenantConnection
			);

			const user = await userRepository.findOne({
				identityProviderUID: req.params.UID
			});
			if (!user) {
				return res.status(404).json({ message: 'Usuário não encontrado' });
			}
			return res.status(200).send(user);
		} catch (error) {
			return res.status(500).send({
				message: 'Ocorreu um erro desconhecido no servidor. ' + error
			});
		}
	}

	/**
	 * Cria o usuário dentro do banco de dados da aplicação da empresa
	 */
	async createUserForSpecificTenant(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			throw new Error('Função não finalizada');

			// return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async getUserProfilePhoto(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const identityService: IidentityService = new EntraIdService();
			const getUserProfilePhotoUseCase: GetUserProfilePhotoUseCase =
				new GetUserProfilePhotoUseCase(identityService);

			const result = await getUserProfilePhotoUseCase.execute({
				userID: req.body.userID
			});

			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async getUserImage(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const accessToken = req.session?.accessToken;
			if (!accessToken) {
				throw new UnauthorizedError('UNAUTHORIZED');
			}

			const identityService: IidentityService = new EntraIdService();
			const updateUserProfilePhotoUseCase: UpdateUserProfilePhotoUseCase =
				new UpdateUserProfilePhotoUseCase(identityService);

			const result = await updateUserProfilePhotoUseCase.execute({
				accessToken: accessToken,
				photoBlob: req.body //TODO tem que criar um middleware com o multer e guardar a imagem na memória para poder enviar para esse caso de uso
			});

			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async getUserGroups(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const accessToken = req.session?.accessToken;
			if (!accessToken) {
				throw new UnauthorizedError('UNAUTHORIZED');
			}

			const identityService: IidentityService = new EntraIdService();

			const getUserGroupsUseCase: GetUserGroupsUseCase =
				new GetUserGroupsUseCase(identityService);
			const result = await getUserGroupsUseCase.execute({
				accessToken: accessToken
			});

			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}
}
