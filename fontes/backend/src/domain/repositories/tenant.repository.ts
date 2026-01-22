import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { ITenantDatabaseModel, Tenant } from '../entities/tenant.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class TenantRepository extends BaseRepository<
	ITenantDatabaseModel,
	Tenant
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<ITenantDatabaseModel, Tenant> =
			createDbAdapter<ITenantDatabaseModel, Tenant>(
				tenantConnection.models!.get('Tenant'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				Tenant.fromJson
			);
		super(_adapter, tenantConnection);
	}
}