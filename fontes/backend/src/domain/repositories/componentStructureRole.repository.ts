import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	IComponentStructureRoleDatabaseModel,
	ComponentStructureRole
} from '../entities/componentStructureRole.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class ComponentStructureRoleRepository extends BaseRepository<
	IComponentStructureRoleDatabaseModel,
	ComponentStructureRole
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IComponentStructureRoleDatabaseModel,
			ComponentStructureRole
		> = createDbAdapter<
			IComponentStructureRoleDatabaseModel,
			ComponentStructureRole
		>(
			tenantConnection.models!.get('ComponentStructureRole'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			ComponentStructureRole.fromJson
		);
		super(_adapter, tenantConnection);
	}
}