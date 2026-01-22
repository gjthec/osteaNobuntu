import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import {
	IFieldFileDatabaseModel,
	FieldFile
} from '../entities/fieldFile.model';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';

export default class FieldFileRepository extends BaseRepository<
	IFieldFileDatabaseModel,
	FieldFile
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<IFieldFileDatabaseModel, FieldFile> =
			createDbAdapter<IFieldFileDatabaseModel, FieldFile>(
				tenantConnection.models!.get('FieldFile'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				FieldFile.fromJson
			);
		super(_adapter, tenantConnection);
	}

	async upload(fieldFile: FieldFile): Promise<string> {
		if (this.tenantConnection.databaseType === 'mongodb') {
			throw new Error('Upload is not supported for MongoDB');
		}
		try {
			let files = fieldFile.files;
			fieldFile.files = [];
			return this.adapter.create(fieldFile).then((data) => {
				if (files) {
					for (let i = 0; i < files.length; i++) {
						files[i].fieldFile = data.id ? data.id : undefined;
					}
					const fileModel = this.tenantConnection.models?.get('file');
					if (fileModel) {
						fileModel.bulkCreate(files);
					}

					this.tenantConnection.models?.get('File');
				}
				return data.id ? data.id.toString() : '';
			});
		} catch (error) {
			throw error;
		}
	}

	async findAllFilesById(id: number): Promise<FieldFile> {
		try {
			const fieldFile = await this.adapter.findById(id);

			if (!fieldFile) {
				throw new Error(`FieldFile with id ${id} not found`);
			}

			const fileModel = this.tenantConnection.models?.get('File');

			if (fileModel) {
				const files = await fileModel.findAll({ where: { fieldFile: id } });
				fieldFile.files = files;
			}
			return fieldFile;
		} catch (error) {
			throw error;
		}
	}
}