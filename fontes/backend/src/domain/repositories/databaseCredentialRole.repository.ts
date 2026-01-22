import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	DatabaseCredentialRole,
	IDatabaseCredentialRoleDatabaseModel
} from '../entities/databaseCredentialRole.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class DatabaseCredentialRoleRepository extends BaseRepository<
	IDatabaseCredentialRoleDatabaseModel,
	DatabaseCredentialRole
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IDatabaseCredentialRoleDatabaseModel,
			DatabaseCredentialRole
		> = createDbAdapter<
			IDatabaseCredentialRoleDatabaseModel,
			DatabaseCredentialRole
		>(
			tenantConnection.models!.get('DatabaseCredentialRole'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			DatabaseCredentialRole.fromJson
		);
		super(_adapter, tenantConnection);
	}
}
