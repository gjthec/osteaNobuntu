import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	DatabaseCredentialUser,
	IDatabaseCredentialUserDatabaseModel
} from '../entities/databaseCredentialUser.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class DatabaseCredentialUserRepository extends BaseRepository<
	IDatabaseCredentialUserDatabaseModel,
	DatabaseCredentialUser
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IDatabaseCredentialUserDatabaseModel,
			DatabaseCredentialUser
		> = createDbAdapter<
			IDatabaseCredentialUserDatabaseModel,
			DatabaseCredentialUser
		>(
			tenantConnection.models!.get('DatabaseCredentialUser'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			DatabaseCredentialUser.fromJson
		);
		super(_adapter, tenantConnection);
	}
}
