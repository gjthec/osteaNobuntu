import { Op, Transaction } from 'sequelize';
import {
	DatabaseCredential,
	IDatabaseCredential,
	IDatabaseCredentialDatabaseModel
} from '../../../../domain/entities/databaseCredential.model';
import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import DatabaseCredentialRepository, {
	IDatabaseCredentialRepository
} from '../../../../domain/repositories/databaseCredential.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';
import { ForbiddenError, NotFoundError } from '../../../../errors/client.error';
import { InternalServerError } from '../../../../errors/internal.error';
import { DatabaseCredentialRole } from '../../../../domain/entities/databaseCredentialRole.model';
import UserRepository from '../../../../domain/repositories/user.repository';
import DatabaseCredentialUserRepository from '../../../../domain/repositories/databaseCredentialUser.repository';
import { UserAccess } from '../../../../domain/services/ItenantConnection.service';
import RoleRepository from '../../../../domain/repositories/role.repository';
import { Role } from '../../../../domain/entities/role.model';
import UserRoleRepository from '../../../../domain/repositories/userRole.repository';
import DatabaseCredentialRoleRepository from '../../../../domain/repositories/databaseCredentialRole.repository';
import { User } from '../../../../domain/entities/user.model';

export class DatabaseCredentialRepositorySequelize
	implements IDatabaseCredentialRepository
{
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<
			IDatabaseCredentialDatabaseModel,
			DatabaseCredential
		>
	) {}

	async create(
		databaseCredential: IDatabaseCredential,
		userId: number
	): Promise<DatabaseCredential> {
		const databaseCredentialRepository: DatabaseCredentialRepository =
			new DatabaseCredentialRepository(this.tenantConnection);

		const transaction = await databaseCredentialRepository.startTransaction();

		try {
			const userRepository: UserRepository = new UserRepository(
				this.tenantConnection
			);
			//Verificar se o usuário existe
			const user = await userRepository.findById(userId);

			if (!user) {
				throw new NotFoundError('NOT_FOUND', { cause: "User don't exist." });
			}

			const newDatabaseCredential =
				await databaseCredentialRepository.createWithTransaction(
					databaseCredential,
					transaction
				);

			const databaseCredentialUserRepository: DatabaseCredentialUserRepository =
				new DatabaseCredentialUserRepository(this.tenantConnection);

			const newDatabaseCredentialUser =
				await databaseCredentialUserRepository.createWithTransaction(
					{
						databaseCredentialId: newDatabaseCredential.id,
						accessLevel: 'owner',
						userId: user.id
					},
					transaction
				);

			await databaseCredentialRepository.commitTransaction(transaction);

			return DatabaseCredential.fromJson(newDatabaseCredential);
		} catch (error) {
			await databaseCredentialRepository.rollbackTransaction(transaction);

			throw new InternalServerError(
				'Error to create a new DatabaseCredential.',
				{ cause: error }
			);
		}
	}

	async delete(
		databaseCredentialId: number,
		userId: number
	): Promise<DatabaseCredential> {
		const databaseCredentialRepository: DatabaseCredentialRepository =
			new DatabaseCredentialRepository(this.tenantConnection);

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

			const databaseCredentialUserRepository: DatabaseCredentialUserRepository =
				new DatabaseCredentialUserRepository(this.tenantConnection);

			const removedDatabaseCredentialUserList =
				await databaseCredentialUserRepository.deleteManyWithTransaction(
					{
						databaseCredentialId: databaseCredentialId,
						userId: userId,
						accessLevel: 'owner'
					},
					transaction
				);

			//Caso o usuário tem permissão para remover o filtro por ter uma role/permissão que dê nível de acesso como dono, ele poderá remover
			const isUserAllowedToDeleteByRole =
				await this.isUserAllowedToDeleteByRole(databaseCredentialId, userId);
			if (isUserAllowedToDeleteByRole == true) {
				const databaseCredentialRoleRepository: DatabaseCredentialRoleRepository =
					new DatabaseCredentialRoleRepository(this.tenantConnection);

				const removedDatabaseCredentialRoleList: DatabaseCredentialRole[] =
					await databaseCredentialRoleRepository.deleteManyWithTransaction(
						{
							databaseCredentialId: databaseCredentialId
						},
						transaction
					);
			}

			if (
				removedDatabaseCredentialUserList.length == 1 ||
				isUserAllowedToDeleteByRole == true
			) {
				const databaseCredential = await this.adapter.deleteWithTransaction(
					databaseCredentialId,
					transaction
				);

				await databaseCredentialRepository.commitTransaction(transaction);

				return DatabaseCredential.fromJson(databaseCredential);
			} else {
				throw new ForbiddenError('FORBIDDEN');
			}
		} catch (error) {
			await databaseCredentialRepository.rollbackTransaction(transaction);

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

	async isUserAllowedToDeleteByRole(
		databaseCredentialId: number,
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
		const databaseCredentialListQuery = `
      SELECT DISTINCT databaseCredentials.*
      FROM "database_credentials" databaseCredentials
      LEFT JOIN "database_credential_roles" databaseCredentialRole ON databaseCredentials.id = databaseCredentialRole."databaseCredentialId"
      WHERE databaseCredentials."id" = ${databaseCredentialId}
        OR databaseCredentialRole."roleId" IN (${safeRoleIdList})
      ORDER BY databaseCredentials."createdAt" DESC
    `;

		try {
			const databaseCredentialList = (await this.adapter.executeQuery(
				databaseCredentialListQuery
			)) as IDatabaseCredential[];

			const _databaseCredentialList = databaseCredentialList.map(
				(databaseCredential) => DatabaseCredential.fromJson(databaseCredential)
			);

			if (_databaseCredentialList && _databaseCredentialList.length == 0) {
				return false;
			}

			return true;
		} catch (error) {
			throw new InternalServerError(
				'Error to check if user has permission to delete DatabaseCredential by User id.',
				{ cause: error }
			);
		}
	}

	async setUserPermissionForDatabaseCredential(
		permissionGiverId: number,
		permissionReceiverId: number,
		databaseCredentialId: number,
		accessLevel: string
	): Promise<DatabaseCredential> {
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

		//Verifica se o databaseCredential existe
		const databaseCredential = await this.adapter.findOne({
			id: databaseCredentialId
		});

		if (!databaseCredential || databaseCredential.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "DatabaseCredential don't exist."
			});
		}

		//Verifica se o usuário pode dar permissão para outros
		const databaseCredentialList = await this.getByOwner(permissionGiverId);
		const filtredDatabaseCredential = databaseCredentialList.filter(
			(databaseCredential) => databaseCredential.id == databaseCredentialId
		);

		if (filtredDatabaseCredential.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this databaseCredential."
			});
		}

		//Faz a operação de dar permissão para outro usuário no databaseCredential
		const databaseCredentialUserRepository: DatabaseCredentialUserRepository =
			new DatabaseCredentialUserRepository(this.tenantConnection);

		await databaseCredentialUserRepository.create({
			userId: permissionReceiverId,
			databaseCredentialId: databaseCredentialId,
			accessLevel: accessLevel
		});

		return databaseCredential;
	}

	async setRolePermissionForDatabaseCredential(
		permissionGiverId: number,
		roleId: number,
		databaseCredentialId: number,
		accessLevel: string
	): Promise<DatabaseCredential> {
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

		//Verifica se o databaseCredential existe
		const databaseCredential = await this.adapter.findOne({
			id: databaseCredentialId
		});

		if (!databaseCredential || databaseCredential.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "DatabaseCredential don't exist."
			});
		}

		//Verifica se o usuário pode dar permissão
		const databaseCredentialList = await this.getByOwner(permissionGiverId);
		const filtredDatabaseCredential = databaseCredentialList.filter(
			(databaseCredential) => databaseCredential.id == databaseCredentialId
		);

		if (filtredDatabaseCredential.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this databaseCredential."
			});
		}

		//Faz a operação de dar permissão para Role no databaseCredential
		const databaseCredentialRoleRepository: DatabaseCredentialRoleRepository =
			new DatabaseCredentialRoleRepository(this.tenantConnection);

		await databaseCredentialRoleRepository.create({
			roleId: roleId,
			databaseCredentialId: databaseCredentialId,
			accessLevel: accessLevel
		});

		return databaseCredential;
	}

	async removeUserPermissionForDatabaseCredential(
		permissionRemoverId: number,
		permissionRevokeeId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential> {
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

		//Verifica se o databaseCredential existe
		const databaseCredential = await this.adapter.findOne({
			id: databaseCredentialId
		});

		if (!databaseCredential || databaseCredential.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "DatabaseCredential don't exist."
			});
		}

		//Verifica se o usuário pode alterar permissão para outros
		const databaseCredentialList = await this.getByOwner(permissionRemoverId);
		const filtredDatabaseCredential = databaseCredentialList.filter(
			(databaseCredential) => databaseCredential.id == databaseCredentialId
		);

		if (filtredDatabaseCredential.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this databaseCredential."
			});
		}

		//Faz a operação de remover permissão de outro usuário no databaseCredential
		const databaseCredentialUserRepository: DatabaseCredentialUserRepository =
			new DatabaseCredentialUserRepository(this.tenantConnection);

		const databaseCredentialUser =
			await databaseCredentialUserRepository.findOne({
				userId: permissionRevokeeId,
				databaseCredentialId: databaseCredentialId
			});

		if (!databaseCredentialUser || databaseCredentialUser.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "DatabaseCredentialUser don't exist."
			});
		}

		await databaseCredentialUserRepository.delete(databaseCredentialUser.id);

		return databaseCredential;
	}

	async removeRolePermissionForDatabaseCredential(
		permissionRemoverId: number,
		roleId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential> {
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

		//Verifica se o databaseCredential existe
		const databaseCredential = await this.adapter.findOne({
			id: databaseCredentialId
		});

		if (!databaseCredential || databaseCredential.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "DatabaseCredential don't exist."
			});
		}

		//Verifica se o usuário pode alterar permissão para outros
		const databaseCredentialList = await this.getByOwner(permissionRemoverId);
		const filtredDatabaseCredential = databaseCredentialList.filter(
			(databaseCredential) => databaseCredential.id == databaseCredentialId
		);

		if (filtredDatabaseCredential.length == 0) {
			throw new ForbiddenError('FORBIDDEN', {
				cause: "User don't have permission to manage this databaseCredential."
			});
		}

		//Faz a operação de remover permissão de outro usuário no databaseCredential
		const databaseCredentialRoleRepository: DatabaseCredentialRoleRepository =
			new DatabaseCredentialRoleRepository(this.tenantConnection);

		const databaseCredentialRole =
			await databaseCredentialRoleRepository.findOne({
				roleId: roleId,
				databaseCredentialId: databaseCredentialId
			});

		if (!databaseCredentialRole || databaseCredentialRole.id == undefined) {
			throw new NotFoundError('NOT_FOUND', {
				cause: "DatabaseCredentialRole don't exist."
			});
		}

		await databaseCredentialRoleRepository.delete(databaseCredentialRole.id);

		return databaseCredential;
	}

	async getByOwner(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		//Pesquisar pelo User e ver se está como dono (owner) do filtro
		let databaseCredentialListQuery = `
      SELECT DISTINCT databaseCredentials.*
      FROM "database_credentials" databaseCredentials
      LEFT JOIN "database_credential_users" databaseCredentialUser ON databaseCredentials.id = databaseCredentialUser."databaseCredentialId"
      WHERE databaseCredentialUser."userId" = ${userId}
        AND databaseCredentialUser."accessLevel" = "owner"
      ORDER BY databaseCredentials."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			databaseCredentialListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const databaseCredentialList = (await this.adapter.executeQuery(
				databaseCredentialListQuery
			)) as IDatabaseCredential[];

			return databaseCredentialList.map((databaseCredential) =>
				DatabaseCredential.fromJson(databaseCredential)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get filter Database credential list by owner.',
				{ cause: error }
			);
		}
	}

	async getPublic(
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
		const databaseCredentialList = await this.adapter.findMany(
			{
				isPublic: true
			},
			pageSize,
			page
		);

		const formattedData = databaseCredentialList.map((f: any) =>
			f.get({ plain: true })
		);

		return formattedData.map((databaseCredential) =>
			DatabaseCredential.fromJson(databaseCredential)
		);
	}

	async getByUserPermissions(
		userId: number,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		let databaseCredentialListQuery = `
      SELECT DISTINCT databaseCredentials.*
      FROM "database_credentials" databaseCredentials
      LEFT JOIN "database_credential_users" databaseCredentialUser ON databaseCredentials.id = databaseCredentialUser."databaseCredentialId"
      WHERE databaseCredentials."isPublic" = true
        OR databaseCredentialUser."userId" = ${userId}
      ORDER BY databaseCredentials."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			databaseCredentialListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const databaseCredentialList = (await this.adapter.executeQuery(
				databaseCredentialListQuery
			)) as IDatabaseCredential[];

			return databaseCredentialList.map((databaseCredential) =>
				DatabaseCredential.fromJson(databaseCredential)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get filter Database credential list by user.',
				{ cause: error }
			);
		}
	}

	async getByRolePermissions(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		let databaseCredentialListQuery = `
      SELECT DISTINCT databaseCredentials.*
      FROM "database_credentials" databaseCredentials
      LEFT JOIN "database_credential_roles" databaseCredentialRole ON databaseCredentials.id = databaseCredentialRole."databaseCredentialId"
      WHERE databaseCredentials."isPublic" = true
        OR databaseCredentialRole."roleId" = ${roleId}
      ORDER BY databaseCredentials."createdAt" DESC
    `;

		if (options.limit !== undefined) {
			databaseCredentialListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const databaseCredentialList = (await this.adapter.executeQuery(
				databaseCredentialListQuery
			)) as IDatabaseCredential[];

			return databaseCredentialList.map((databaseCredential) =>
				DatabaseCredential.fromJson(databaseCredential)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get filter Database credential list by role.',
				{ cause: error }
			);
		}
	}

	async getAccessible(
		userId: number,
		roleIdList: number[],
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
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

		let databaseCredentialListQuery = `
        SELECT DISTINCT databaseCredentials.*
        FROM "database_credentials" databaseCredentials
        LEFT JOIN "database_credential_users" databaseCredentialUser ON databaseCredentials.id = databaseCredentialUser."databaseCredentialId"
        LEFT JOIN "database_credential_roles" databaseCredentialRole ON databaseCredentials.id = databaseCredentialRole."databaseCredentialId"
        WHERE databaseCredentials."isPublic" = true
          OR databaseCredentialUser."userId" = ${user.id}
          OR databaseCredentialRole."roleId" IN (${safeRoleIdList})
        ORDER BY databaseCredentials."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			databaseCredentialListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const databaseCredentialList = (await this.adapter.executeQuery(
				databaseCredentialListQuery
			)) as IDatabaseCredential[];

			return databaseCredentialList.map((databaseCredential) =>
				DatabaseCredential.fromJson(databaseCredential)
			);
		} catch (error) {
			throw new InternalServerError('Error to get database credential list.', {
				cause: error
			});
		}
	}

	async getAccessibleByUserIdentityProviderUID(
		identityProviderUID: string,
		pageSize?: number,
		page?: number
	): Promise<DatabaseCredential[]> {
		console.log(
			'DatabaseCredentialRepository: getAccessibleByUserIdentityProviderUID start',
			{
				identityProviderUID,
				pageSize,
				page
			}
		);
		const userRepository: UserRepository = new UserRepository(
			this.tenantConnection
		);

		//Verificar se o usuário existe
		const user = await userRepository.findOne({
			identityProviderUID: identityProviderUID
		});

		if (!user || user.id == undefined) {
			console.error(
				'DatabaseCredentialRepository: user not found for identityProviderUID',
				identityProviderUID
			);
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

		let databaseCredentialListQuery = `
        SELECT DISTINCT databaseCredentials.*
        FROM "database_credentials" databaseCredentials
        LEFT JOIN "database_credential_users" databaseCredentialUser ON databaseCredentials.id = databaseCredentialUser."databaseCredentialId"
        LEFT JOIN "database_credential_roles" databaseCredentialRole ON databaseCredentials.id = databaseCredentialRole."databaseCredentialId"
        WHERE databaseCredentials."isPublic" = true
          OR databaseCredentialUser."userId" = ${user.id}
          OR databaseCredentialRole."roleId" IN (${safeRoleIdList})
        ORDER BY databaseCredentials."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			databaseCredentialListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const databaseCredentialList = (await this.adapter.executeQuery(
				databaseCredentialListQuery
			)) as IDatabaseCredential[];

			console.log(
				'DatabaseCredentialRepository: getAccessibleByUserIdentityProviderUID success',
				{
					count: databaseCredentialList.length
				}
			);
			return databaseCredentialList.map((databaseCredential) =>
				DatabaseCredential.fromJson(databaseCredential)
			);
		} catch (error) {
			console.error(
				'DatabaseCredentialRepository: getAccessibleByUserIdentityProviderUID failed',
				error
			);
			throw new InternalServerError('Error to get database credential list.', {
				cause: error
			});
		}
	}

	async getUserAccessList(): Promise<UserAccess[]> {
		const databaseCredentialList = await this.tenantConnection
			.models!.get('DatabaseCredential')
			.findAll({
				include: [
					{
						model: this.tenantConnection.models!.get('User'),
						as: 'user',
						required: false
					}
				],
				where: {
					[Op.or]: [{ isPublic: true }]
				}
			});

		const formattedData = databaseCredentialList.map((f: any) =>
			f.get({ plain: true })
		);

		const userAccessList: UserAccess[] = formattedData.map(
			(databaseCredential: any) => ({
				userId: databaseCredential.user.id,
				identityProviderUID: databaseCredential.user.indentityProviderUID,
				databaseCredentialId: databaseCredential.id,
				isPublic: databaseCredential.isPublic
			})
		);

		return userAccessList;
	}

	async changeDatabaseOwner(
		oldOwnerUserId: number,
		newOwnerUserId: number,
		databaseCredentialId: number
	): Promise<DatabaseCredential> {
		const databaseCredentialRepository: DatabaseCredentialRepository =
			new DatabaseCredentialRepository(this.tenantConnection);

		const transaction = await databaseCredentialRepository.startTransaction();

		try {
			const userRepository: UserRepository = new UserRepository(
				this.tenantConnection
			);

			//Verifica se quem irá dar permissão existe
			const permissionGiver = await userRepository.findById(oldOwnerUserId);

			if (!permissionGiver || permissionGiver.id == undefined) {
				throw new NotFoundError('USER_NOT_FOUND', {
					cause: "User don't exist."
				});
			}

			//Verifica se o quem irá receber a permissão existe
			const permissionReceiver = await userRepository.findById(newOwnerUserId);

			if (!permissionReceiver || permissionReceiver.id == undefined) {
				throw new NotFoundError('USER_NOT_FOUND', {
					cause: "User don't exist."
				});
			}

			//Verifica se o databaseCredential existe
			const databaseCredential = await this.adapter.findOne({
				id: databaseCredentialId
			});

			if (!databaseCredential || databaseCredential.id == undefined) {
				throw new NotFoundError('NOT_FOUND', {
					cause: "DatabaseCredential don't exist."
				});
			}

			//Verifica se o usuário pode dar permissão para outros
			const databaseCredentialList = await this.getByOwner(oldOwnerUserId);
			const filtredDatabaseCredential = databaseCredentialList.filter(
				(databaseCredential) => databaseCredential.id == databaseCredentialId
			);

			if (filtredDatabaseCredential.length == 0) {
				throw new ForbiddenError('FORBIDDEN', {
					cause: "User don't have permission to manage this databaseCredential."
				});
			}

			//Faz a operação de dar permissão para outro usuário no databaseCredential
			const databaseCredentialUserRepository: DatabaseCredentialUserRepository =
				new DatabaseCredentialUserRepository(this.tenantConnection);

			//Encontra a antiga associação do antigo dono com o databaseCredential
			const oldDatabaseCredentialUser =
				await databaseCredentialUserRepository.findOne({
					userId: oldOwnerUserId,
					databaseCredentialId: databaseCredentialId,
					accessLevel: 'owner'
				});

			//Remove associação do dono antigo com o databaseCredential
			await databaseCredentialUserRepository.deleteWithTransaction(
				oldDatabaseCredentialUser!.id!,
				transaction
			);

			//Cria a associação do dono novo com o databaseCredential
			await databaseCredentialUserRepository.createWithTransaction(
				{
					userId: newOwnerUserId,
					databaseCredentialId: databaseCredentialId,
					accessLevel: 'owner'
				},
				transaction
			);

			await databaseCredentialRepository.commitTransaction(transaction);

			return databaseCredential;
		} catch (error) {
			await databaseCredentialRepository.rollbackTransaction(transaction);

			throw error;
		}
	}

	async getUserAccessListByDatabaseCredentialId(
		databaseCredentialId: number,
		pageSize?: number,
		page?: number
	): Promise<User[]> {
		const options: any = {
			order: [['createdAt', 'DESC']]
		};

		if (pageSize !== undefined && page !== undefined) {
			options.limit = pageSize;
			options.offset = page;
		}

		let databaseCredentialUserAccessListQuery = `
        SELECT 
          users.*
        FROM "database_credentials" databaseCredentials
        CROSS JOIN "users" users
        LEFT JOIN "database_credential_users" databaseCredentialUser 
          ON databaseCredentials.id = databaseCredentialUser."databaseCredentialId"
          AND users.id = databaseCredentialUser."userId"
        LEFT JOIN "database_credential_roles" databaseCredentialRole 
          ON databaseCredentials.id = databaseCredentialRole."databaseCredentialId"
        WHERE databaseCredentials.id = :databaseCredentialId
          AND (
            databaseCredentials."isPublic" = true
            OR databaseCredentialUser."userId" IS NOT NULL
          )
        ORDER BY databaseCredentials."createdAt" DESC
      `;

		if (options.limit !== undefined) {
			databaseCredentialUserAccessListQuery += ` LIMIT ${options.limit} OFFSET ${options.offset}`;
		}

		try {
			const databaseCredentialUserAccessList = (await this.adapter.executeQuery(
				databaseCredentialUserAccessListQuery,
				{ databaseCredentialId: databaseCredentialId }
			)) as Object[];

			return databaseCredentialUserAccessList.map(
				(databaseCredentialUserAccess) =>
					User.fromJson(databaseCredentialUserAccess)
			);
		} catch (error) {
			throw new InternalServerError(
				'Error to get database credential user list.',
				{ cause: error }
			);
		}
	}
}
