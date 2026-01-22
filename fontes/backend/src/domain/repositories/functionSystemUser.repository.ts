import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	IFunctionSystemUserDatabaseModel,
	FunctionSystemUser
} from '../entities/functionSystemUser.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class FunctionSystemUserRepository extends BaseRepository<
	IFunctionSystemUserDatabaseModel,
	FunctionSystemUser
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IFunctionSystemUserDatabaseModel,
			FunctionSystemUser
		> = createDbAdapter<IFunctionSystemUserDatabaseModel, FunctionSystemUser>(
			tenantConnection.models!.get('FunctionSystemUser'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			FunctionSystemUser.fromJson
		);
		super(_adapter, tenantConnection);
	}
}
