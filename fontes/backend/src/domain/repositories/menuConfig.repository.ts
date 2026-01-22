import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';
import {
	IMenuConfigDatabaseModel,
	MenuConfig
} from '../entities/menuConfig.model';

export default class MenuConfigRepository extends BaseRepository<
	IMenuConfigDatabaseModel,
	MenuConfig
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<IMenuConfigDatabaseModel, MenuConfig> =
			createDbAdapter<IMenuConfigDatabaseModel, MenuConfig>(
				tenantConnection.models!.get('MenuConfig'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				MenuConfig.fromJson
			);
		super(_adapter, tenantConnection);
	}

	async get(): Promise<MenuConfig[]> {
		return await this.findMany({}, 100, 0);
	}
}