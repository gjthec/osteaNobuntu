import { BaseResourceModel } from './baseResource.model';
import { File } from './file.model';
import { User } from './user.model';

export interface IFieldFileDatabaseModel extends BaseResourceModel {
	fieldType?: string;
	userId?: number;
	filesId?: number[];
}

export interface IFieldFile extends BaseResourceModel {
	fieldType?: string;
	user?: User;
	files?: File[];
}

export class FieldFile extends BaseResourceModel {
	fieldType?: string;
	user?: User;
	files?: File[]; //eager loading | lazy loading

	constructor(input: IFieldFile) {
		super();
		this.id = input.id;
		this.fieldType = input.fieldType;
		this.user = input.user;
		this.files = input.files;
	}

	static fromJson(jsonData: any): File {
		return new FieldFile(jsonData);
	}
}