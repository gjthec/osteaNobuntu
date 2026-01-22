import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	IFilterSearchParameterRoleDatabaseModel,
	FilterSearchParameterRole
} from '../entities/filterSearchParameterRole.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class FilterSearchParameterRoleRepository extends BaseRepository<
	IFilterSearchParameterRoleDatabaseModel,
	FilterSearchParameterRole
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IFilterSearchParameterRoleDatabaseModel,
			FilterSearchParameterRole
		> = createDbAdapter<
			IFilterSearchParameterRoleDatabaseModel,
			FilterSearchParameterRole
		>(
			tenantConnection.models!.get('FilterSearchParameterRole'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			FilterSearchParameterRole.fromJson
		);
		super(_adapter, tenantConnection);
	}
}
