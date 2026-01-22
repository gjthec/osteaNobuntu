import { TenantConnection } from '../../../../domain/entities/tenantConnection.model';
import {
	User,
	IUserDatabaseModel
} from '../../../../domain/entities/user.model';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { IDatabaseAdapter } from '../../IDatabase.adapter';

export class UserRepositoryMongoose implements IUserRepository {
	constructor(
		private tenantConnection: TenantConnection,
		private adapter: IDatabaseAdapter<IUserDatabaseModel, User>
	) {}

	getByRoleId(
		roleId: number,
		pageSize?: number,
		page?: number
	): Promise<User[]> {
		throw new Error('Method not implemented.');
	}
}
