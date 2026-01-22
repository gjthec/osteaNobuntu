import { BaseResourceModel } from './baseResource.model';

export interface IRoleDataBaseModel extends BaseResourceModel {
	name?: string;
}

export interface IRole extends BaseResourceModel {
	name?: string;
}

export class Role extends BaseResourceModel {
	name?: string;

	constructor(data: IRole) {
		super();
		this.id = data.id;
		this.name = data.name;
	}

	static fromJson(jsonData: IRole): Role {
		return new Role(jsonData);
	}
}
