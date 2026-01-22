import { BaseResourceModel } from './baseResource.model';
import { FilterSearchParameter } from './filterSearchParameter.model';

export interface IFilterSearchParameterUserDatabaseModel
	extends BaseResourceModel {
	filterSearchParameterId?: number;
	userId?: number;
	accessLevel?: string;
}

export interface IFilterSearchParameterUser extends BaseResourceModel {
	filterSearchParameter?: FilterSearchParameter;
	userId?: number;
	accessLevel?: string;
}

export class FilterSearchParameterUser extends BaseResourceModel {
	filterSearchParameter?: FilterSearchParameter;
	userId?: number;
	accessLevel?: string;

	constructor(data: IFilterSearchParameterUser) {
		super();
		this.id = data.id;
		this.filterSearchParameter = data.filterSearchParameter;
		this.userId = data.userId;
		this.accessLevel = data.accessLevel;
	}

	static fromJson(jsonData: IFilterSearchParameterUser): FilterSearchParameterUser {
		return new FilterSearchParameterUser(jsonData);
	}
}
