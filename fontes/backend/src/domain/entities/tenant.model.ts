import { BaseResourceModel } from './baseResource.model';
import { User } from './user.model';

export interface ITenantDatabaseModel extends BaseResourceModel {
	name?: string;
	ownerUserId?: number;
}

export interface ITenant extends BaseResourceModel {
	name: string;
	ownerUser: User | number;
}

export class Tenant extends BaseResourceModel implements ITenant {
	name: string;
	ownerUser: User | number;

	constructor(data: ITenant) {
		super();
		this.id = data.id;
		this.name = data.name;
		this.ownerUser = data.ownerUser;
	}

	static fromJson(jsonData: ITenant): Tenant {
		return new Tenant(jsonData);
	}
}