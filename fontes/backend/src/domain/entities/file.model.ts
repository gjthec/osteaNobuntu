import { BaseResourceModel } from './baseResource.model';

export interface IFileDatabaseModel extends BaseResourceModel {
	name?: string;
	size?: number;
	extension?: string;
	dataBlob?: Blob;
	fieldFile?: number;
	mimeType?: string;
}

export interface IFile extends BaseResourceModel {
	name?: string;
	size?: number;
	extension?: string;
	dataBlob?: Blob;
	fieldFile?: number;
	mimeType?: string;
}

export class File extends BaseResourceModel {
	name?: string;
	size?: number;
	extension?: string;
	dataBlob?: Blob;
	fieldFile?: number;
	mimeType?: string;

	constructor(input: IFile) {
		super();
		this.id = input.id;
		this.size = input.size;
		this.extension = input.extension;
		this.dataBlob = input.dataBlob;
		this.fieldFile = input.fieldFile;
		this.mimeType = input.mimeType;
	}

	static fromJson(jsonData: IFile): File {
		return new File(jsonData);
	}
}