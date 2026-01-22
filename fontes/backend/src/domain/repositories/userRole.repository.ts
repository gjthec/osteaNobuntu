import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import { IUserRoleDatabaseModel, UserRole } from '../entities/userRole.model';
import BaseRepository from './base.repository';

export default class UserRoleRepository extends BaseRepository<
	IUserRoleDatabaseModel,
	UserRole
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<IUserRoleDatabaseModel, UserRole> =
			createDbAdapter<IUserRoleDatabaseModel, UserRole>(
				tenantConnection.models!.get('UserRole'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				UserRole.fromJson
			);
		super(_adapter, tenantConnection);
	}
}