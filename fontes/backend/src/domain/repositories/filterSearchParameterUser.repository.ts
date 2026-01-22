import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	FilterSearchParameterUser,
	IFilterSearchParameterUserDatabaseModel
} from '../entities/filterSearchParameterUser.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class FilterSearchParameterUserRepository extends BaseRepository<
	IFilterSearchParameterUserDatabaseModel,
	FilterSearchParameterUser
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IFilterSearchParameterUserDatabaseModel,
			FilterSearchParameterUser
		> = createDbAdapter<
			IFilterSearchParameterUserDatabaseModel,
			FilterSearchParameterUser
		>(
			tenantConnection.models!.get('FilterSearchParameterUser'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			FilterSearchParameterUser.fromJson
		);
		super(_adapter, tenantConnection);
	}
}
