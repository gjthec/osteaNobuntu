import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import { IUserDatabaseModel, User } from '../entities/user.model';
import BaseRepository from './base.repository';
import { InternalServerError } from '../../errors/internal.error';
import { UserRepositorySequelize } from '../../infra/database/sequelize/repositories/user.repository';
import { UserRepositoryMongoose } from '../../infra/database/mongoose/repositories/user.repository';

export interface IUserRepository {
	/**
	 * Obtem uma lista de usuários com base no identificador da Role
	 * @param userId Indetificador da Role
	 * @param pageSize Quantidade de registros retornados por página
	 * @param page Qual pagina está sendo apresentada
	 */
	getByRoleId(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<User[]>;
}

export default class UserRepository extends BaseRepository<
	IUserDatabaseModel,
	User
> {

	advancedSearches: IUserRepository;

	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<IUserDatabaseModel, User> =
			createDbAdapter<IUserDatabaseModel, User>(
				tenantConnection.models!.get('User'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				User.fromJson
			);
		super(_adapter, tenantConnection);

		if (tenantConnection.databaseType === 'mongodb') {
			this.advancedSearches = new UserRepositoryMongoose(
				this.tenantConnection,
				this.adapter
			);
		} else {
			this.advancedSearches = new UserRepositorySequelize(
				this.tenantConnection,
				this.adapter
			);
		}
	}

	async isUserAdminByIdentityProviderUID(
		_identityProviderUID: string
	): Promise<boolean> {
		try {
			const user = await this.adapter.findOne({
				identityProviderUID: _identityProviderUID
			});

			if (user != null && user.isAdministrator != null) {
				//Se o usuário é administrador
				if (user.isAdministrator == true) {
					return true;
				}
			}
			return false;
		} catch (error) {
			throw new InternalServerError(
				'Error to check if user is Admin by identity Provider UID.',
				{ cause: error }
			);
		}
	}

	async isUserAdminById(userId: number): Promise<boolean> {
		try {
			const user = await this.adapter.findById(userId);

			if (user != null && user.isAdministrator != null) {
				//Se o usuário é administrador
				if (user.isAdministrator == true) {
					return true;
				}
			}

			return false;
		} catch (error) {
			throw new InternalServerError('Error to check if user is Admin.', {
				cause: error
			});
		}
	}

	async hasRegisteredUser(): Promise<boolean> {
		try {
			const usersCount: number = await this.adapter.getCount();

			if (usersCount > 0) {
				return true;
			}

			return false;
		} catch (error) {
			throw new InternalServerError(
				'Error to check if application has registered Users.',
				{ cause: error }
			);
		}
	}
}
