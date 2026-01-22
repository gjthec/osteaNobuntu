import { BaseResourceModel } from './baseResource.model';

export interface IMenuConfigDatabaseModel extends BaseResourceModel {
	name?: string;
	type?: string;
}

export interface IMenuConfig extends BaseResourceModel {
	name?: string;
	type?: string;
}

export class MenuConfig extends BaseResourceModel {
	name?: string;
	type?: string;

	constructor(input: IMenuConfig) {
		super();
		this.id = input.id;
		this.name = input.name;
		this.type = input.type;
	}

	static fromJson(jsonData: IMenuConfig): MenuConfig {
		return new MenuConfig(jsonData);
	}
}
