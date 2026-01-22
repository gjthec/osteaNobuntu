import { Transaction } from 'sequelize';
import {
	FunctionSystem,
	IFunctionSystem,
	IFunctionSystemDatabaseModel
} from '../../../../domain/entities/functionSystem.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import FunctionSystemRepository, {
	IFunctionSystemRepository
} from '../../../../domain/repositories/functionSystem.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';
import { FunctionSystemRole } from '../../../../domain/entities/functionSystemRole.model';
import { InternalServerError } from '../../../../errors/internal.error';
import { ForbiddenError, NotFoundError } from '../../../../errors/client.error';
import UserRepository from '../../../../domain/repositories/user.repository';
import RoleRepository from '../../../../domain/repositories/role.repository';
import { Role } from '../../../../domain/entities/role.model';
import FunctionSystemUserRepository from '../../../../domain/repositories/functionSystemUser.repository';
import UserRoleRepository from '../../../../domain/repositories/userRole.repository';
import FunctionSystemRoleRepository from '../../../../domain/repositories/functionSystemRole.repository';

export class FunctionSystemRepositorySequelize
	implements IFunctionSystemRepository
{
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<
			IFunctionSystemDatabaseModel,
			FunctionSystem
		>
	) {}

	async create(
		functionSystem: IFunctionSystem,
		userId: number
	): Promise<FunctionSystem> {
		const functionSystemRepository: FunctionSystemRepository =
			new FunctionSystemRepository(this.tenantConnection);

		const transaction = await functionSystemRepository.startTransaction();

		try {
			const userRepository: UserRepository = new UserRepository(
				this.tenantConnection
			);
			//Verificar se o usuário existe
			const user = await userRepository.findById(userId);

			if (!user) {
				throw new NotFoundError('NOT_FOUND', { cause: "User don't exist." });
			}

			const newFunctionSystem =
				await functionSystemRepository.createWithTransaction(
					functionSystem,
					transaction
				);

			const functionSystemUserRepository: FunctionSystemUserRepository =
				new FunctionSystemUserRepository(this.tenantConnection);

			const newFunctionSystemUser =
				await functionSystemUserRepository.createWithTransaction(
					{
						functionSystemId: newFunctionSystem.id,
						accessLevel: 'owner',
						userId: user.id
					},
					transaction
				);

			await functionSystemRepository.commitTransaction(transaction);

			return FunctionSystem.fromJson(newFunctionSystem);
		} catch (error) {
			await functionSystemRepository.rollbackTransaction(transaction);

			throw new InternalServerError('Error to create a new FunctionSystem.', {
				cause: error
			});
		}
	}

	async delete(
		functionSystemId: number,
		userId: number
	): Promise<FunctionSystem> {
		const functionSystemRepository: FunctionSystemRepository =
			new FunctionSystemRepository(this.tenantConnection);

		const transaction = (await this.adapter.startTransaction()) as Transaction;

		try {
			const userRepository: UserRepository = new UserRepository(
				this.tenantConnection
			);
			//Verificar se o usuário existe
			const user = await userRepository.findById(userId);

			if (!user || user.id == undefined) {
				throw new NotFoundError('USER_NOT_FOUND', {
					cause: "User don't exist."
				});
			}

			const functionSystemUserRepository: FunctionSystemUserRepository =
				new FunctionSystemUserRepository(this.tenantConnection);

			const removedFunctionSystemUserList =
				await functionSystemUserRepository.deleteManyWithTransaction(
					{
						functionSystemId: functionSystemId,
						userId: userId,
						accessLevel: 'owner'
					},
					transaction
				);

			//Caso o usuário tem permissão para remover o filtro por ter uma role/permissão que dê nível de acesso como dono, ele poderá remover
			const isUserAllowedToDeleteByRole =
				await this.isUserAllowedToDeleteByRole(functionSystemId, userId);
			if (isUserAllowedToDeleteByRole == true) {
				const functionSystemRoleRepository: FunctionSystemRoleRepository =
					new FunctionSystemRoleRepository(this.tenantConnection);

				const removedFunctionSystemRoleList: FunctionSystemRole[] =
					await functionSystemRoleRepository.deleteManyWithTransaction(
						{
							functionSystemId: functionSystemId
						},
						transaction
					);
			}

			if (
				removedFunctionSystemUserList.length == 1 ||
				isUserAllowedToDeleteByRole == true
			) {
				const functionSystem = await this.adapter.deleteWithTransaction(
					functionSystemId,
					transaction
				);

				await functionSystemRepository.commitTransaction(transaction);

				return FunctionSystem.fromJson(functionSystem);
			} else {
				throw new ForbiddenError('FORBIDDEN');
			}
		} catch (error) {
			await functionSystemRepository.rollbackTransaction(transaction);

			if (error instanceof ForbiddenError) {
				throw error;
			} else {
				throw new InternalServerError('Error to delete Function System.', {
					cause: error
				});
			}
		}
	}

	async isUserAllowedToDeleteByRole(
		functionSystemId: number,
		userId: number
	): Promise<Boolean> {
		//Obter as roles (permissões) do usuário
		const userRoleRepository: UserRoleRepository = new UserRoleRepository(
			this.tenantConnection
		);

		const roleList = await userRoleRepository.findMany({ userId: userId });
		// Se a lista de identificadores de roles estiver vazia, é enviado um valor impossível para o IN ()
		const safeRoleIdList = roleList.length > 0 ? roleList : [-1];

		//Pesquisa pela Role e ver se está como nível de acesso que permite remoção
		const functionSystemListQuery = `
        SELECT DISTINCT functionSystem.*
        FROM "function_systems" functionSystem
        LEFT JOIN "function_system_roles" functionSystemRole ON functionSystem.id = functionSystemRole."functionSystemId"
        WHERE functionSystem."id" = ${functionSystemId}
          OR functionSystemRole."roleId" IN (${safeRoleIdList})
        ORDER BY functionSystem."createdAt" DESC
      `;

		try {
			const functionSystemList = (await this.adapter.executeQuery(
				functionSystemListQuery
			)) as Object[];

			const _functionSystemList = functionSystemList.map((functionSystem) =>
				FunctionSystem.fromJson(functionSystem as IFunctionSystem)
			);

			if (_functionSystemList && _functionSystemList.length == 0) {
				return false;
			}

			return true;
		} catch (error) {
			throw new InternalServerError(
				'Error to check if user has permission to delete FunctionSystem by User id.',
				{ cause: error }
			);
		}
	}

	async setUserPermissionForFunctionSystem(
		permissionGiverId: number,
		permissionReceiverId: number,
		functionSystemId: number,
		accessLevel: string
	): Promise<FunctionSystem> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verifica se quem irá dar permissão existe
		const permissionGiver = await userRepository.findById(permissionGiverId);

		if (!permissionGiver || permissionGiver.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', { cause: "User don't exist." });
		}

		//Verifica se o quem irá receber a permissão existe
		const permissionReceiver =
			await userRepository.findById(permissionReceiverId);

		if (!permissionReceiver || permissionReceiver.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', { cause: "User don't exist." });
		}

		//Verifica se o functionSystem existe
		const functionSystem = await this.adapter.findOne({
			id: functionSystemId
		});

		if (!functionSystem || functionSystem.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FunctionSystem don't exist."
			});
		}

		//Verifica se o usuário pode dar permissão para outros
		const functionSystemList = await this.getByOwner(permissionGiverId);
		const filtredFunctionSystem = functionSystemList.filter(
			(functionSystem) => functionSystem.id == functionSystemId
		);

		if (filtredFunctionSystem.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this functionSystem."
			});
		}

		//Faz a operação de dar permissão para outro usuário no functionSystem
		const functionSystemUserRepository: FunctionSystemUserRepository =
			new FunctionSystemUserRepository(this.tenantConnection);

		await functionSystemUserRepository.create({
			userId: permissionReceiverId,
			functionSystemId: functionSystemId,
			accessLevel: accessLevel
		});

		return functionSystem;
	}

	async setRolePermissionForFunctionSystem(
		permissionGiverId: number,
		roleId: number,
		functionSystemId: number,
		accessLevel: string
	): Promise<FunctionSystem> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verifica se quem irá dar permissão existe
		const permissionGiver = await userRepository.findById(permissionGiverId);

		if (!permissionGiver || permissionGiver.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', {
				cause: "User don't exist."
			});
		}

		//Verifica se a Role existe
		const roleRepository: RoleRepository = new RoleRepository(
			this.tenantConnection
		);

		const role = await roleRepository.findById(roleId);

		if (!role || role.id == undefined) {
			throw new NotFoundError('NOT_FOUND', { cause: "Role don't exist" });
		}

		//Verifica se o functionSystem existe
		const functionSystem = await this.adapter.findOne({
			id: functionSystemId
		});

		if (!functionSystem || functionSystem.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FunctionSystem don't exist."
			});
		}

		//Verifica se o usuário pode dar permissão
		const functionSystemList = await this.getByOwner(permissionGiverId);
		const filtredFunctionSystem = functionSystemList.filter(
			(functionSystem) => functionSystem.id == functionSystemId
		);

		if (filtredFunctionSystem.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this functionSystem."
			});
		}

		//Faz a operação de dar permissão para Role no functionSystem
		const functionSystemRoleRepository: FunctionSystemRoleRepository =
			new FunctionSystemRoleRepository(this.tenantConnection);

		await functionSystemRoleRepository.create({
			roleId: roleId,
			functionSystemId: functionSystemId,
			accessLevel: accessLevel
		});

		return functionSystem;
	}

	async removeUserPermissionForFunctionSystem(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		functionSystemId: number
	): Promise<FunctionSystem> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verifica se quem irá retirar a permissão existe
		const permissionGiver = await userRepository.findById(permissionRemoverId);

		if (!permissionGiver || permissionGiver.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', {
				cause: "User don't exist."
			});
		}

		//Verifica se o quem irá perder a permissão existe
		const permissionReceiver =
			await userRepository.findById(permissionRevokeeId);

		if (!permissionReceiver || permissionReceiver.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', {
				cause: "User don't exist."
			});
		}

		//Verifica se o functionSystem existe
		const functionSystem = await this.adapter.findOne({
			id: functionSystemId
		});

		if (!functionSystem || functionSystem.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FunctionSystem don't exist."
			});
		}

		//Verifica se o usuário pode alterar permissão para outros
		const functionSystemList = await this.getByOwner(permissionRemoverId);
		const filtredFunctionSystem = functionSystemList.filter(
			(functionSystem) => functionSystem.id == functionSystemId
		);

		if (filtredFunctionSystem.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this functionSystem."
			});
		}

		//Faz a operação de remover permissão de outro usuário no functionSystem
		const functionSystemUserRepository: FunctionSystemUserRepository =
			new FunctionSystemUserRepository(this.tenantConnection);

		const functionSystemUser = await functionSystemUserRepository.findOne({
			userId: permissionRevokeeId,
			functionSystemId: functionSystemId
		});

		if (!functionSystemUser || functionSystemUser.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FunctionSystemUser don't exist."
			});
		}

		await functionSystemUserRepository.delete(functionSystemUser.id);

		return functionSystem;
	}

	async removeRolePermissionForFunctionSystem(
		permissionRemoverId: number,
		roleId: number,
		functionSystemId: number
	): Promise<FunctionSystem> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verifica se quem irá retirar a permissão existe
		const permissionGiver = await userRepository.findById(permissionRemoverId);

		if (!permissionGiver || permissionGiver.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', {
				cause: "User don't exist."
			});
		}

		//Verifica se a Role existe
		const roleRepository: RoleRepository = new RoleRepository(
			this.tenantConnection
		);

		const role = await roleRepository.findById(roleId);

		if (!role || role.id == undefined) {
			throw new NotFoundError('NOT_FOUND', { cause: "Role don't exist" });
		}

		//Verifica se o functionSystem existe
		const functionSystem = await this.adapter.findOne({
			id: functionSystemId
		});

		if (!functionSystem || functionSystem.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FunctionSystem don't exist."
			});
		}

		//Verifica se o usuário pode alterar permissão para outros
		const functionSystemList = await this.getByOwner(permissionRemoverId);
		const filtredFunctionSystem = functionSystemList.filter(
			(functionSystem) => functionSystem.id == functionSystemId
		);

		if (filtredFunctionSystem.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this functionSystem."
			});
		}

		//Faz a operação de remover permissão de outro usuário no functionSystem
		const functionSystemRoleRepository: FunctionSystemRoleRepository =
			new FunctionSystemRoleRepository(this.tenantConnection);

		const functionSystemRole = await functionSystemRoleRepository.findOne({
			roleId: roleId,
			functionSystemId: functionSystemId
		});

		if (!functionSystemRole || functionSystemRole.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FunctionSystemRole don't exist."
			});
		}

		await functionSystemRoleRepository.delete(functionSystemRole.id);

		return functionSystem;
	}

	async getByOwner(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		//Pesquisar pelo User e ver se está como dono (owner) do filtro
		let functionSystemListQuery = `
        SELECT DISTINCT functionSystem.*
        FROM "function_systems" functionSystem
        LEFT JOIN "function_system_users" functionSystemUser ON functionSystem.id = functionSystemUser."functionSystemId"
        WHERE functionSystemUser."userId" = ${userId}
          AND functionSystemUser."accessLevel" = "owner"
        ORDER BY functionSystem."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			functionSystemListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const functionSystemList = (await this.adapter.executeQuery(
				functionSystemListQuery
			)) as Object[];

			return functionSystemList.map((functionSystem) =>
				FunctionSystem.fromJson(functionSystem as IFunctionSystem)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get function System list by owner.',
				{ cause: error }
			);
		}
	}

	async getPublic(pageSize?: number, page?: number): Promise<FunctionSystem[]> {
		const functionSystemList = await this.adapter.findMany(
			{
				isPublic: true
			},
			pageSize,
			page
		);

		const formattedData = functionSystemList.map((f: any) =>
			f.get({ plain: true })
		);

		return formattedData.map((functionSystem) =>
			FunctionSystem.fromJson(functionSystem)
		);
	}

	async getByUserPermissions(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		let functionSystemListQuery = `
        SELECT DISTINCT functionSystem.*
        FROM "function_systems" functionSystem
        LEFT JOIN "function_system_users" functionSystemUser ON functionSystem.id = functionSystemUser."functionSystemId"
        WHERE functionSystem."isPublic" = true
          OR functionSystemUser."userId" = ${userId}
        ORDER BY functionSystem."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			functionSystemListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const functionSystemList = (await this.adapter.executeQuery(
				functionSystemListQuery
			)) as Object[];

			return functionSystemList.map((functionSystem) =>
				FunctionSystem.fromJson(functionSystem as IFunctionSystem)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get function System list by user.',
				{ cause: error }
			);
		}
	}

	async getByRolePermissions(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		let functionSystemListQuery = `
        SELECT DISTINCT functionSystem.*
        FROM "function_systems" functionSystem
        LEFT JOIN "function_system_roles" functionSystemRole ON functionSystem.id = functionSystemRole."functionSystemId"
        WHERE functionSystem."isPublic" = true
          OR functionSystemRole."roleId" = ${roleId}
        ORDER BY functionSystem."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			functionSystemListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const functionSystemList = (await this.adapter.executeQuery(
				functionSystemListQuery
			)) as Object[];

			return functionSystemList.map((functionSystem) =>
				FunctionSystem.fromJson(functionSystem as IFunctionSystem)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get function System list by role.',
				{ cause: error }
			);
		}
	}

	async getAccessible(
		userId: number,
		roleIdList: number[],
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verificar se o usuário existe
		const user = await userRepository.findById(userId);

		if (!user || user.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "User don't exist to delete databaseCredential."
			});
		}

		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		// Se a lista de identificadores de roles estiver vazia, é enviado um valor impossível para o IN ()
		const safeRoleIdList = roleIdList.length > 0 ? roleIdList : [-1];

		let functionSystemListQuery = `
        SELECT DISTINCT functionSystem.*
        FROM "function_systems" functionSystem
        LEFT JOIN "function_system_users" functionSystemUser ON functionSystem.id = functionSystemUser."functionSystemId"
        LEFT JOIN "function_system_roles" functionSystemRole ON functionSystem.id = functionSystemRole."functionSystemId"
        WHERE functionSystem."isPublic" = true
          OR functionSystemUser."userId" = ${user.id}
          OR functionSystemRole."roleId" IN (${safeRoleIdList})
        ORDER BY functionSystem."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			functionSystemListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const functionSystemList = (await this.adapter.executeQuery(
				functionSystemListQuery
			)) as Object[];

			return functionSystemList.map((functionSystem) =>
				FunctionSystem.fromJson(functionSystem as IFunctionSystem)
			);
		} catch (error) {
			throw new InternalServerError('Error to get function System list.', {
				cause: error
			});
		}
	}

	async getAccessibleByUserIdentityProviderUID(
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<FunctionSystem[]> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verificar se o usuário existe
		const user = await userRepository.findOne({
			identityProviderUID: identityProviderUID
		});

		if (!user || user.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', { cause: "User don't exist." });
		}

		const roleRepository: RoleRepository = new RoleRepository(
			this.tenantConnection
		);

		const roleList: Role[] =
			await roleRepository.advancedSearches.getRoleListByUserId(user.id);

		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		const roleIds = (roleList || []).map((r) => r.id);
		// Se a lista de identificadores de roles  estiver vazia, é enviado um valor impossível para o IN ()
		const safeRoleIdList = roleIds.length > 0 ? roleIds : [-1];

		let functionSystemListQuery = `
        SELECT DISTINCT functionSystem.*
        FROM "function_systems" functionSystem
        LEFT JOIN "function_system_users" functionSystemUser ON functionSystem.id = functionSystemUser."functionSystemId"
        LEFT JOIN "function_system_roles" functionSystemRole ON functionSystem.id = functionSystemRole."functionSystemId"
        WHERE functionSystem."isPublic" = true
          OR functionSystemUser."userId" = ${user.id}
          OR functionSystemRole."roleId" IN (${safeRoleIdList})
        ORDER BY functionSystem."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			functionSystemListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const functionSystemList = (await this.adapter.executeQuery(
				functionSystemListQuery
			)) as Object[];

			return functionSystemList.map((functionSystem) =>
				FunctionSystem.fromJson(functionSystem as IFunctionSystem)
			);
		} catch (error) {
			throw new InternalServerError('Error to get Function System list.', {
				cause: error
			});
		}
	}

	async getCountAccessibleByUserIdentityProviderUID(
		identityProviderUID: string
	): Promise<number> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verificar se o usuário existe
		const user = await userRepository.findOne({
			identityProviderUID: identityProviderUID
		});

		if (!user || user.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', { cause: "User don't exist." });
		}

		const roleRepository: RoleRepository = new RoleRepository(
			this.tenantConnection
		);

		const roleList: Role[] =
			await roleRepository.advancedSearches.getRoleListByUserId(user.id);

		const roleIds = (roleList || []).map((r) => r.id);
		// Se a lista de identificadores de roles  estiver vazia, é enviado um valor impossível para o IN ()
		const safeRoleIdList = roleIds.length > 0 ? roleIds : [-1];

		const functionSystemCountQuery = `
        SELECT COUNT(DISTINCT functionSystem.id) as total
        FROM "function_systems" functionSystem
        LEFT JOIN "function_system_users" functionSystemUser ON functionSystem.id = functionSystemUser."functionSystemId"
        LEFT JOIN "function_system_roles" functionSystemRole ON functionSystem.id = functionSystemRole."functionSystemId"
        WHERE functionSystem."isPublic" = true
          OR functionSystemUser."userId" = ${user.id}
          OR functionSystemRole."roleId" IN (${safeRoleIdList})
      `;

		try {
			const functionSystemCountResult = (await this.adapter.executeQuery(
				functionSystemCountQuery
			)) as any[];

			const functionSystemCount = parseInt(
				functionSystemCountResult[0]?.total || '0',
				10
			);
			return functionSystemCount;
		} catch (error) {
			throw new InternalServerError('Error to get function System count.', {
				cause: error
			});
		}
	}
}
