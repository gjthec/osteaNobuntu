import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';
import { File, IFileDatabaseModel } from '../entities/file.model';

export default class FileRepository extends BaseRepository<
	IFileDatabaseModel,
	File
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<IFileDatabaseModel, File> =
			createDbAdapter<IFileDatabaseModel, File>(
				tenantConnection.models!.get('File'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				File.fromJson
			);
		super(_adapter, tenantConnection);
	}
}