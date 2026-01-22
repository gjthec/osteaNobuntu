import {
	FilterSearchParameter,
	IFilterSearchParameter,
	IFilterSearchParameterDatabaseModel
} from '../../../../domain/entities/filterSearchParameter.model';
import { FilterSearchParameterRole } from '../../../../domain/entities/filterSearchParameterRole.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import FilterSearchParameterRepository, {
	IFilterSearchParameterRepository
} from '../../../../domain/repositories/filterSearchParameter.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';
import { Transaction } from 'sequelize';
import { ForbiddenError } from '../../../../errors/client.error';
import { NotFoundError } from '../../../../errors/client.error';
import { InternalServerError } from '../../../../errors/internal.error';
import UserRepository from '../../../../domain/repositories/user.repository';
import { Role } from '../../../../domain/entities/role.model';
import RoleRepository from '../../../../domain/repositories/role.repository';
import FilterSearchParameterUserRepository from '../../../../domain/repositories/filterSearchParameterUser.repository';
import FilterSearchParameterRoleRepository from '../../../../domain/repositories/filterSearchParameterRole.repository';
import { IUserDatabaseModel } from '../../../../domain/entities/user.model';

export class FilterSearchParameterRepositorySequelize
	implements IFilterSearchParameterRepository
{
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<
			IFilterSearchParameterDatabaseModel,
			FilterSearchParameter
		>
	) {}

	async checkUserAccess(
		filterSearchParameterId: number,
		userAccessLevelList: string[],
		roleAccessLevelList: string[],
		userIdentityProviderUID: string
	): Promise<number> {
		const checkUserAccessQuery = `
    SELECT DISTINCT u.id AS "id"
      FROM "users" u
      LEFT JOIN "user_roles" userRole ON u.id = userRole."userId"
      LEFT JOIN "roles" role ON userRole."roleId" = role.id
      INNER JOIN "filter_search_parameters" filterSearchParameter ON filterSearchParameter.id = :filterSearchParameterId
      LEFT JOIN "filter_search_parameter_users" filterSearchParameterUser ON filterSearchParameter.id = filterSearchParameterUser."filterSearchParameterId"
      LEFT JOIN "filter_search_parameter_roles" filterSearchParameterRole ON filterSearchParameter.id = filterSearchParameterRole."filterSearchParameterId"
      WHERE u."identityProviderUID" = :userIdentityProviderUID        
        AND (
          (filterSearchParameter."isPublic" = TRUE)
          OR (
		  	      (filterSearchParameterUser."userId" = u.id AND filterSearchParameterUser."accessLevel" IN (:userAccessLevelList))
          	  OR 
			        (filterSearchParameterRole."roleId" = role.id AND filterSearchParameterRole."accessLevel" IN (:roleAccessLevelList))
            )
          )
      LIMIT 1
      `;

		try {
			const userList = (await this.adapter.executeQuery(checkUserAccessQuery, {
				filterSearchParameterId: filterSearchParameterId,
				userIdentityProviderUID: userIdentityProviderUID,
				userAccessLevelList: userAccessLevelList,
				roleAccessLevelList: roleAccessLevelList
			})) as IUserDatabaseModel[];

			if (!userList || userList.length === 0) {
				throw new ForbiddenError('FORBIDDEN');
			}

			return userList[0].id as number;
		} catch (error) {
			console.log(error);
			throw new InternalServerError('Erro on check user access.', {
				cause: error
			});
		}
	}

	async create(
		filterSearchParameter: IFilterSearchParameter,
		userIdentityProviderUID: string
	): Promise<FilterSearchParameter> {
		const filterSearchParameterRepository: FilterSearchParameterRepository =
			new FilterSearchParameterRepository(this.tenantConnection);

		const transaction =
			await filterSearchParameterRepository.startTransaction();

		try {
			const userRepository: UserRepository = new UserRepository(
				this.tenantConnection
			);
			//Verificar se o usuário existe
			const user = await userRepository.findOne({
				identityProviderUID: userIdentityProviderUID
			});

			if (!user) {
				throw new NotFoundError('NOT_FOUND', { cause: "User don't exist." });
			}

			const newFilterSearchParameter =
				await filterSearchParameterRepository.createWithTransaction(
					filterSearchParameter,
					transaction
				);

			const filterSearchParameterUserRepository: FilterSearchParameterUserRepository =
				new FilterSearchParameterUserRepository(this.tenantConnection);
			const newFilterSearchParameterUser =
				await filterSearchParameterUserRepository.createWithTransaction(
					{
						filterSearchParameterId: newFilterSearchParameter.id,
						accessLevel: 'owner',
						userId: user.id
					},
					transaction
				);

			await filterSearchParameterRepository.commitTransaction(transaction);

			return FilterSearchParameter.fromJson(newFilterSearchParameter);
		} catch (error) {
			await filterSearchParameterRepository.rollbackTransaction(transaction);
			throw new InternalServerError(
				'Error to create a new FilterSearchParameter.',
				{ cause: error }
			);
		}
	}

	async delete(
		filterSearchParameterId: number,
		userIdentityProviderUID: string
	): Promise<FilterSearchParameter> {
		const filterSearchParameterRepository: FilterSearchParameterRepository =
			new FilterSearchParameterRepository(this.tenantConnection);

		const transaction = (await this.adapter.startTransaction()) as Transaction;

		try {
			const userId = await this.checkUserAccess(
				filterSearchParameterId,
				['delete', 'owner'],
				['delete', 'owner'],
				userIdentityProviderUID
			);

			const filterSearchParameterUserRepository: FilterSearchParameterUserRepository =
				new FilterSearchParameterUserRepository(this.tenantConnection);

			const removedFilterSearchParameterUserList =
				await filterSearchParameterUserRepository.deleteManyWithTransaction(
					{
						filterSearchParameterId: filterSearchParameterId,
						userId: userId,
						accessLevel: 'owner'
					},
					transaction
				);

			const filterSearchParameterRoleRepository: FilterSearchParameterRoleRepository =
				new FilterSearchParameterRoleRepository(this.tenantConnection);

			const removedFilterSearchParameterRoleList: FilterSearchParameterRole[] =
				await filterSearchParameterRoleRepository.deleteManyWithTransaction(
					{
						filterSearchParameterId: filterSearchParameterId
					},
					transaction
				);

			if (removedFilterSearchParameterUserList.length == 1) {
				const deletedFilterSearchParameter =
					await this.adapter.deleteWithTransaction(
						filterSearchParameterId,
						transaction
					);

				await filterSearchParameterRepository.commitTransaction(transaction);

				return FilterSearchParameter.fromJson(deletedFilterSearchParameter);
			} else {
				throw new ForbiddenError('FORBIDDEN');
			}
		} catch (error) {
			await filterSearchParameterRepository.rollbackTransaction(transaction);

			if (error instanceof ForbiddenError) {
				throw error;
			} else {
				throw new InternalServerError(
					'Error to delete Filter search parameter.',
					{ cause: error }
				);
			}
		}
	}

	async setUserPermissionForFilterSearchParameter(
		permissionGiverId: number,
		permissionReceiverId: number,
		filterSearchParameterId: number,
		accessLevel: string
	): Promise<FilterSearchParameter> {
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

		//Verifica se o filtro existe
		const filterSearchParameter = await this.adapter.findOne({
			id: filterSearchParameterId
		});

		if (!filterSearchParameter || filterSearchParameter.id == undefined) {
			throw new NotFoundError('NOT_FOUND');
		}

		//Verifica se o usuário pode dar permissão para outros
		// const filterSearchParameterList = await this.getByOwner(permissionGiverId);
		// const filtredFilterSearchParameter = filterSearchParameterList.filter((filterSearchParameter) => filterSearchParameter.id == filterSearchParameterId);

		// if (filtredFilterSearchParameter.length == 0) {
		//   throw new ForbiddenError("User don't have permission to manage this filterSearchParameter.");
		// }
		const userId = this.checkUserAccess(
			filterSearchParameter.id,
			['owner'],
			['owner'],
			permissionGiver.identityProviderUID!
		);

		//Faz a operação de dar permissão para outro usuário no filterSearchParameter
		const filterSearchParameterUserRepository: FilterSearchParameterUserRepository =
			new FilterSearchParameterUserRepository(this.tenantConnection);

		await filterSearchParameterUserRepository.create({
			userId: permissionReceiverId,
			filterSearchParameterId: filterSearchParameterId,
			accessLevel: accessLevel
		});

		return filterSearchParameter;
	}

	async setRolePermissionForFilterSearchParameter(
		permissionGiverId: number,
		roleId: number,
		filterSearchParameterId: number,
		accessLevel: string
	): Promise<FilterSearchParameter> {
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

		//Verifica se o filtro existe
		const filterSearchParameter = await this.adapter.findOne({
			id: filterSearchParameterId
		});

		if (!filterSearchParameter || filterSearchParameter.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FilterSearchParameter don't exist."
			});
		}

		//Verifica se o usuário pode dar permissão
		// const filterSearchParameterList = await this.getByOwner(permissionGiverId);
		// const filtredFilterSearchParameter = filterSearchParameterList.filter((filterSearchParameter) => filterSearchParameter.id == filterSearchParameterId);

		// if (filtredFilterSearchParameter.length == 0) {
		//   throw new ForbiddenError("User don't have permission to manage this filterSearchParameter.");
		// }
		const userId = this.checkUserAccess(
			filterSearchParameter.id,
			['owner'],
			['owner'],
			permissionGiver.identityProviderUID!
		);

		//Faz a operação de dar permissão para Role no filterSearchParameter
		const filterSearchParameterRoleRepository: FilterSearchParameterRoleRepository =
			new FilterSearchParameterRoleRepository(this.tenantConnection);

		await filterSearchParameterRoleRepository.create({
			roleId: roleId,
			filterSearchParameterId: filterSearchParameterId,
			accessLevel: accessLevel
		});

		return filterSearchParameter;
	}

	async removeUserPermissionForFilterSearchParameter(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		filterSearchParameterId: number
	): Promise<FilterSearchParameter> {
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

		//Verifica se o filtro existe
		const filterSearchParameter = await this.adapter.findOne({
			id: filterSearchParameterId
		});

		if (!filterSearchParameter || filterSearchParameter.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FilterSearchParameter don't exist."
			});
		}

		//Verifica se o usuário pode alterar permissão para outros
		// const filterSearchParameterList = await this.getByOwner(permissionRemoverId);
		// const filtredFilterSearchParameter = filterSearchParameterList.filter((filterSearchParameter) => filterSearchParameter.id == filterSearchParameterId);

		// if (filtredFilterSearchParameter.length == 0) {
		//   throw new ForbiddenError("User don't have permission to manage this filterSearchParameter.");
		// }
		const userId = this.checkUserAccess(
			filterSearchParameter.id,
			['owner'],
			['owner'],
			permissionGiver.identityProviderUID!
		);

		//Faz a operação de remover permissão de outro usuário no filterSearchParameter
		const filterSearchParameterUserRepository: FilterSearchParameterUserRepository =
			new FilterSearchParameterUserRepository(this.tenantConnection);

		const filterSearchParameterUser =
			await filterSearchParameterUserRepository.findOne({
				userId: permissionRevokeeId,
				filterSearchParameterId: filterSearchParameterId
			});

		if (
			!filterSearchParameterUser ||
			filterSearchParameterUser.id == undefined
		) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FilterSearchParameterUser don't exist."
			});
		}

		await filterSearchParameterUserRepository.delete(
			filterSearchParameterUser.id
		);

		return filterSearchParameter;
	}

	async removeRolePermissionForFilterSearchParameter(
		permissionRemoverId: number,
		roleId: number,
		filterSearchParameterId: number
	): Promise<FilterSearchParameter> {
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

		//Verifica se o filtro existe
		const filterSearchParameter = await this.adapter.findOne({
			id: filterSearchParameterId
		});

		if (!filterSearchParameter || filterSearchParameter.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FilterSearchParameter don't exist."
			});
		}

		//Verifica se o usuário pode alterar permissão para outros
		const filterSearchParameterList =
			await this.getByOwner(permissionRemoverId);
		const filtredFilterSearchParameter = filterSearchParameterList.filter(
			(filterSearchParameter) =>
				filterSearchParameter.id == filterSearchParameterId
		);

		if (filtredFilterSearchParameter.length == 0) {
			throw new ForbiddenError('FORBIDDEN');
		}

		//Faz a operação de remover permissão de outro usuário no filterSearchParameter
		const filterSearchParameterRoleRepository: FilterSearchParameterRoleRepository =
			new FilterSearchParameterRoleRepository(this.tenantConnection);

		const filterSearchParameterRole =
			await filterSearchParameterRoleRepository.findOne({
				roleId: roleId,
				filterSearchParameterId: filterSearchParameterId
			});

		if (
			!filterSearchParameterRole ||
			filterSearchParameterRole.id == undefined
		) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "FilterSearchParameterRole don't exist."
			});
		}

		await filterSearchParameterRoleRepository.delete(
			filterSearchParameterRole.id
		);

		return filterSearchParameter;
	}

	async getByOwner(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		//Pesquisar pelo User e ver se está como dono (owner) do filtro
		let filterSearchParameterListQuery = `
      SELECT DISTINCT filterSearchParameter.*
      FROM "filter_search_parameters" filterSearchParameter
      LEFT JOIN "filter_search_parameter_users" filterSearchParameterUser ON filterSearchParameter.id = filterSearchParameterUser."filterSearchParameterId"
      WHERE filterSearchParameterUser."userId" = :userId
        AND filterSearchParameterUser."accessLevel" = "owner"
      ORDER BY filterSearchParameter."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			filterSearchParameterListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const filterSearchParameterList = (await this.adapter.executeQuery(
				filterSearchParameterListQuery,
				{ userId: userId }
			)) as Object[];

			return filterSearchParameterList.map((filterSearchParameter) =>
				FilterSearchParameter.fromJson(filterSearchParameter)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get filter Search Parameter list by owner.',
				{ cause: error }
			);
		}
	}

	async getPublic(
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]> {
		const filterSearchParameterList = await this.adapter.findMany(
			{
				isPublic: true
			},
			pageSize,
			page
		);

		const formattedData = filterSearchParameterList.map((f: any) =>
			f.get({ plain: true })
		);

		return formattedData.map((filterSearchParameter) =>
			FilterSearchParameter.fromJson(filterSearchParameter)
		);
	}

	async getByUserPermissions(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		let filterSearchParameterListQuery = `
      SELECT DISTINCT filterSearchParameter.*
      FROM "filter_search_parameters" filterSearchParameter
      LEFT JOIN "filter_search_parameter_users" filterSearchParameterUser ON filterSearchParameter.id = filterSearchParameterUser."filterSearchParameterId"
      WHERE filterSearchParameter."isPublic" = true
        OR filterSearchParameterUser."userId" = :userId
      ORDER BY filterSearchParameter."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			filterSearchParameterListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const filterSearchParameterList = (await this.adapter.executeQuery(
				filterSearchParameterListQuery,
				{ userId: userId }
			)) as Object[];

			return filterSearchParameterList.map((filterSearchParameter) =>
				FilterSearchParameter.fromJson(filterSearchParameter)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get filter Search Parameter list by user.',
				{ cause: error }
			);
		}
	}

	async getByRolePermissions(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		let filterSearchParameterListQuery = `
      SELECT DISTINCT filterSearchParameter.*
      FROM "filter_search_parameters" filterSearchParameter
      LEFT JOIN "filter_search_parameter_roles" filterSearchParameterRole ON filterSearchParameter.id = filterSearchParameterRole."filterSearchParameterId"
      WHERE filterSearchParameter."isPublic" = true
        OR filterSearchParameterRole."roleId" = :roleId
      ORDER BY filterSearchParameter."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			filterSearchParameterListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const filterSearchParameterList = (await this.adapter.executeQuery(
				filterSearchParameterListQuery,
				{ roleId: roleId }
			)) as Object[];

			return filterSearchParameterList.map((filterSearchParameter) =>
				FilterSearchParameter.fromJson(filterSearchParameter)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get filter Search Parameter list by role.',
				{ cause: error }
			);
		}
	}

	async getAccessible(
		userId: number,
		roleIdList: number[],
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]> {
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verificar se o usuário existe
		const user = await userRepository.findById(userId);

		if (!user || user.id == undefined) {
			throw new NotFoundError('USER_NOT_FOUND', {
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

		let filterSearchParameterListQuery = `
      SELECT DISTINCT filterSearchParameter.*
      FROM "filter_search_parameters" filterSearchParameter
      LEFT JOIN "filter_search_parameter_users" filterSearchParameterUser ON filterSearchParameter.id = filterSearchParameterUser."filterSearchParameterId"
      LEFT JOIN "filter_search_parameter_roles" filterSearchParameterRole ON filterSearchParameter.id = filterSearchParameterRole."filterSearchParameterId"
      WHERE filterSearchParameter."isPublic" = true
        OR filterSearchParameterUser."userId" = :userId
        OR filterSearchParameterRole."roleId" IN (:roleIdList)
      ORDER BY filterSearchParameter."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			filterSearchParameterListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const filterSearchParameterList = (await this.adapter.executeQuery(
				filterSearchParameterListQuery,
				{ userId: user.id, roleIdList: safeRoleIdList }
			)) as Object[];

			return filterSearchParameterList.map((filterSearchParameter) =>
				FilterSearchParameter.fromJson(filterSearchParameter)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get filter Search Parameter list.',
				{ cause: error }
			);
		}
	}

	async getAccessibleByUserIdentityProviderUID(
		className: string,
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<FilterSearchParameter[]> {
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

		let filterSearchParameterListQuery = `
      SELECT DISTINCT filterSearchParameter.*
      FROM "filter_search_parameters" filterSearchParameter
      LEFT JOIN "filter_search_parameter_users" filterSearchParameterUser ON filterSearchParameter.id = filterSearchParameterUser."filterSearchParameterId"
      LEFT JOIN "filter_search_parameter_roles" filterSearchParameterRole ON filterSearchParameter.id = filterSearchParameterRole."filterSearchParameterId"
      WHERE filterSearchParameter."className" = :className
        AND (    
          filterSearchParameter."isPublic" = true
          OR filterSearchParameterUser."userId" = :userId
          OR filterSearchParameterRole."roleId" IN (:roleIdList)
        )
      ORDER BY filterSearchParameter."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			filterSearchParameterListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const filterSearchParameterList = (await this.adapter.executeQuery(
				filterSearchParameterListQuery,
				{ className: className, userId: user.id, roleIdList: safeRoleIdList }
			)) as Object[];

			return filterSearchParameterList.map((filterSearchParameter) =>
				FilterSearchParameter.fromJson(filterSearchParameter)
			);
		} catch (error) {
			console.log(error);
			throw new InternalServerError(
				'Error to get filter Search Parameter list.',
				{ cause: error }
			);
		}
	}

	async getCountAccessibleByUserIdentityProviderUID(
		className: string,
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

		const filterSearchParameterCountQuery = `
      SELECT COUNT(DISTINCT filterSearchParameter.id) as total
      FROM "filter_search_parameters" filterSearchParameter
      LEFT JOIN "filter_search_parameter_users" filterSearchParameterUser ON filterSearchParameter.id = filterSearchParameterUser."filterSearchParameterId"
      LEFT JOIN "filter_search_parameter_roles" filterSearchParameterRole ON filterSearchParameter.id = filterSearchParameterRole."filterSearchParameterId"
      WHERE filterSearchParameter."className" = :className
        AND (    
          filterSearchParameter."isPublic" = true
          OR filterSearchParameterUser."userId" = :userId
          OR filterSearchParameterRole."roleId" IN (:roleIdList)
        )
    `;

		try {
			const filterSearchParameterCountResult = (await this.adapter.executeQuery(
				filterSearchParameterCountQuery,
				{ className: className, userId: user.id, roleIdList: safeRoleIdList }
			)) as any[];

			const filterSearchParameterCount = parseInt(
				filterSearchParameterCountResult[0]?.total || '0',
				10
			);
			return filterSearchParameterCount;
		} catch (error) {
			console.log(error);
			throw new InternalServerError(
				'Error to get filter Search Parameter count.',
				{ cause: error }
			);
		}
	}
}
